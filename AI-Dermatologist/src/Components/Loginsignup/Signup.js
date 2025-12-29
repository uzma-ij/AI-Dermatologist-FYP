import styles from './Signup.module.css';
import React, { useState } from 'react';
import imageurl from '../../assets/signup.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import Modal from './Model';
import Toast from './Toast'; 


function Signup() {
    const navigate = useNavigate();
    const location = useLocation();
    const role = location.state?.role;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [toast, setToast] = useState(null); 

    const handleSignup = async (e) => {
        e.preventDefault();

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setToast({
                message: "Password must be at least 8 characters long and include one uppercase letter, one digit, and one special character.",
                type: 'error'
            });
            return;
        }

        if (!role) {
            setToast({
                message: "Role not selected. Please go back and select a role.",
                type: 'warning'
            });
            return;
        }

        // Check if email already exists in users table
        const { data: existingUser } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            setToast({
                message: "This email is already registered. Please use a different email or try logging in instead.",
                type: 'error'
            });
            return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${import.meta.env.VITE_API_URL}/Login`
              }
        });

        if (authError) {
            // Check if error is about duplicate email
            const errorMessage = authError.message.toLowerCase();
            if (errorMessage.includes('already registered') || 
                errorMessage.includes('already exists') || 
                errorMessage.includes('user already') ||
                errorMessage.includes('email address has already been registered')) {
                setToast({
                    message: "This email is already registered. Please use a different email or try logging in instead.",
                    type: 'error'
                });
            } else {
                setToast({
                    message: authError.message,
                    type: 'error'
                });
            }
            return;
        }

        const userId = authData?.user?.id;

        if (userId) {
            const { error: dbError } = await supabase.from('users').insert([{
                id: userId,
                name,
                email,
                role
            }]);

            if (dbError) {
                // Check if it's a duplicate key error
                const errorMessage = dbError.message?.toLowerCase() || '';
                if (errorMessage.includes('duplicate') || 
                    errorMessage.includes('unique') || 
                    errorMessage.includes('already exists')) {
                    setToast({
                        message: "This email is already registered. Please use a different email or try logging in instead.",
                        type: 'error'
                    });
                } else {
                    setToast({
                        message: "Signup successful, but failed to save profile. Please contact support.",
                        type: 'warning'
                    });
                }
            }
        }

        setShowPopup(true);
    };

    return (
        <div className={styles.container} style={{ height: "100vh", overflow: "hidden" }}>
            {/* Left Half - Keep Original */}
            <div className={styles.lefthalf}>
                <h1>Welcome To AI Dermaotlogist</h1>
                <img className={styles.image} src={imageurl} alt="signup" />
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
                    <div style={{ textAlign: "left" }}>
                        {/* <p style={{ margin: "0 0 12px", color: "#475467", fontSize: "16px", lineHeight: 1.6 }}>
                            Early skin diagnosis with AI-powered precision
                        </p> */}
                        <h1
                            style={{
                                margin: "0 0 12px",
                                color: "#101828",
                                fontSize: "32px",
                                fontWeight: 700,
                            }}
                        >
                            Create Account
                        </h1>
                        <p style={{ margin: 0, color: "#475467", fontSize: "16px", lineHeight: 1.6 }}>
                            Sign up to get started with AI-powered skin diagnosis
                        </p>
                    </div>

                    <form
                        onSubmit={handleSignup}
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
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                            <p style={{ margin: "4px 0 0", color: "#667085", fontSize: "12px" }}>
                                Must be at least 8 characters with uppercase, number, and special character
                            </p>
                        </div>

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
                            Sign Up
                        </button>

                        <div style={{ textAlign: "center", marginTop: "8px" }}>
                            <p style={{ margin: 0, color: "#475467", fontSize: "14px" }}>
                                Already have an account?{" "}
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

            {showPopup && (
                <Modal
                    title="Confirm Your Email"
                    message={`We've sent a confirmation link to ${email}. Please check your inbox.`}
                    onClose={() => {
                        setShowPopup(false);
                        navigate('/Login');
                    }}
                />
            )}

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

export default Signup;