import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";

export default function ChatContainer({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat) return;
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      try {
        const response = await axios.post(recieveMessageRoute, {
          from: data._id,
          to: currentChat._id,
        });
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 1000); // Poll every second

    return () => clearInterval(interval);
  }, [currentChat]);

  const handleSendMsg = async (msg, file = null) => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );

    let messageData = msg;
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
      );

      try {
        const uploadRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/auto/upload`,
          formData
        );
        messageData = uploadRes.data.secure_url;
      } catch (err) {
        console.error("File upload failed:", err);
        return;
      }
    }

    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: data._id,
      msg: messageData,
    });

    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: messageData,
    });

    const newMsg = {
      fromSelf: true,
      message: messageData,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({
          fromSelf: false,
          message: msg,
          timestamp: new Date().toISOString(),
        });
      });
    }
  }, []);

  useEffect(() => {
    if (arrivalMessage) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage]);

  useEffect(() => {
  const chatContainer = scrollRef.current?.parentNode;
  if (!chatContainer) return;

  const isUserAtBottom =
    chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 100;

  if (isUserAtBottom) {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }
}, [messages]);


  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toDateString();
  };

  let lastMessageDate = null;

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt="avatar"
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        <Logout />
      </div>

      <div className="chat-messages">
        {messages.map((msg) => {
          const messageDate = formatDate(msg.timestamp);
          const showDate = messageDate !== lastMessageDate;
          lastMessageDate = messageDate;

          return (
            <div key={uuidv4()}>
              {showDate && (
                <div className="chat-date-separator">
                  <span>{messageDate}</span>
                </div>
              )}
              <div
                className={`message ${msg.fromSelf ? "sended" : "received"}`}
              >
                <div className="content">
                  <p>
                    {msg.message.startsWith("http") ? (
                      /\.(jpg|jpeg|png|gif)$/i.test(msg.message) ? (
                        <img
                          src={msg.message}
                          alt="media"
                          style={{
                            maxWidth: "200px",
                            borderRadius: "0.5rem",
                          }}
                        />
                      ) : (
                        <a
                          href={msg.message}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#9a86f3" }}
                        >
                          View Document
                        </a>
                      )
                    ) : (
                      msg.message
                    )}
                  </p>
                  <span className="timestamp">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  padding-top: 1rem;
  display: grid;
  grid-template-rows: 10% 78% 12%;
  gap: 0.1rem;
  overflow: hidden;
  background-color: #e6f0ff;

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background-color: #cce0ff;
    border-bottom: 1px solid #b3d1ff;

    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      img {
        height: 3rem;
        border-radius: 50%;
      }
      h3 {
        color: #003366;
      }
    }

    .logout {
      cursor: pointer;
      svg {
        color: #003366;
        font-size: 1.5rem;
      }
    }
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    overflow-y: auto;

    .message {
      display: flex;
      align-items: center;

      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        font-size: 1rem;
        padding: 0.75rem 1rem;
        border-radius: 1rem;
        color: black;
      }
    }

    .sended {
      justify-content: flex-end;
      .content {
        background-color: #a7c7f9;
      }
    }

    .received {
      justify-content: flex-start;
      .content {
        background-color: #d9eaff;
      }
    }

    .timestamp {
      font-size: 0.75rem;
      color: #555;
      text-align: right;
      margin-top: 0.25rem;
    }

    .chat-date-separator {
      text-align: center;
      color: #888;
      font-size: 0.8rem;
      margin: 0.5rem 0;
    }
  }

  .chat-input {
    background-color: #e6f0ff;
    padding: 1rem 2rem;
    input {
      width: 100%;
      padding: 0.75rem;
      border-radius: 1rem;
      border: 1px solid #b3d1ff;
      outline: none;
      font-size: 1rem;
    }
  }
`;
