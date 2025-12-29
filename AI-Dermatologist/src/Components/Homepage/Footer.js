import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = React.memo(() => {
  const handleScrollTo = useCallback((e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>🩺</div>
            {/* <div className={styles.logoIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4v6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 10h8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 10c0 1.1.9 2 2 2s2-.9 2-2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M7 14h10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="14" r="2" fill="white"/>
                <circle cx="15" cy="14" r="2" fill="white"/>
                <path d="M12 18v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div> */}
            <h2 className={styles.logoText}>AI Dermatologist</h2>
          </div>
          <p className={styles.description}>
            A comprehensive Final Year Project combining AI technology with traditional healthcare services to create a complete dermatology platform for patients and doctors.
          </p>
          <div className={styles.socialIcons}>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="2" y="9" width="4" height="12" stroke="white" strokeWidth="2"/>
                <circle cx="4" cy="4" r="2" stroke="white" strokeWidth="2"/>
              </svg>
            </a>
            <a href="mailto:contact@aidermatologist.com" className={styles.socialIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,6 12,13 2,6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h2 className={styles.sectionTitle}>Quick Links</h2>
          <ul className={styles.clickableList}>
           
            
           
            <li>
              <a 
                href="#features" 
                onClick={(e) => handleScrollTo(e, 'features')}
                className={styles.scrollLink}
              >
                Features
              </a>
            </li>
            <li>
              <a 
                href="#how-it-works" 
                onClick={(e) => handleScrollTo(e, 'how-it-works')}
                className={styles.scrollLink}
              >
                About
              </a>
            </li>
            <li>
              <a 
                href="#faq" 
                onClick={(e) => handleScrollTo(e, 'faq')}
                className={styles.scrollLink}
              >
                FAQ
              </a>
            </li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h2 className={styles.sectionTitle}>Dermatology Conditions</h2>
          <ul className={styles.nonClickableList}>
            <li>Cellulitis</li>
            <li>Impetigo</li>
            <li>Tinea pedis</li>
            <li>Nail fungus</li>
            <li>Tinea corporis</li>
            <li>Cutaneous larva migrans</li>
            <li>Chickenpox</li>
            <li>Shingles</li>
          </ul>
        </div>
      </div>

      <div className={styles.copyrightSection}>
        <div className={styles.copyrightLine}></div>
        <p className={styles.copyrightText}>
          © 2024 AI Dermatologist Platform. This is a comprehensive student research project for educational purposes.
        </p>
      </div>
    </div>
  );
});

Footer.displayName = 'Footer';

export default Footer;
