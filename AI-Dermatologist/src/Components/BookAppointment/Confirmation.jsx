import { React } from 'react';
import styles from './Confirmation.module.css';
import Navbar from '../Homepage/Navbar';
import Footer from '../Homepage/Footer';
import { useNavigate, Link } from 'react-router-dom';

function Confirmation({ user }) {
    const navigate = useNavigate();
    
    const viewBooking = () => {
        navigate(`/UserBookings/${user.id}`);
    };

    const goToHome = () => {
        navigate('/');
    };

    return (
        <div className={styles.pageContainer}>
            <Navbar user={user} />
            <div className={styles.container}>
                <div className={styles.confirmationCard}>
                    <div className={styles.iconContainer}>
                        <div className={styles.checkIcon}>
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    
                    <div className={styles.contentSection}>
                        <h1 className={styles.mainTitle}>
                            <span className={styles.gradientText}>Congratulations!</span>
                        </h1>
                        <p className={styles.description}>
                            Your appointment has been successfully booked and confirmed.
                        </p>
                        <p className={styles.subDescription}>
                            Your appointment details have been saved. You can view and manage your bookings anytime.
                        </p>
                    </div>

                    <div className={styles.actionButtons}>
                        <button className={styles.primaryButton} onClick={viewBooking}>
                            View My Bookings
                        </button>
                        <button className={styles.secondaryButton} onClick={goToHome}>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}




export default Confirmation;
