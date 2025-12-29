import React, { useRef, useState, useCallback } from "react";
import Navbar from "../Homepage/Navbar";
import ChatBot from "./chat-bot.js";

export default function Upload({user}) {
   
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const resetStateForNewFile = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError("");

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile)); // Show preview
    } else {
      setPreview(null);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    resetStateForNewFile(selectedFile || null);
  };

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      const droppedFile = event.dataTransfer?.files?.[0];
      resetStateForNewFile(droppedFile || null);
    },
    []
  );

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  /*const handleUpload = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };  */


  const handleUpload = async () => {
  if (!file) {
    setError("Please select an image first.");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    // ✅ If backend sends error (low confidence, invalid image, anything)
    if (data.error) {
      setError(data.error);
      setResult(null);
      return;
    }

    // ✅ Otherwise: success
    setResult(data);
    setError("");

  } catch (err) {
    setError("Error connecting to server");
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)" }}>
      <div style={{ marginBottom: "40px" }}>
        <Navbar user={user} />
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "32px",
          justifyContent: "center",
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        {/* Skin Disease Detection Card */}
        <div
          style={{
            flex: "1 1 460px",
            maxWidth: "540px",
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            boxShadow: "0 20px 45px rgba(15, 110, 255, 0.08)",
            border: "1px solid #eef2ff",
            padding: "36px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            marginTop: "60px",
          }}
        >
          <div style={{ alignSelf: "center", width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#ecf4ff", display: "grid", placeItems: "center" }}>
            <span role="img" aria-label="scan" style={{ fontSize: "26px" }}>🩺</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ margin: "0 0 12px", color: "#101828", fontSize: "28px", fontWeight: 700 }}>
              Skin Disease Detection
            </h2>
            <p style={{ margin: 0, color: "#475467", fontSize: "16px", lineHeight: 1.6 }}>
              Upload an image of your skin condition for AI-powered analysis and instant results.
            </p>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={triggerFileDialog}
            style={{
              border: "2px dashed #c8d4ff",
              borderRadius: "20px",
              background: "#f8faff",
              padding: "32px",
              textAlign: "center",
              cursor: "pointer",
              transition: "border-color 0.2s ease, background-color 0.2s ease",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <div style={{ fontSize: "36px", marginBottom: "12px", color: "#4f46e5" }}>⬆️</div>
            <p style={{ margin: "0 0 4px", fontSize: "16px", color: "#344054" }}>
              Drag and drop your image here, or
            </p>
            <button
              type="button"
              style={{
                marginTop: "12px",
                padding: "10px 20px",
                borderRadius: "12px",
                border: "1px solid #d0d5dd",
                backgroundColor: "#ffffff",
                color: "#344054",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Choose File
            </button>
            <p style={{ marginTop: "16px", fontSize: "14px", color: "#667085" }}>
              Supported formats: JPG, PNG, WEBP (Max 10MB)
            </p>
            {file && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  borderRadius: "12px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e4e7ec",
                  color: "#475467",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Selected: {file.name}
              </div>
            )}
          </div>

          {preview && (
            <div
              style={{
                borderRadius: "18px",
                background: "#f4f7ff",
                padding: "20px",
                textAlign: "center",
                boxShadow: "inset 0 0 0 1px rgba(79,70,229,0.08)",
              }}
            >
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  boxShadow: "0 12px 24px rgba(17, 24, 39, 0.15)",
                  border: "1px solid rgba(79,70,229,0.15)",
                }}
              />
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading}
            style={{
              padding: "16px",
              borderRadius: "18px",
              border: "none",
              backgroundColor: loading ? "#9bdfad" : "#12b76a",
              color: "#ffffff",
              fontSize: "17px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 12px 30px rgba(18, 183, 106, 0.25)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(event) => {
              if (!loading) {
                event.currentTarget.style.boxShadow = "0 16px 40px rgba(18, 183, 106, 0.35)";
                event.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.boxShadow = "0 12px 30px rgba(18, 183, 106, 0.25)";
              event.currentTarget.style.transform = "none";
            }}
          >
            <span style={{ fontSize: "22px" }}></span>
            {loading ? "Processing..." : "Predict Result"}
          </button>

          {error && (
            <div
              style={{
                color: "#d92d20",
                marginTop: "-8px",
                padding: "14px 16px",
                backgroundColor: "#fef3f2",
                borderRadius: "14px",
                border: "1px solid #fecdca",
                fontSize: "14px",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {result && (
            <div
              style={{
                marginTop: "4px",
                padding: "24px",
                background: "linear-gradient(140deg, rgba(224,246,232,1) 0%, rgba(231,247,239,1) 100%)",
                borderRadius: "20px",
                border: "1px solid rgba(34,197,94,0.4)",
                boxShadow: "0 16px 40px rgba(21, 128, 61, 0.15)",
              }}
            >
              <h3 style={{ color: "#027a48", margin: "0 0 16px", fontSize: "20px" }}>
                Prediction Result
              </h3>
              <div style={{ display: "grid", gap: "12px", color: "#05603a", fontSize: "16px" }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Disease:</span>{" "}
                  <span>{result.class_name}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 600 }}>Confidence:</span>{" "}
                  <span
                    style={{
                      color:
                        result.confidence > 0.8
                          ? "#047857"
                          : result.confidence > 0.6
                          ? "#b54708"
                          : "#b42318",
                      fontWeight: 700,
                    }}
                  >
                    {(result.confidence * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Assistant Card */}
        <div
          style={{
            flex: "1 1 460px",
            maxWidth: "540px",
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            boxShadow: "0 20px 45px rgba(110, 15, 255, 0.08)",
            border: "1px solid #f1e5ff",
            padding: "36px 32px",
            marginTop: "60px",
            
          }}
        >
          <ChatBot disease={result?.class_name} confidence={result?.confidence} />
        </div>
      </div>
    </div>
  );
}


// import styles from './Upload.module.css';
// import { Link } from 'react-router-dom';
// import Navbar from '../Homepage/Navbar';
// import Footer from '../Homepage/Footer';
// import upload from '../../assets/attach-file.png';


// function Upload({user}) {
//     return (
//         <div>
//             <Navbar user={user}/>
//             <div className={styles.container}>
//                 <h1>Let's start!</h1>
//                 <p>Add photo to make scan. You can upload photo from the device.</p>
//                 <button>
//                     <img src={upload} className={styles.uploadimg} />
//                     Upload Photo
//                 </button>
//             </div>
//             <Footer />
//         </div>
//     )
// }

// export default Upload;