import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from './LoginPassword.module.css';
import { supabase } from '../../supabase';
import Toast from './Toast';
import imageurl from '../../assets/login.png';

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isValidToken, setIsValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    // Check if we have a valid password reset token in the URL hash
    const checkResetToken = async () => {
      try {
        // Get the hash from URL (Supabase sends token in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (accessToken && type === 'recovery') {
          // Try to set the session with the recovery token
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });

          if (error) {
            console.error('Token validation error:', error);
            setToast({
              message: 'Invalid or expired reset link. Please request a new one.',
              type: 'error'
            });
            setIsValidToken(false);
          } else {
            setIsValidToken(true);
          }
        } else {
          // Check if user is already authenticated (might have clicked link and been redirected)
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setIsValidToken(true);
          } else {
            setToast({
              message: 'Invalid or expired reset link. Please request a new one.',
              type: 'error'
            });
            setIsValidToken(false);
          }
        }
      } catch (error) {
        console.error('Error checking token:', error);
        setToast({
          message: 'An error occurred. Please try again.',
          type: 'error'
        });
        setIsValidToken(false);
      } finally {
        setCheckingToken(false);
      }
    };

    checkResetToken();
  }, []);

  const validatePassword = (pwd) => {
    // Password must be at least 8 characters, contain uppercase, number, and special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setToast(null);

    // Validation
    if (!password || !confirmPassword) {
      setToast({
        message: 'Please fill in all fields',
        type: 'error'
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setToast({
        message: 'Passwords do not match',
        type: 'error'
      });
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setToast({
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character',
        type: 'error'
      });
      setIsLoading(false);
      return;
    }

    try {
      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        setToast({
          message: error.message || 'Failed to reset password. Please try again.',
          type: 'error'
        });
        setIsLoading(false);
        return;
      }

      // Success
      setToast({
        message: 'Password reset successfully! Redirecting to login...',
        type: 'success'
      });

      // Wait a moment then redirect to login
      setTimeout(() => {
        navigate('/Login');
      }, 2000);
    } catch (error) {
      console.error('Unexpected error:', error);
      setToast({
        message: 'An unexpected error occurred. Please try again.',
        type: 'error'
      });
      setIsLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className={styles.container} style={{ height: "100vh", overflow: "hidden" }}>
        <div className={styles.lefthalf}>
          <img className={styles.image} src={imageurl} alt="Password Reset" />
        </div>
        <div className={styles.righthalf} style={{ justifyContent: "center", padding: "40px" }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                margin: "0 auto 16px",
                border: "4px solid #e5e7eb",
                borderTop: "4px solid #667eea",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{ color: "#475467", fontSize: "16px" }}>Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className={styles.container} style={{ height: "100vh", overflow: "hidden" }}>
        <div className={styles.lefthalf}>
          <img className={styles.image} src={imageurl} alt="Password Reset" />
        </div>
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
                backgroundColor: "#fef3f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="#d92d20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                Invalid Reset Link
              </h1>
              <p style={{ margin: "0 0 24px", color: "#475467", fontSize: "16px", lineHeight: 1.6 }}>
                This password reset link is invalid or has expired. Please request a new one.
              </p>
            </div>

            <Link
              to="/Password"
              style={{
                width: "100%",
                padding: "16px",
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
              Request New Reset Link
            </Link>
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
              Enter your new password
            </h1>
            <p style={{ margin: 0, color: "#475467", fontSize: "16px", lineHeight: 1.6 }}>
              Your new password must be different from previous passwords
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
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password"
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
              <p style={{ margin: "4px 0 0", color: "#667085", fontSize: "12px" }}>
                Must be at least 8 characters with uppercase, number, and special character
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                style={{
                  color: "#344054",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
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
              {isLoading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;

