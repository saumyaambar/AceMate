import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  GraduationCap,
  SquarePen,
  Search,
  Library,
  Folder,
  CalendarDays,
  MoreHorizontal,
  Image,
  Bot,
  Pin,
  Plus,
  Paperclip,
  Sparkles,
  ClipboardList,
  BarChart3,
  Target,
  ChevronDown,
  ChevronRight,
  Mic,
  Settings,
  Database,
  Code2,
  Brain,
  Cpu,
  FileText,
  
} from "lucide-react";

import "./App.css";


function App() {

  const [libraryOpen, setLibraryOpen] = useState(true);
  const [moreOpen, setMoreOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [message, setMessage] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [subjects, setSubjects] = useState([
  "Database",
  "Data Structures",
  "Probability",
  "Digital Logic and Computer Architecture",
]);
const [quizSubjectsOpen, setQuizSubjectsOpen] = useState(false);
const [newSubject, setNewSubject] = useState("");
const [createSubjectOpen, setCreateSubjectOpen] = useState(false);
const [subjectMenuOpen, setSubjectMenuOpen] = useState(null);
const [renameSubjectOpen, setRenameSubjectOpen] = useState(false);
const [renameValue, setRenameValue] = useState("");
const [subjectToRename, setSubjectToRename] = useState("");
const [deleteSubjectOpen, setDeleteSubjectOpen] = useState(false);
const [subjectToDelete, setSubjectToDelete] = useState("");
const [currentChatId, setCurrentChatId] = useState(null);
const [recentChats, setRecentChats] = useState([]);
const [openChatMenu, setOpenChatMenu] = useState(null);
const [pinnedChats, setPinnedChats] = useState([]);
const [currentSubject, setCurrentSubject] = useState(null);
useEffect(() => {
  const loadRecentChats = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/chats");

      if (!response.ok) {
        throw new Error("Failed to load chats");
      }

      const data = await response.json();

      setRecentChats(data.chats);
    } catch (error) {
      console.error("Failed to load recent chats:", error);
    }
  };

  loadRecentChats();
}, []);
const pinChat = (chat) => {
  setPinnedChats((currentPinned) => [
    chat,
    ...currentPinned,
  ]);

  setRecentChats((currentRecent) =>
    currentRecent.filter(
      (item) => item.chat_id !== chat.chat_id
    )
  );

  setOpenChatMenu(null);
};
const deleteChat = async (chatId) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/chats/${chatId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete chat");
    }

    setRecentChats((currentChats) =>
      currentChats.filter((chat) => chat.chat_id !== chatId)
    );

    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setChatStarted(false);
      setChatMessages([]);
    }

    setOpenChatMenu(null);
  } catch (error) {
    console.error("Delete chat error:", error);
  }
};
  
  // ================= AUTHENTICATION (FRONTEND MVP) =================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  const authSubmit = (e) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) return;

    // Temporary frontend-only authentication.
    // Real authentication + database will be added with FastAPI.
    setIsAuthenticated(true);
  };

  const loadChat = async (chatId) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/chats/${chatId}`
    );

    if (!response.ok) {
      throw new Error("Failed to load chat");
    }

    const data = await response.json();

    const formattedMessages = data.messages.map((item, index) => ({
      id: `${chatId}-${index}`,
      role: item.role,
      text: item.content,
    }));

    setCurrentChatId(chatId);
    setChatMessages(formattedMessages);
    setChatStarted(true);
    setOpenChatMenu(null);
  } catch (error) {
    console.error("Load chat error:", error);
  }
};

  const sendMessageToBackend = async (text) => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage) return;

    setChatMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now(),
        role: "user",
        text: trimmedMessage,
      },
    ]);

    setMessage("");
    setChatStarted(true);
    setMenuOpen(false);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
 body: JSON.stringify({
  message: trimmedMessage,
  chat_id: currentChatId,
  subject: currentSubject,
}),
});

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();
      setCurrentChatId(data.chat_id);
      if (!currentChatId) {
  setRecentChats((currentChats) => [
    {
      chat_id: data.chat_id,
      title: trimmedMessage.slice(0, 50),
    },
    ...currentChats,
  ]);
}

      setChatMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: data.reply,
        },
      ]);
    } catch (error) {
      console.error("Chat API error:", error);

      setChatMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: "I couldn't connect to the AceMate backend. Please make sure the FastAPI server is running.",
        },
      ]);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#111111",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "24px",
        boxSizing: "border-box"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "430px",
          background: "#1b1b1d",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "20px",
          padding: "34px",
          boxSizing: "border-box",
          boxShadow: "0 25px 70px rgba(0,0,0,0.45)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "28px"
          }}>
            <div style={{
              width: "38px",
              height: "38px",
              borderRadius: "11px",
              background: "#2a2a2d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <GraduationCap size={21} />
            </div>
            <span style={{ fontSize: "21px", fontWeight: 650 }}>AceMate</span>
          </div>

          <h1 style={{
            margin: "0 0 8px",
            fontSize: "28px",
            lineHeight: 1.2
          }}>
            {authMode === "login" ? "Welcome back" : "Create your account"}
          </h1>

          <p style={{
            margin: "0 0 26px",
            color: "#99999f",
            fontSize: "14px",
            lineHeight: 1.5
          }}>
            {authMode === "login"
              ? "Log in to continue learning with AceMate."
              : "Create your student account and start learning with AceMate."}
          </p>

          <button
            type="button"
            onClick={() => setIsAuthenticated(true)}
            style={{
              width: "100%",
              height: "46px",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: "10px",
              background: "#ffffff",
              color: "#1f1f1f",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "20px"
            }}
          >
            <span style={{
              fontSize: "17px",
              fontWeight: 700,
              lineHeight: 1
            }}>
              G
            </span>
            Continue with Google
          </button>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
            color: "#77777d",
            fontSize: "12px"
          }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.10)" }} />
            <span>or</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.10)" }} />
          </div>

          <form onSubmit={authSubmit}>
            {authMode === "signup" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#cfcfd4",
                  fontSize: "13px"
                }}>
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    height: "46px",
                    boxSizing: "border-box",
                    padding: "0 13px",
                    background: "#242426",
                    border: "1px solid #3d3d40",
                    borderRadius: "10px",
                    color: "#ffffff",
                    outline: "none",
                    fontSize: "14px"
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                marginBottom: "7px",
                color: "#cfcfd4",
                fontSize: "13px"
              }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  height: "46px",
                  boxSizing: "border-box",
                  padding: "0 13px",
                  background: "#242426",
                  border: "1px solid #3d3d40",
                  borderRadius: "10px",
                  color: "#ffffff",
                  outline: "none",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "7px",
                color: "#cfcfd4",
                fontSize: "13px"
              }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  height: "46px",
                  boxSizing: "border-box",
                  padding: "0 13px",
                  background: "#242426",
                  border: "1px solid #3d3d40",
                  borderRadius: "10px",
                  color: "#ffffff",
                  outline: "none",
                  fontSize: "14px"
                }}
              />
            </div>

            <button type="submit" style={{
              width: "100%",
              height: "46px",
              border: "none",
              borderRadius: "10px",
              background: "#4b5fb8",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer"
            }}>
              {authMode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <div style={{
            marginTop: "22px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            textAlign: "center",
            color: "#929298",
            fontSize: "13px"
          }}>
            {authMode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === "login" ? "signup" : "login");
                setAuthPassword("");
              }}
              style={{
                marginLeft: "6px",
                border: "none",
                background: "transparent",
                color: "#9eafff",
                fontSize: "13px",
                cursor: "pointer",
                padding: 0
              }}
            >
              {authMode === "login" ? "Sign up" : "Log in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

return (

    <div className="app">


      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">


        {/* Logo */}

        <div className="logo-section">

          <div className="logo-icon">
            <GraduationCap size={21} />
          </div>

          <span className="logo-text">
            AceMate
          </span>

          <button className="collapse-button">
            ‹
          </button>

        </div>


        {/* New Chat */}

        <button
          className="side-button new-chat"
          onClick={() => {
  setCurrentChatId(null);
  setChatMessages([]);
  setMessage("");
  setChatStarted(false);
  setMenuOpen(false);
}}
        >

          <SquarePen size={18} />

          <span>
            New chat
          </span>

        </button>


        {/* Search */}

        <button className="side-button">

          <Search size={18} />

          <span>
            Search chats
          </span>

        </button>


        {/* Library */}

        <div className="side-section">

          <button
            className="side-button"
            onClick={() => setLibraryOpen(!libraryOpen)}
          >

            <Library size={18} />

            <span>
              Library
            </span>

            {libraryOpen ? (
              <ChevronDown
                className="arrow"
                size={16}
              />
            ) : (
              <ChevronRight
                className="arrow"
                size={16}
              />
            )}

          </button>


          {libraryOpen && (

            <div className="library-list">
{subjects.map((subject, index) => {
  const SubjectIcon =
    index === 0
      ? Database
      : index === 1
        ? Code2
        : index === 2
          ? Brain
          : index === 3
            ? Cpu
            : FileText;

  return (
    <div className="library-item-wrapper" key={subject}>

      <button
  className="library-item"
  onClick={() => {
    setCurrentSubject(subject);
    setCurrentChatId(null);
    setChatMessages([]);
    setChatStarted(false);
  }}
>
  <SubjectIcon size={16} />
  <span>{subject}</span>
</button>

      <button
        className="subject-more-button"
        onClick={(e) => {
          e.stopPropagation();

          setSubjectMenuOpen(
            subjectMenuOpen === subject ? null : subject
          );
        }}
      >
        <MoreHorizontal size={16} />
      </button>

      {subjectMenuOpen === subject && (
  <div className="subject-action-menu">

    <button
      onClick={() => {
        setSubjectToRename(subject);
        setRenameValue(subject);
        setRenameSubjectOpen(true);
        setSubjectMenuOpen(null);
      }}
    >
      Rename
    </button>

    <button
      className="delete-action"
      onClick={() => {
        setSubjects((currentSubjects) =>
          currentSubjects.filter((item) => item !== subject)
        );

        setSubjectMenuOpen(null);
      }}
    >
      Delete
    </button>

  </div>
)}

{renameSubjectOpen && subjectToRename === subject && (
  <div className="subject-rename-menu">

    <input
      type="text"
      value={renameValue}
      onChange={(e) => setRenameValue(e.target.value)}
      autoFocus
    />

    <div className="rename-menu-actions">

      <button
        onClick={() => {
          setRenameSubjectOpen(false);
          setSubjectToRename("");
        }}
      >
        Cancel
      </button>

      <button
        onClick={() => {
          const newName = renameValue.trim();

          if (!newName) return;

          setSubjects((currentSubjects) =>
            currentSubjects.map((item) =>
              item === subjectToRename ? newName : item
            )
          );

          setRenameSubjectOpen(false);
          setSubjectToRename("");
        }}
      >
        Save
      </button>

    </div>

  </div>
)}

    </div>
  );
})}

              <button
                className="library-item create-subject"
                onClick={() => {
                  setNewSubject("");
                  setCreateSubjectOpen(true);
                }}
              >
                <Plus size={16} />
                <span>Create new subject</span>
              </button>

            </div>

          )}

        </div>


        {/* Projects */}

        <button className="side-button">

          <Folder size={18} />

          <span>
            Projects
          </span>

        </button>


        {/* Scheduled */}

        <button className="side-button">

          <CalendarDays size={18} />

          <span>
            Scheduled
          </span>

        </button>


        {/* More */}

        <div className="side-section">

          <button
            className="side-button"
            onClick={() => setMoreOpen(!moreOpen)}
          >

            <MoreHorizontal size={18} />

            <span>
              More
            </span>

            {moreOpen ? (
              <ChevronDown
                className="arrow"
                size={16}
              />
            ) : (
              <ChevronRight
                className="arrow"
                size={16}
              />
            )}

          </button>


          {moreOpen && (

            <div className="more-list">

              <button className="side-button nested">

                <Image size={17} />

                <span>
                  Images
                </span>

              </button>


              <button className="side-button nested">

                <Bot size={17} />

                <span>
                  GPTs
                </span>

              </button>

            </div>

          )}

        </div>


        {/* Pinned */}

       

<div className="chat-section">

  <div className="section-heading">
    <Pin size={13} />

    <span>
      Pinned
    </span>
  </div>

  <div className="recent-chats">
    {pinnedChats.map((chat) => (
      <div
        key={chat.chat_id}
        className="recent-chat-wrapper"
      >
        <button
          className="recent-chat-item"
          onClick={() => {
            loadChat(chat.chat_id);
          }}
        >
          {chat.title}
        </button>

        <button
          className="recent-chat-more"
          onClick={(event) => {
            event.stopPropagation();

            setOpenChatMenu(
              openChatMenu === chat.chat_id
                ? null
                : chat.chat_id
            );
          }}
        >
          ⋯
        </button>

        {openChatMenu === chat.chat_id && (
          <div className="recent-chat-menu">

            <button
              onClick={(event) => {
                event.stopPropagation();

                setPinnedChats((currentPinned) =>
                  currentPinned.filter(
                    (item) =>
                      item.chat_id !== chat.chat_id
                  )
                );

                setRecentChats((currentRecent) => [
                  chat,
                  ...currentRecent,
                ]);

                setOpenChatMenu(null);
              }}
            >
              📌 Unpin
            </button>

            <button
              onClick={(event) => {
                event.stopPropagation();
                deleteChat(chat.chat_id);
              }}
            >
              🗑 Delete
            </button>

          </div>
        )}
      </div>
    ))}
  </div>

</div>


        {/* Recent */}

        <div className="chat-section">

  <div className="section-heading">
    <span>
      Recent
    </span>
  </div>

  <div className="recent-chats">
  {recentChats.map((chat) => (
    <div
      key={chat.chat_id}
      className="recent-chat-wrapper"
    >
      <button
        className="recent-chat-item"
        onClick={() => {
  loadChat(chat.chat_id);
}}
      >
        {chat.title}
      </button>

      <button
        className="recent-chat-more"
        onClick={(event) => {
          event.stopPropagation();
          setOpenChatMenu(
            openChatMenu === chat.chat_id ? null : chat.chat_id
          );
        }}
      >
        ⋯
      </button>

      {openChatMenu === chat.chat_id && (
        <div className="recent-chat-menu">
          <button
            onClick={(event) => {
  event.stopPropagation();
  pinChat(chat);
}}
          >
            📌 Pin
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation();
              deleteChat(chat.chat_id);
            }}
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  ))}
</div>

</div>


        {/* Profile */}

        <div className="profile">

          <div className="avatar">
            S
          </div>

          <div className="profile-info">

            <div>
              Student
            </div>

            <small>
              AceMate
            </small>

          </div>

          <Settings size={18} />

        </div>


      </aside>



      {/* ================= MAIN ================= */}

      <main className="main">


        {!chatStarted ? (

          /* ================= HOME ================= */

          <>

            <div className="top-icon">
              <Sparkles size={18} />
            </div>


            <div className="home">

              <h1>
                Where should we start?
              </h1>


              <div className="composer-wrapper">


                {/* Composer */}

                <div className="composer">


                  <button
                    className="plus-button"
                    onClick={() => setMenuOpen(!menuOpen)}
                  >

                    <Plus size={24} />

                  </button>


                  <input
                    type="text"
                    placeholder="Ask AceMate"
                    value={message}
                    onChange={(e) =>
                      setMessage(e.target.value)
                    }
                    onFocus={() => setMenuOpen(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();

                        const trimmedMessage = message.trim();

                        if (!trimmedMessage) return;

                        sendMessageToBackend(trimmedMessage);
                      }
                    }}
                  />


                  <div className="composer-controls">


                    <button className="model-button">

                      <span className="status-dot"></span>

                      Flash

                      <ChevronDown size={14} />

                    </button>


                    <button className="mic-button">

                      <Mic size={19} />

                    </button>


                  </div>

                </div>



                {/* Plus Menu */}

                {menuOpen && (

                  <div className="plus-menu" style={{ overflow: "visible" }}>


                    <>
  <input
    type="file"
    id="pdf-upload"
    accept=".pdf,application/pdf"
    style={{ display: "none" }}
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (!file) return;

      console.log("Selected PDF:", file.name);
      alert(`PDF selected: ${file.name}`);

      e.target.value = "";
    }}
  />

  <button
    className="menu-option"
    onClick={() => document.getElementById("pdf-upload").click()}
  >
    <div className="menu-icon">
      <Paperclip size={20} />
    </div>

    <div className="menu-text">
      <strong>Add photos / files / notes</strong>
      <span>Upload materials to get help</span>
    </div>
  </button>
</>



                    <button className="menu-option">

                      <div className="menu-icon">
                        <Image size={20} />
                      </div>

                      <div className="menu-text">

                        <strong>
                          Create image
                        </strong>

                        <span>
                          Generate diagrams, charts, etc.
                        </span>

                      </div>

                    </button>



<div className="quiz-option-wrapper">
  <button
    className="menu-option"
    onClick={() => setQuizSubjectsOpen((prev) => !prev)}
  >
    <div className="menu-icon">
      <ClipboardList size={20} />
    </div>

    <div className="menu-text">
      <strong>Generate quiz</strong>
      <span>Choose a subject</span>
    </div>

    <ChevronRight
      size={17}
      className="option-arrow"
    />
  </button>

  {quizSubjectsOpen && (
    <div
      className="quiz-subjects"
      style={{
        position: "absolute",
        left: "calc(100% + 10px)",
        top: "50%",
        transform: "translateY(-50%)",
        width: "230px",
        maxHeight: "200px",
        padding: "6px",
        display: "flex",
        flexDirection: "column",
        gap: "1px",
        background: "#1b1b1d",
        border: "1px solid #3a3a3d",
        borderRadius: "14px",
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.45)",
        overflowY: "auto",
        zIndex: 99999,
      }}
    >
      {subjects.length > 0 ? (
        subjects.map((subject) => (
          <button
            key={subject}
            className="quiz-subject"
            onClick={() => {
              setMessage(`Generate a quiz for ${subject}`);
              setQuizSubjectsOpen(false);
              setMenuOpen(false);
            }}
          >
            {subject}
          </button>
        ))
      ) : (
        <div className="quiz-no-subjects">
          No subjects available
        </div>
      )}
    </div>
  )}
</div>

<button className="menu-option">
  <div className="menu-icon">
    <BarChart3 size={20} />
  </div>

  <div className="menu-text">
    <strong>
      Track performance
    </strong>

    <span>
      See your progress
    </span>
  </div>
</button>



                    <button className="menu-option">

                      <div className="menu-icon">
                        <Target size={20} />
                      </div>

                      <div className="menu-text">

                        <strong>
                          Roadmap
                        </strong>

                        <span>
                          To achieve excellence in what?
                        </span>

                      </div>

                      <ChevronRight
                        size={17}
                        className="option-arrow"
                      />

                    </button>


                  </div>

                )}

              </div>


              <div className="bottom-hint">

                <FileText size={14} />

                <span>
                  AceMate can learn from your study material
                </span>

              </div>

            </div>

          </>

        ) : (

          /* ================= CHAT SCREEN ================= */

          <div className="chat-screen">


            {/* Header */}

            <div className="chat-header">

              <span>
                New Chat
              </span>


              <button className="header-model">

                <span className="status-dot"></span>

                Flash

                <ChevronDown size={14} />

              </button>

            </div>



            {/* Conversation */}

            {chatMessages.length === 0 ? (
              <div className="empty-chat">

                <div className="chat-icon">
                  <GraduationCap size={28} />
                </div>

                <h2>
                  How can I help you learn?
                </h2>

                <p>
                  Ask AceMate anything about your studies.
                </p>

              </div>
            ) : (
              <div className="messages-list">
                {chatMessages.map((chatMessage) => (
                  <div
                    key={chatMessage.id}
                    className={`message-row ${chatMessage.role}`}
                  >
                    <div className="message-bubble">
                      {chatMessage.role === "assistant" ? (
  <ReactMarkdown>{chatMessage.text}</ReactMarkdown>
) : (
  chatMessage.text
)}
                    </div>
                  </div>
                ))}
              </div>
            )}



            {/* Chat Input */}

            <div className="chat-input-area">

              <div className="chat-composer">


                <button className="plus-button" onClick={() => setMenuOpen(!menuOpen)}>
                <Plus size={22} />
                </button>
               {menuOpen && (
  <div className="plus-menu chat-plus-menu" style={{ overflow: "visible" }}>

    <button
  className="menu-option"
  onClick={() => document.getElementById("acemate-file-input").click()}
>
  <div className="menu-icon">
    <Paperclip size={20} />
  </div>

  <div className="menu-text">
    <strong>Add photos / files / notes</strong>
    <span>Upload materials to get help</span>
  </div>
</button>

<input
  id="acemate-file-input"
  type="file"
  accept="image/*,.pdf,.txt,.doc,.docx"
  style={{ display: "none" }}
  onChange={(event) => {
    const file = event.target.files[0];

    if (file) {
      console.log("Selected file:", file);
      setMenuOpen(false);
    }
  }}
/>

    <button className="menu-option">
      <div className="menu-icon">
        <Image size={20} />
      </div>

      <div className="menu-text">
        <strong>Create image</strong>
        <span>Generate diagrams, charts, etc.</span>
      </div>
    </button>

    <div className="quiz-option-wrapper">
      <button
        className="menu-option"
        onClick={() => setQuizSubjectsOpen((prev) => !prev)}
      >
        <div className="menu-icon">
          <ClipboardList size={20} />
        </div>

        <div className="menu-text">
          <strong>Generate quiz</strong>
          <span>Choose a subject</span>
        </div>

        <ChevronRight size={17} />
      </button>

      {quizSubjectsOpen && (
        <div
          className="quiz-subjects"
          style={{
            position: "absolute",
            left: "calc(100% + 10px)",
            top: "50%",
            transform: "translateY(-50%)",
            width: "230px",
            maxHeight: "200px",
            padding: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            background: "#1b1b1d",
            border: "1px solid #3a3a3d",
            borderRadius: "14px",
            boxShadow: "0 12px 30px rgba(0, 0, 0, 0.45)",
            overflowY: "auto",
            zIndex: 99999,
          }}
        >
          {subjects.map((subject) => (
            <button
              key={subject}
              className="quiz-subject"
              onClick={() => {
                setMessage(`Generate a quiz for ${subject}`);
                setQuizSubjectsOpen(false);
                setMenuOpen(false);
              }}
            >
              {subject}
            </button>
          ))}
        </div>
      )}
    </div>

    <button className="menu-option">
      <div className="menu-icon">
        <BarChart3 size={20} />
      </div>

      <div className="menu-text">
        <strong>Track performance</strong>
        <span>See your progress</span>
      </div>
    </button>

    <button className="menu-option">
      <div className="menu-icon">
        <Target size={20} />
      </div>

      <div className="menu-text">
        <strong>Roadmap</strong>
        <span>To achieve excellence in what?</span>
      </div>

      <ChevronRight size={17} />
    </button>

  </div>
)}

                <input
                  type="text"
                  placeholder="Ask AceMate"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();

                      const trimmedMessage = message.trim();

                      if (!trimmedMessage) return;

                      sendMessageToBackend(trimmedMessage);
                    }
                  }}
                />

                <button
                  className="mic-button"
                  type="button"
                  onClick={() => {
                    const trimmedMessage = message.trim();

                    if (!trimmedMessage) return;

                    sendMessageToBackend(trimmedMessage);
                  }}
                  aria-label="Send message"
                >
                  <Mic size={19} />
                </button>


              </div>


              <p className="chat-disclaimer">

                AceMate can make mistakes. Check important information.

              </p>

            </div>


          </div>

        )}

      </main>


      {/* ================= CREATE SUBJECT MODAL ================= */}

      {createSubjectOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setCreateSubjectOpen(false);
            }
          }}
        >
          <div
            className="create-subject-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>Create new subject</h3>
                <p>Add a subject to your AceMate library.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setCreateSubjectOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <label className="subject-label" htmlFor="new-subject-input">
              Subject name
            </label>

            <input
              id="new-subject-input"
              className="subject-input"
              type="text"
              placeholder="e.g. Computer Networks"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const subject = newSubject.trim();

                  if (subject) {
                    setSubjects((prev) =>
                      prev.includes(subject) ? prev : [...prev, subject]
                    );
                    setNewSubject("");
                    setCreateSubjectOpen(false);
                  }
                }

                if (e.key === "Escape") {
                  setCreateSubjectOpen(false);
                }
              }}
              autoFocus
            />

            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => {
                  setNewSubject("");
                  setCreateSubjectOpen(false);
                }}
              >
                Cancel
              </button>

              <button
                className="modal-create"
                onClick={() => {
                  const subject = newSubject.trim();

                  if (subject) {
                    setSubjects((prev) =>
                      prev.includes(subject) ? prev : [...prev, subject]
                    );
                    setNewSubject("");
                    setCreateSubjectOpen(false);
                  }
                }}
                disabled={!newSubject.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

  );

}

export default App;