import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import styles from "./Chat.module.css";
import Navbar from "../Homepage/Navbar";
import Footer from "../Homepage/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../../contexts/DataContext";

// Black filled circle (1x1 pixel base64 png)
const patientPlaceholder =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAMUlEQVR4nO3BAQEAAAABIP6PzgpVZwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgRrCAAARV5DdIAAAAASUVORK5CYII=";

function Chat({ user }) {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { chats, chatsLoading, socket, updateChat, addChat, refreshChats } = useData();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesContainerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Refresh chats when component mounts to ensure we have latest data
  useEffect(() => {
    if (user?.id) {
      refreshChats();
    }
  }, [user?.id, refreshChats]);

  // Memoize utility function
  const formatDisplayName = useCallback((u) => {
    if (!u?.name) return "";
    if (u?.role === "doctor") {
      return u.name.trim().toLowerCase().startsWith("dr.") ? u.name : `Dr. ${u.name}`;
    }
    return u.name;
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setShouldAutoScroll(true);
  }, []);

  useEffect(() => {
    if (user?.id && socket) {
      socket.emit("register", user.id);
    }
  }, [user?.id, socket]);

  // Memoize fetchMessages to prevent recreation
  const fetchMessages = useCallback(async (cId) => {
    if (!user?.id || !socket) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/${cId}`);
      const data = await res.json();
      setMessages(data || []);

      // mark messages as read
      socket.emit("markRead", { chat_id: cId, user_id: user.id });

      // locally clear unread flag for this chat
      updateChat(cId, { hasUnread: false });
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  }, [user?.id, socket, updateChat]);

  // when route param chatId changes, select it (if in chats) and load messages
  useEffect(() => {
    if (!chatId) {
      setSelectedChat(null);
      setMessages([]);
      return;
    }
    
    const found = chats.find((c) => c.id === chatId);
    if (found) {
      setSelectedChat(found);
      // Always fetch messages to ensure we have the latest
      fetchMessages(chatId);
    } else {
      // Chat not in list, fetch it first
      (async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${chatId}`);
          if (res.ok) {
            const chatDetail = await res.json();
            setSelectedChat(chatDetail);
            addChat(chatDetail);
            // Fetch messages after chat is added
            fetchMessages(chatId);
          }
        } catch (e) {
          console.error("Could not fetch single chat details", e);
        }
      })();
    }
  }, [chatId, chats, fetchMessages, addChat]);

  // receive real-time messages - update both local messages and ensure chat list is updated
  useEffect(() => {
    if (!socket) return;
    
    const onMessage = (msg) => {
      // If this message is for the currently selected chat, add it to messages
      if (selectedChat && msg.chat_id === selectedChat.id) {
        setMessages((prev) => {
          // Check if message already exists
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      
      // If we have a chatId in URL but messages haven't loaded yet, fetch them
      if (chatId === msg.chat_id && (!selectedChat || selectedChat.id !== msg.chat_id)) {
        // Fetch messages for this chat
        fetchMessages(msg.chat_id);
      }
    };
    
    socket.on("message", onMessage);
    return () => socket.off("message", onMessage);
  }, [selectedChat, socket, chatId, fetchMessages]);

  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !selectedChat || !user?.id || !socket) return;
    socket.emit("sendMessage", {
      chat_id: selectedChat.id,
      sender_id: user.id,
      text: message.trim(),
    });
    setMessage("");
  }, [message, selectedChat, user?.id, socket]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (shouldAutoScroll) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, shouldAutoScroll]);

  // toggle auto-scroll depending on user scroll position
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShouldAutoScroll(distanceFromBottom < 40); // near bottom -> keep autoscroll on
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    // run once to set initial state correctly
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [selectedChat]);

  // When marking messages as read for this chat, also notify navbar immediately
  useEffect(() => {
    if (!selectedChat) return;
    // When messages are fetched or selected chat changes, emit markRead via socket already handled
    // We also dispatch a window event so Navbar can sync unread badge instantly
    const emitReadEvent = () => {
      window.dispatchEvent(new Event('chatRead'));
    };
    // Listen to scroll-to-bottom or new messages triggering read, conservatively emit once per mount
    emitReadEvent();
  }, [selectedChat]);

  return (
    <div>
      <Navbar user={user} />
      <div className={styles.chatContainer}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.chatsTitle}>CHATS</div>
          <div className={styles.chatsList}>
            {chatsLoading && (
              <div className={styles.loaderContainer}>
                <div className={styles.spinner} />
                <span>Loading chats…</span>
              </div>
            )}
            {!chatsLoading && chats.length === 0 && (
              <div className={styles.emptyChatsState}>
                <div className={styles.emptyChatsIcon}>
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#8696a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className={styles.emptyChatsMessage}>No chats yet</p>
                <p className={styles.emptyChatsSubMessage}>Start a conversation to see your chats here</p>
              </div>
            )}
            {!chatsLoading && chats.length > 0 && chats.map((chat) => {
            const otherUser = chat.user1.id === user.id ? chat.user2 : chat.user1;
            const avatar =
              otherUser?.role === "doctor" && otherUser?.photoUrl
                ? otherUser.photoUrl
                : patientPlaceholder;
            const isSelected = selectedChat?.id === chat.id;
            const lastMessageTime = chat.updated_at 
              ? new Date(chat.updated_at).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })
              : '';
            return (
              <div
                key={chat.id}
                className={`${styles.contactItem} ${chat.hasUnread ? styles.unread : ""} ${isSelected ? styles.selected : ""}`}
                onClick={() => {
                  navigate(`/Chat/${chat.id}`);
                }}
              >
                <img src={avatar} alt={formatDisplayName(otherUser)} />
                <div className={styles.contactInfo}>
                  <div className={styles.contactHeader}>
                    <div className={chat.hasUnread ? styles.unreadName : styles.contactName}>
                      {formatDisplayName(otherUser)}
                    </div>
                    {lastMessageTime && (
                      <span className={styles.contactTime}>{lastMessageTime}</span>
                    )}
                  </div>
                  <div className={styles.contactMessage}>
                    {chat.last_message || "No messages yet"}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Chat area */}
        <div className={styles.chatArea}>
          {selectedChat ? (
            <>
              <div className={styles.chatHeader}>
                {(() => {
                  const otherUser =
                    selectedChat.user1.id === user.id
                      ? selectedChat.user2
                      : selectedChat.user1;
                  const avatar =
                    otherUser?.role === "doctor" && otherUser?.photoUrl
                      ? otherUser.photoUrl
                      : patientPlaceholder;
                  return (
                    <div className={styles.chatHeaderContent}>
                      <img
                        className={styles.headerAvatar}
                        src={avatar}
                        alt={formatDisplayName(otherUser)}
                      />
                      <div className={styles.headerName}>{formatDisplayName(otherUser)}</div>
                    </div>
                  );
                })()}
              </div>

              <div className={styles.messagesContainer} ref={messagesContainerRef}>
                {messages.map((msg) => {
                  const isSelf = msg.sender_id === user.id;
                  const avatar =
                    msg.sender &&
                    msg.sender.role === "doctor" &&
                    msg.sender_profile?.photoUrl
                      ? msg.sender_profile.photoUrl
                      : patientPlaceholder;
                  const messageTime = msg.created_at 
                    ? new Date(msg.created_at).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                      })
                    : '';
                  const isRead = msg.status === 'read';
                  const isDelivered = msg.status === 'delivered' || msg.status === 'read';
                  return (
                    <div
                      key={msg.id}
                      className={`${styles.messageWrapper} ${
                        isSelf ? styles.self : ""
                      }`}
                    >
                      {!isSelf && (
                        <img src={avatar} alt={msg.sender?.name || ""} />
                      )}
                      <div>
                        <p>{msg.text}</p>
                        <div className={styles.messageStatus}>
                          {messageTime && <span className={styles.messageTime}>{messageTime}</span>}
                          {isSelf && (
                            <span className={`${styles.doubleTick} ${isRead ? styles.read : styles.sent}`}>
                              ✓✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div />
              </div>

              {!shouldAutoScroll && (
                <button
                  type="button"
                  className={styles.scrollToBottomBtn}
                  onClick={scrollToBottom}
                  aria-label="Scroll to latest message"
                  title="Scroll to latest message"
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                    <path d="M12 16l-6-6h12z" fill="currentColor"/>
                  </svg>
                </button>
              )}

              <div className={styles.messageInputContainer}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                />
                <button className={styles.sendButton} onClick={handleSendMessage} aria-label="Send message">
                  <svg className={styles.sendIcon} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12l18-8-6.5 8L21 20 3 12z"/>
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className={styles.noChatSelected}>
              <div className={styles.noChatIcon}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="#667eea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11h.01M13 11h.01M17 11h.01" stroke="#667eea" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className={styles.noChatText}>No chat selected</p>
            </div>
            )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Chat;
