import React, { useState } from 'react';
import styles from './FAQSection.module.css';

function FAQSection() {
    const [openItems, setOpenItems] = useState([]); // All items closed by default

    const faqs = [
        {
            question: "What services does the platform offer?",
            answer: "Our platform offers doctor profile creation, patient registration, appointment booking, secure doctor-patient chat, AI-powered skin analysis, and 24/7 AI assistant support for comprehensive dermatology care."
        },
        {
            question: "How does the AI analysis work with doctor consultations?",
            answer: "The AI analysis provides preliminary skin condition assessment that can help you find appropriate specialists and prepare for consultations. Doctors can review AI results alongside their professional examination for comprehensive care."
        },
        {
            question: "Can doctors create profiles and manage appointments?",
            answer: "Yes, doctors can create comprehensive profiles with credentials, specializations, and availability. They can manage their schedules, appointments, communicate with patients, and access AI analysis results to enhance their consultations."
        }
    ];

    const toggleFAQ = (index) => {
        setOpenItems(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    return (
        <div className={styles.faqContainer}>
            <div className={styles.headerSection}>
                <h1 className={styles.title}>Frequently Asked Questions</h1>
                <p className={styles.subtitle}>
                    Common questions about the AI Dermatologist platform and its comprehensive healthcare services.
                </p>
            </div>

            <div className={styles.faqList}>
                {faqs.map((faq, index) => (
                    <div 
                        key={index} 
                        className={styles.faqItem}
                        onClick={() => toggleFAQ(index)}
                    >
                        <div className={styles.faqHeader}>
                            <h3 className={styles.faqQuestion}>{faq.question}</h3>
                            <div className={styles.faqIcon}>
                                <svg 
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={openItems.includes(index) ? styles.iconOpen : styles.iconClosed}
                                >
                                    <path 
                                        d="M18 15l-6-6-6 6" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>
                        {openItems.includes(index) && (
                            <div className={styles.faqAnswer}>
                                <p>{faq.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FAQSection;

