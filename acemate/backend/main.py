from datetime import datetime
from uuid import uuid4
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from google import genai
from openai import OpenAI

import ollama
from pymongo import MongoClient


# --------------------------------------------------
# APP
# --------------------------------------------------

app = FastAPI()


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# AI CLIENTS
# --------------------------------------------------

# Gemini
# Gemini disabled — using DeepSeek
# gemini_client = genai.Client()

# DeepSeek
deepseek_client = OpenAI(
    api_key=os.environ.get("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com"
)


# --------------------------------------------------
# MONGODB
# --------------------------------------------------

mongo_client = MongoClient("mongodb://localhost:27017/")
db = mongo_client["acemate"]

chats_collection = db["chats"]
messages_collection = db["messages"]


# --------------------------------------------------
# REQUEST MODEL
# --------------------------------------------------

class ChatRequest(BaseModel):
    message: str
    chat_id: str | None = None
    subject: str | None = None


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "AceMate backend is running!"
    }


# --------------------------------------------------
# GET CHAT MESSAGES
# --------------------------------------------------

@app.get("/chats/{chat_id}")
def get_chat_messages(chat_id: str):

    messages = list(
        messages_collection.find(
            {"chat_id": chat_id},
            {"_id": 0}
        ).sort("created_at", 1)
    )

    return {
        "chat_id": chat_id,
        "messages": messages
    }


# --------------------------------------------------
# DELETE CHAT
# --------------------------------------------------

@app.delete("/chats/{chat_id}")
def delete_chat(chat_id: str):

    chats_collection.delete_one({
        "chat_id": chat_id
    })

    messages_collection.delete_many({
        "chat_id": chat_id
    })

    return {
        "success": True,
        "message": "Chat deleted successfully."
    }


# --------------------------------------------------
# CHAT
# --------------------------------------------------

@app.post("/chat")
def chat(request: ChatRequest):

    # --------------------------------------------------
    # CREATE NEW CHAT
    # --------------------------------------------------

    chat_id = request.chat_id

    if not chat_id:
        chat_id = str(uuid4())

        chats_collection.insert_one({
    "chat_id": chat_id,
    "title": request.message[:50],
    "subject": request.subject,
    "created_at": datetime.utcnow()
})

    # --------------------------------------------------
    # SAVE USER MESSAGE
    # --------------------------------------------------

    messages_collection.insert_one({
    "chat_id": chat_id,
    "subject": request.subject,
    "role": "user",
    "content": request.message,
    "created_at": datetime.utcnow()
})
    # --------------------------------------------------
    # LOAD CONVERSATION HISTORY
    # --------------------------------------------------

    history = list(
        messages_collection.find(
            {"chat_id": chat_id},
            {
                "_id": 0,
                "role": 1,
                "content": 1
            }
        ).sort("created_at", 1)
    )

    conversation = [
        {
            "role": message["role"],
            "content": message["content"]
        }
        for message in history
    ]

    # --------------------------------------------------
    # PRIMARY: DEEPSEEK
    # --------------------------------------------------

    try:

        
        response = deepseek_client.chat.completions.create(
    model="deepseek-chat",
    messages=conversation
)

        reply = response.choices[0].message.content
        model_used = "deepseek-chat"

        print("Response generated using DeepSeek")


    # --------------------------------------------------
    # FALLBACK 1: GEMINI
    # --------------------------------------------------

    except Exception as error:

        print(f"DeepSeek failed: {error}")
        print("Trying Gemini...")


        try:

            response = gemini_client.models.generate_content(
                model="gemini-3.6-flash",
                contents=conversation
            )

            reply = response.text
            model_used = "gemini-3.6-flash"

            print("Response generated using Gemini")


        # --------------------------------------------------
        # FALLBACK 2: OLLAMA
        # --------------------------------------------------

        except Exception as gemini_error:

            print(f"Gemini failed: {gemini_error}")
            print("Trying Ollama...")


            try:

                
                response = ollama.chat(
    model="phi3:latest",
    messages=conversation
)

                reply = response["message"]["content"]
                model_used = "phi3:latest"

                print("Response generated using Ollama")


            except Exception as ollama_error:

                print(f"Ollama failed: {ollama_error}")

                reply = (
                    "Sorry, AceMate is temporarily unable "
                    "to generate a response."
                )

                model_used = "none"


    # --------------------------------------------------
    # SAVE AI RESPONSE
    # --------------------------------------------------


    messages_collection.insert_one({
    "chat_id": chat_id,
    "subject": request.subject,
    "role": "assistant",
    "content": reply,
    "model": model_used,
    "created_at": datetime.utcnow()
})

    # --------------------------------------------------
    # RETURN RESPONSE
    # --------------------------------------------------

    return {
        "reply": reply,
        "model": model_used,
        "chat_id": chat_id
    }


# --------------------------------------------------
# GET RECENT CHATS
# --------------------------------------------------

@app.get("/chats")
def get_chats():

    chats = chats_collection.find(
        {},
        {
            "_id": 0,
            "chat_id": 1,
            "title": 1,
            "created_at": 1
        }
    ).sort("created_at", -1)

    return {
        "chats": list(chats)
    }
