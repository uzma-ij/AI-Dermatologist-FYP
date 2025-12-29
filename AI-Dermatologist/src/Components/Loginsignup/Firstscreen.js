import styles from './Firstscreen.module.css';
import user from '../../assets/user.png';
import doctor from '../../assets/doctor1.png';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Toast from './Toast';


function Firstscreen() {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [toast, setToast] = useState(null);

    const handleCreateAccount = () => {
        if (role) {
            navigate("/Signup", { state: { role } }); // pass role to Signup screen
        } else {
            setToast({
                message: "Please select a role to continue.",
                type: 'warning'
            });
        }
    };

    return (
        <div className={styles.pageContainer}>
            <Link to="/" className={styles.logoLink}>
                <div className={styles.logoContainer}>
                    <div className={styles.logoIcon}>🩺</div>
                    <div className={styles.logo}>AI Dermatologist</div>
                </div>
            </Link>

            <div className={styles.container}>
                <div className={styles.contentWrapper}>
                    <div className={styles.headerSection}>
                        <h1 className={styles.mainHeading}>
                            Join as a <span className={styles.gradientText}>User</span> or <span className={styles.gradientText}>Doctor</span>
                        </h1>
                        <p className={styles.subtitle}>
                            Choose your role to get started with AI-powered skin diagnosis
                        </p>
                    </div>

                    <div className={styles.selectionbox}>
                        <div
                            className={`${styles.selectionCard} ${role === 'patient' ? styles.selected : ''}`}
                            onClick={() => setRole(role === 'patient' ? null : 'patient')}
                        >
                            <div className={styles.iconContainer}>
                                <img className={styles.icon} src={user} alt="User" />
                            </div>
                            <h2>I'm a user looking for a doctor</h2>
                        </div>
                        <div
                            className={`${styles.selectionCard} ${role === 'doctor' ? styles.selected : ''}`}
                            onClick={() => setRole(role === 'doctor' ? null : 'doctor')}
                        >
                            <div className={styles.iconContainer}>
                                <img className={styles.icon} src={doctor} alt="Doctor" />
                            </div>
                            <h2>I'm a doctor looking for a patient</h2>
                        </div>
                    </div>

                    <div className={styles.actionSection}>
                        <button 
                            className={styles.btn} 
                            onClick={handleCreateAccount} 
                            disabled={!role}
                        >
                            Create Account
                        </button>
                        <Link to="/Login" className={styles.mylink}>
                            <span>Already have an account? </span>
                            <span className={styles.loginLink}>Log In</span>
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

export default Firstscreen;