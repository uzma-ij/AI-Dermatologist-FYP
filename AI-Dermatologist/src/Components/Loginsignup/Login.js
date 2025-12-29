import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import imageurl from '../../assets/login.png';
import styles from './LoginPassword.module.css';
import { supabase } from '../../supabase';
import Toast from './Toast';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState(null);
  
  const handleLogin = async (e) => {
    e.preventDefault(); // prevent default form submit
    setErrorMsg(''); // reset error

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign-in error:", error.message);
      setErrorMsg(error.message);
      setToast({
        message: error.message,
        type: 'error'
      });
      return;
    }

    // Store login timestamp for 2-week expiration check
    const loginTimestamp = Date.now();
    localStorage.setItem('loginTimestamp', loginTimestamp.toString());

    // Check user role from your 'users' table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('email', email)
      .single();

    if (userError) {
      console.error("User role fetch error:", userError.message);
      setErrorMsg("Failed to fetch user role");
      setToast({
        message: "Failed to fetch user role. Please try again.",
        type: 'error'
      });
      return;
    }

    // Redirect based on role
    if (userData.role === 'admin') {
      navigate('/NewRequest', {
        state: {                              
          email: email,
          password: password
        }
      });
    } else {
      navigate('/'); // or wherever regular users should go
    }
  };

  return (
    <div className={styles.container} style={{ height: "100vh", overflow: "hidden" }}>
      {/* Left Half - Keep Original */}
      <div className={styles.lefthalf}>
        <img className={styles.image} src={imageurl} alt="Login" />
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
              Welcome Back
            </h1>
            <p style={{ margin: 0, color: "#475467", fontSize: "16px", lineHeight: 1.6 }}>
              Sign in to your account to continue
            </p>
          </div>

          <form
            onSubmit={handleLogin}
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

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label
                  style={{
                    color: "#344054",
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                >
                  Password
                </label>
                <Link
                  to="/Password"
                  style={{
                    color: "#667eea",
                    fontSize: "14px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

            {errorMsg && (
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#fef3f2",
                  border: "1px solid #fecdca",
                  borderRadius: "12px",
                  color: "#d92d20",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
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
              Sign In
            </button>

            <div style={{ textAlign: "center", marginTop: "8px" }}>
              <p style={{ margin: 0, color: "#475467", fontSize: "14px" }}>
                Don't have an account?{" "}
                <Link
                  to="/Firstscreen"
                  style={{
                    color: "#667eea",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
                >
                  Sign up
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

export default Login;