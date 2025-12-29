
import React, { useState } from "react";
import doctorIcon from "../../assets/doctor1.png";

function ChatBot({ disease, confidence }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    // Always include detected disease and confidence in the prompt we send
    // so the model has the exact condition even if the user says "this disease".
    const messageWithContext = disease
      ? `${input}\n\nContext: The predicted disease is "${disease}"` +
        (typeof confidence === "number"
          ? ` (confidence: ${(confidence * 100).toFixed(2)}%).`
          : ".")
      : input;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat-bot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageWithContext,
          disease: disease,
          confidence: confidence,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Error connecting to AI service." },
      ]);
    }

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div style={{ 
      fontFamily: "Arial, sans-serif",
      height: "100%",
      backgroundColor: "#ffffff",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e1e8ed",
      

      
    }}>
  
      <h3 style={{ 
        textAlign: "center", 
        color: "#000000", 
        marginTop: "0px",
        marginBottom: "20px",
        fontSize: "2rem",
        fontWeight: "bold",
        display: "block",
        backgroundColor: "#f8f9fa",
        padding: "10px",
        borderRadius: "8px"
      }}>
        Chat with AI Assistant
      </h3>
      
      <div style={{ 
        height: "400px", 
        overflowY: "auto", 
        border: "2px solid #e1e8ed",
        borderRadius: "12px",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: "center",
            color: "#6c757d",
            fontStyle: "italic",
            marginTop: "50px"
          }}>
            Start a conversation with the AI Dermatologist
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{
              marginBottom: "20px",
              display: "flex",
              flexDirection: "column"
            }}>
              <div style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                marginBottom: "8px",
                alignItems: "center",
                gap: m.role === "user" ? 0 : 8
              }}>
                {m.role !== "user" && (
                  <img
                    src={doctorIcon}
                    alt="AI Dermatologist"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: "1px solid #c8e6c9",
                      backgroundColor: "#ffffff"
                    }}
                  />
                )}
                <div style={{
                  backgroundColor: m.role === "user" ? "#007bff" : "#28a745",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "18px",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  maxWidth: "80%",
                  wordWrap: "break-word"
                }}>
                  {m.role === "user" ? "You" : "AI Dermatologist"}
                </div>
              </div>
              <div style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start"
              }}>
                <div style={{
                  backgroundColor: m.role === "user" ? "#e3f2fd" : "#f1f8e9",
                  color: m.role === "user" ? "#1565c0" : "#2e7d32",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  maxWidth: "85%",
                  wordWrap: "break-word",
                  lineHeight: "1.5",
                  border: m.role === "user" ? "1px solid #bbdefb" : "1px solid #c8e6c9",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  whiteSpace: "pre-wrap"
                }}>
                  {m.text.split("\n").map((line, idx) => {
                    // Render simple bullets. Make only the text before the first colon bold.
                    const isBullet = line.trim().startsWith("-");
                    const withoutHyphen = line.replace(/^\-\s*/, "");
                    const colonIndex = withoutHyphen.indexOf(":");
                    const hasHeading = colonIndex > 0;
                    const heading = hasHeading ? withoutHyphen.slice(0, colonIndex) : withoutHyphen;
                    const rest = hasHeading ? withoutHyphen.slice(colonIndex + 1).trimStart() : "";
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        {isBullet && <span style={{ color: m.role === "user" ? "#1565c0" : "#2e7d32" }}>•</span>}
                        <span>
                          <span style={{ fontWeight: hasHeading ? 600 : 400 }}>{heading}</span>
                          {hasHeading && rest ? <span>: {rest}</span> : null}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div style={{
        display: "flex",
        gap: "10px",
        marginTop: "15px",
        alignItems: "center"
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your skin condition..."
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "2px solid #e1e8ed",
            borderRadius: "25px",
            fontSize: "1rem",
            outline: "none",
            transition: "border-color 0.3s ease"
          }}
          onFocus={(e) => e.target.style.borderColor = "#007bff"}
          onBlur={(e) => e.target.style.borderColor = "#e1e8ed"}
        />
        <button 
          onClick={sendMessage}
          style={{
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "25px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
            transition: "background-color 0.3s ease",
            minWidth: "80px"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatBot;

