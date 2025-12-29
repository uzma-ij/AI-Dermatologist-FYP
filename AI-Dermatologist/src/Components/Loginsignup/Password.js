import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from './LoginPassword.module.css';
import { supabase } from '../../supabase';
import Toast from './Toast';
import imageurl from '../../assets/login.png';

function Password() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setToast(null);

    if (!email) {
      setToast({
        message: 'Please enter your email address',
        type: 'error'
      });
      setIsLoading(false);
      return;
    }

    try {
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/ResetPassword`,
      });

      if (error) {
        console.error('Password reset error:', error);
        setToast({
          message: error.message || 'Failed to send password reset email. Please try again.',
          type: 'error'
        });
        setIsLoading(false);
        return;
      }

      // Success - show success message
      setEmailSent(true);
      setToast({
        message: 'Password reset email sent! Please check your inbox.',
        type: 'success'
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      setToast({
        message: 'An unexpected error occurred. Please try again.',
        type: 'error'
      });
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className={styles.container} style={{ height: "100vh", overflow: "hidden" }}>
        {/* Left Half - Keep Original */}
        <div className={styles.lefthalf}>
          <img className={styles.image} src={imageurl} alt="Password Reset" />
        </div>

        {/* Right Half - Success Message */}
        <div className={styles.righthalf} style={{ justifyContent: "center", padding: "40px" }}>
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              display: "flex",
              flexDirection: "column",
              gap: "32px",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#ecfdf3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="#12b76a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div>
              <h1
                style={{
                  margin: "0 0 12px",
                  color: "#101828",
                  fontSize: "32px",
                  fontWeight: 700,
                }}
              >
                Check Your Email
              </h1>
              <p style={{ margin: "0 0 8px", color: "#475467", fontSize: "16px", lineHeight: 1.6 }}>
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p style={{ margin: "0", color: "#667085", fontSize: "14px", lineHeight: 1.6 }}>
                Please check your inbox and click on the link to reset your password.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #d0d5dd",
                  background: "#ffffff",
                  color: "#344054",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                  e.currentTarget.style.borderColor = "#667eea";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.borderColor = "#d0d5dd";
                }}
              >
                Resend Email
              </button>

              <Link
                to="/Login"
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: 600,
                  textDecoration: "none",
                  textAlign: "center",
                  display: "block",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                }}
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ height: "100vh", overflow: "hidden" }}>
      {/* Left Half - Keep Original */}
      <div className={styles.lefthalf}>
        <img className={styles.image} src={imageurl} alt="Password Reset" />
      </div>

      {/* Right Half - Updated Modern Design */}
      <div className={styles.righthalf} style={{ justifyContent: "center", padding: "40px" }}>
        <div
          style={{
            width: "100%",
            maxWidth: "480px",
            display: "flex",
            flexDirection: "column",
            gap: "32px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                margin: "0 0 12px",
                color: "#101828",
                fontSize: "32px",
                fontWeight: 700,
              }}
            >
              Reset your Password
            </h1>
            <p style={{ margin: 0, color: "#475467", fontSize: "16px", lineHeight: 1.6 }}>
              Enter the email address associated with your account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                style={{
                  color: "#344054",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  fontSize: "16px",
                  border: "1px solid #d0d5dd",
                  borderRadius: "12px",
                  backgroundColor: "#ffffff",
                  color: "#101828",
                  outline: "none",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d0d5dd";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "none",
                background: isLoading 
                  ? "#94a3b8" 
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow: isLoading 
                  ? "none" 
                  : "0 4px 12px rgba(102, 126, 234, 0.4)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                }
              }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div style={{ textAlign: "center", marginTop: "8px" }}>
              <p style={{ margin: 0, color: "#475467", fontSize: "14px" }}>
                Remember your password?{" "}
                <Link
                  to="/Login"
                  style={{
                    color: "#667eea",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Password;
