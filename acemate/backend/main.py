import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Load environment variables from .env
load_dotenv()

app = FastAPI(
    title="AceMate API",
    version="1.0.0"
)

# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-2.5-flash"
)

OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "phi3:latest"
)


# --------------------------------------------------
# REQUEST MODEL
# --------------------------------------------------

class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=10000
    )


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "AceMate backend is running!",
        "status": "online"
    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "gemini_configured": bool(GEMINI_API_KEY),
        "gemini_model": GEMINI_MODEL,
        "ollama_model": OLLAMA_MODEL
    }


# --------------------------------------------------
# GEMINI
# --------------------------------------------------

def ask_gemini(message: str) -> Optional[str]:

    if not GEMINI_API_KEY:
        print("ERROR: GEMINI_API_KEY is missing.")
        return None

    try:
        from google import genai

        client = genai.Client(
            api_key=GEMINI_API_KEY
        )

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=message
        )

        if response and response.text:
            return response.text

        print("Gemini returned an empty response.")
        return None

    except Exception as error:
        print(f"Gemini failed: {error}")
        return None


# --------------------------------------------------
# OLLAMA FALLBACK
# --------------------------------------------------

def ask_ollama(message: str) -> Optional[str]:

    try:
        import ollama

        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": message
                }
            ]
        )

        if response and "message" in response:
            return response["message"]["content"]

        return None

    except Exception as error:
        print(f"Ollama failed: {error}")
        return None


# --------------------------------------------------
# CHAT
# --------------------------------------------------

@app.post("/chat")
def chat(request: ChatRequest):

    message = request.message.strip()

    # Try Gemini first
    gemini_reply = ask_gemini(message)

    if gemini_reply:
        return {
            "reply": gemini_reply,
            "model": GEMINI_MODEL,
            "status": "success"
        }

    # If Gemini fails, try Ollama
    ollama_reply = ask_ollama(message)

    if ollama_reply:
        return {
            "reply": ollama_reply,
            "model": OLLAMA_MODEL,
            "status": "success"
        }

    # Both failed
    return {
        "reply": (
            "Sorry, AceMate is temporarily unable to "
            "generate a response. Please check the "
            "Gemini API key or Ollama setup."
        ),
        "model": None,
        "status": "error"
    }
