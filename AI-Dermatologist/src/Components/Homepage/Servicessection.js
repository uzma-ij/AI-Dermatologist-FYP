import styles from './Services.module.css';
// Import disease images
import disease1 from '../../assets/diease1.jpeg';
import disease2 from '../../assets/disease2.jpeg';
import disease3 from '../../assets/disease3.jpeg';
import disease4 from '../../assets/disease4.jpeg';
import disease5 from '../../assets/disease5.jpeg';
import disease6 from '../../assets/disease6.jpeg';
import disease7 from '../../assets/disease7.jpeg';
import disease8 from '../../assets/disease8.jpeg';

const diseases = [
    { 
        src: disease1, 
        name: "Cellulitis",
        description: "Cellulitis is a bacterial skin infection that causes redness, swelling, warmth, and pain, usually on the lower legs. It happens when bacteria enter through a cut or break in the skin. If untreated, it can become serious. Common symptoms include fever, chills, and feeling unwell."
    },
    { 
        src: disease2, 
        name: "Impetigo",
        description: "Impetigo is a highly contagious, superficial skin infection caused by bacteria. It appears as red sores that can develop into honey-colored, crusty patches and is particularly common in infants and young children. Frequently affects the face, especially around the nose and mouth, as well as the hands and feet. Can be itchy and sometimes painful."
    },
    { 
        src: disease3, 
        name: "Athlete's Foot",
        description: "Athlete's foot, is a fungal skin infection that typically begins between the toes and is characterized by an itchy, scaly rash. It is a contagious condition that can affect anyone, not just athletes, and often occurs in individuals whose feet become very sweaty while confined in tight-fitting shoes. Symptoms may include a burning sensation and redness, and it can lead to more severe skin issues if left untreated."
    },
    { 
        src: disease4, 
        name: "Nail Fungus",
        description: "Nail fungus occurs when fungi invade the nail bed, often starting as a small white or yellow spot under the tip of the nail. As the infection progresses, it can cause the nail to become discolored, thickened, and brittle, potentially leading to pain and difficulty wearing shoes."
    },
    { 
        src: disease5, 
        name: "Ringworm",
        description: "Ringworm is a common, contagious fungal skin infection that creates a red, itchy, and sometimes ring-shaped rash. Despite its name, it is not caused by a worm and is medically known as tinea. It can spread through direct skin-to-skin contact, contact with infected animals, or touching contaminated objects and surfaces."
    },
    { 
        src: disease6, 
        name: "Cutaneous Larva Migrans",
        description: "Cutaneous larva migrans (CLM) is a parasitic skin infection caused by the larvae of animal hookworms, most commonly from dogs and cats, which enter the skin of humans through direct contact with contaminated soil. It presents as an intensely itchy, red, serpiginous (snakelike) rash that moves under the skin, and is most often found on areas like the feet, hands, and buttocks."
    },
    { 
        src: disease7, 
        name: "Chicken Pox",
        description: "Chickenpox is an illness caused by the varicella-zoster virus. It brings on an itchy rash with small, fluid-filled blisters. Chickenpox spreads very easily to people who haven't had the disease or haven't gotten the chickenpox vaccine."
    },
    { 
        src: disease8, 
        name: "Shingles",
        description: "Shingles, or herpes zoster, is a painful rash caused by the reactivation of the varicella-zoster virus, the same virus that causes chickenpox. It is characterized by a rash that typically appears on one side of the body or face. The virus remains dormant in nerve tissue after a person has had chickenpox and can reactivate later in life, often in individuals over 50 or those with weakened immune systems."
    }
];

function Servicessection() {
    return (
        <div className={styles.Servicecontainer}>
            <div className={styles.diseaseOverviewSection}>
                <h2 className={styles.diseaseOverviewTitle}>Disease Overview</h2>
                <div className={styles.diseaseGrid}>
                    {diseases.map((disease, index) => (
                        <div key={index} className={styles.diseaseCard}>
                            <img 
                                src={disease.src} 
                                alt={disease.name} 
                                className={styles.diseaseImage}
                            />
                            <h3 className={styles.diseaseName}>{disease.name}</h3>
                            <p className={styles.diseaseDescription}>{disease.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.headerSection}>
                <h1 className={styles.mainTitle}>Complete Healthcare Solution</h1>
                <p className={styles.mainDescription}>
                    A comprehensive platform that combines AI technology with traditional healthcare services for complete dermatology care.
                </p>
            </div>
            
            <div className={styles.cardsContainer}>
                <div className={styles.card} style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
                    <div className={styles.cardIcon} style={{ color: '#1976d2' }}>
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <circle cx="18" cy="5" r="2.5" fill="currentColor" opacity="0.3"/>
                            <path d="M20 7l-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <h2 className={styles.cardTitle}>Find Doctors</h2>
                    <p className={styles.cardDescription}>
                        Browse verified dermatologist profiles, check availability, read reviews, and find the perfect specialist for your needs.
                    </p>
                    <div className={styles.cardVisual}>
                        <div className={styles.visualPlaceholder}>
                            <div className={styles.visualItem}>
                                <div className={styles.visualAvatar}></div>
                                <div className={styles.visualInfo}>
                                    <div className={styles.visualName}>Dr. Uzma</div>
                                    <div className={styles.visualRating}>⭐⭐⭐⭐⭐</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.card} style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' }}>
                    <div className={styles.cardIcon} style={{ color: '#388e3c' }}>
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
                            <path d="M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <h2 className={styles.cardTitle}>Book Appointments</h2>
                    <p className={styles.cardDescription}>
                        Easy online appointment booking system with real-time availability, notifications, and flexible scheduling options.
                    </p>
                    <div className={styles.cardVisual}>
                        <div className={styles.visualPlaceholder}>
                            <div className={styles.calendarVisual}>
                                <div className={styles.calendarGrid}>
                                    <div className={styles.calendarDay}>Mon</div>
                                    <div className={styles.calendarDay}>Tue</div>
                                    <div className={styles.calendarDay}>Wed</div>
                                    <div className={styles.calendarSlot}>9:00 AM</div>
                                    <div className={styles.calendarSlot}>2:00 PM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.card} style={{ background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)' }}>
                    <div className={styles.cardIcon} style={{ color: '#7b1fa2' }}>
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <circle cx="9" cy="10" r="1" fill="currentColor"/>
                            <circle cx="15" cy="10" r="1" fill="currentColor"/>
                            <path d="M9 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <h2 className={styles.cardTitle}>Chat with Doctors</h2>
                    <p className={styles.cardDescription}>
                        Secure messaging system for direct communication with your dermatologist, follow-up consultations, and ongoing care.
                    </p>
                    <div className={styles.cardVisual}>
                        <div className={styles.visualPlaceholder}>
                            <div className={styles.chatVisual}>
                                <div className={styles.chatBubble}>Hello, how can I help?</div>
                                <div className={styles.chatBubble}>I have a question about...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.cardsContainer}>
                <div className={styles.card} style={{ background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)' }}>
                    <div className={styles.cardIcon} style={{ color: '#f57c00' }}>
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M12 4c-2.5 0-4.5 2-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                            <path d="M12 20c2.5 0 4.5-2 4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                        </svg>
                    </div>
                    <h2 className={styles.cardTitle}>AI Skin Analysis</h2>
                    <p className={styles.cardDescription}>
                        Advanced AI-powered skin condition detection and analysis providing instant preliminary assessments.
                    </p>
                    <div className={styles.cardVisual}>
                        <div className={styles.visualPlaceholder}>
                            <div className={styles.aiAnalysisVisual}>
                                <div className={styles.metricsList}>
                                    <div className={styles.metric}>Pores: 85%</div>
                                    <div className={styles.metric}>Redness: 12%</div>
                                    <div className={styles.metric}>Hydration: 78%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.card} style={{ background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)' }}>
                    <div className={styles.cardIcon} style={{ color: '#00796b' }}>
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" opacity="0.2"/>
                            <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
                            <circle cx="15" cy="9" r="1.5" fill="currentColor"/>
                            <path d="M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <h2 className={styles.cardTitle}>AI Assistant</h2>
                    <p className={styles.cardDescription}>
                        24/7 AI-powered assistant to answer questions about skin conditions, provide general guidance, and help navigate the platform.
                    </p>
                    <div className={styles.cardVisual}>
                        <div className={styles.visualPlaceholder}>
                            <div className={styles.aiAssistantVisual}>
                                <div className={styles.assistantBubble}>How can I help you today?</div>
                                <div className={styles.assistantBubble}>Ask me about skin conditions...</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.card} style={{ background: 'linear-gradient(135deg, #ede7f6 0%, #d1c4e9 100%)' }}>
                    <div className={styles.cardIcon} style={{ color: '#5e35b1' }}>
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <circle cx="16" cy="6" r="2" fill="currentColor" opacity="0.3"/>
                            <path d="M18 4l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <h2 className={styles.cardTitle}>Doctor Profiles</h2>
                    <p className={styles.cardDescription}>
                        Comprehensive profile management for doctors including  specializations, availability, and patient reviews.
                    </p>
                    <div className={styles.cardVisual}>
                        <div className={styles.visualPlaceholder}>
                            <div className={styles.profileVisual}>
                                <div className={styles.profileHeader}>
                                    <div className={styles.profileAvatar}></div>
                                    <div className={styles.profileInfo}>
                                        <div className={styles.profileName}>Dr. Sheeza</div>
                                        <div className={styles.profileSpecialty}>Dermatologist</div>
                                    </div>
                                </div>
                                <div className={styles.profileStats}>
                                    <div className={styles.stat}>5.0 ⭐</div>
                                    <div className={styles.stat}>120 Reviews</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Servicessection;