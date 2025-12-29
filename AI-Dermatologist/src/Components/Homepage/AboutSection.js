import styles from './AboutSection.module.css';
import doctorImage from '../../assets/doctor.jpg'; // Using existing image, replace with actual FYP image if available

function AboutSection() {
    return (
        <div className={styles.aboutContainer}>
            <div className={styles.headerSection}>
                <div className={styles.iconContainer}>
                    <div className={styles.graduationIcon}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Medical Cross/Plus Icon */}
                            <rect x="11" y="5" width="2" height="14" rx="1" fill="white"/>
                            <rect x="5" y="11" width="14" height="2" rx="1" fill="white"/>
                            {/* Healthcare Platform Circle */}
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
                            <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1" fill="none" opacity="0.3"/>
                        </svg>
                    </div>
                </div>
                <h1 className={styles.title}>About This Project</h1>
                <p className={styles.intro}>
                    This comprehensive dermatology platform is my Final Year Project, combining AI technology 
                    with traditional healthcare services to create a complete solution for dermatology care, 
                    doctor-patient connectivity, and medical consultation.
                </p>
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.leftColumn}>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon} style={{ background: '#e3f2fd' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="#1976d2" strokeWidth="2" fill="none"/>
                                <circle cx="12" cy="12" r="4" fill="#1976d2"/>
                                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div className={styles.featureContent}>
                            <h3 className={styles.featureTitle}>Project Objective</h3>
                            <p className={styles.featureDescription}>
                                Create a comprehensive healthcare platform that bridges AI technology with 
                                traditional medical services for complete dermatology care.
                            </p>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon} style={{ background: '#f3e5f5' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="4" width="18" height="16" rx="2" stroke="#7b1fa2" strokeWidth="2" fill="none"/>
                                <rect x="5" y="7" width="6" height="4" rx="1" fill="#7b1fa2" opacity="0.3"/>
                                <rect x="13" y="7" width="6" height="4" rx="1" fill="#7b1fa2" opacity="0.3"/>
                                <rect x="5" y="13" width="14" height="4" rx="1" fill="#7b1fa2" opacity="0.3"/>
                            </svg>
                        </div>
                        <div className={styles.featureContent}>
                            <h3 className={styles.featureTitle}>Platform Features</h3>
                            <p className={styles.featureDescription}>
                                Doctor profiles, appointment booking, patient-doctor chat, AI skin analysis, 
                                and 24/7 AI assistant for comprehensive care.
                            </p>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon} style={{ background: '#e8f5e9' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="8" r="4" stroke="#388e3c" strokeWidth="2" fill="none"/>
                                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="#388e3c" strokeWidth="2" fill="none"/>
                                <path d="M16 8h4M16 12h4" stroke="#388e3c" strokeWidth="2" strokeLinecap="round"/>
                                <circle cx="18" cy="6" r="2" fill="#388e3c" opacity="0.3"/>
                            </svg>
                        </div>
                        <div className={styles.featureContent}>
                            <h3 className={styles.featureTitle}>User Experience</h3>
                            <p className={styles.featureDescription}>
                                Seamless integration of AI insights with professional medical consultation, 
                                providing users with multiple pathways to care.
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.rightColumn}>
                    <div className={styles.imageWrapper}>
                        <img 
                            src={doctorImage} 
                            alt="Healthcare Platform" 
                            className={styles.mainImage}
                        />
                        <div className={styles.imageTag}>
                            <div className={styles.tagText1}>FYP 2024</div>
                            <div className={styles.tagText2}>Healthcare Platform</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutSection;

