import styles from './Profile.module.css';
import Navbar from '../Homepage/Navbar';
import { MapPin, Phone, MessageSquare } from "lucide-react"
import Footer from '../Homepage/Footer';
import doctor from '../../assets/doctorlist.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Reviews from './Reviews.jsx';
import Bookappointment from '../BookAppointment/Bookappointment.jsx';

function Profile({ user }) {


    const navigate = useNavigate();
    const { doctorId } = useParams();
    const [approvals, setApproval] = useState(null);
    const [settings, setSetting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openFAQItems, setOpenFAQItems] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Profile/${doctorId}`);

                setApproval(res.data.approval);
                setSetting(res.data.setting);


            } catch (err) {

                console.error('Error fetching doctor profile:', err);
            }
            finally {
                setLoading(false); // stop loading once request finishes
            };
        };
        fetchDoctor();
    }, [doctorId]);



    return (
        <div>
            <Navbar user={user} />
            <div className={styles.profilecontainer}>
                {loading ? (

                    <div className={styles.loaderBox}>

                        <div className={styles.loader}></div>
                        <p>Loading profile...</p>
                    </div>
                ) : (
                    <>
                        <header className={styles.profileheader}>
                            <div className={styles.avatarcontainer}>
                                <img src={approvals?.photoUrl} alt="Doctor avatar" className={styles.avatar} />
                            </div>
                            <div className={styles.headerinfo}>
                                <h1>
                                    {approvals?.name} <span className={styles.title}>(PMDC verified)</span>
                                </h1>
                                <p className={styles.specialty}>{approvals?.specialization}</p>
                                <div className={styles.locationinfo}>
                                    <MapPin size={16} className={styles.icon} />
                                    <span>{approvals?.location}</span>
                                </div>
                                <div className={styles.contactinfo}>
                                    <Phone size={16} className={styles.icon} />
                                    <span >{approvals?.phone}</span>
                                </div>
                            </div>
                        </header>

                        <div className={styles.profilecontent}>
                            <div className={styles.maincontentpro}>
                                <section className={styles.aboutsection}>
                                    <h2>About</h2>
                                    <p>
                                        {settings?.about}
                                    </p>

                                </section>
                                {settings?.experience && settings.experience.length > 0 && (
                                    <section className={styles.experiencesection}>
                                        <h2>Experience</h2>
                                        {settings.experience.map((set, index) => {
                                            const formatDate = (dateString) => {
                                                if (!dateString) return '';
                                                try {
                                                    const date = new Date(dateString);
                                                    if (isNaN(date.getTime())) {
                                                        // If it's not a valid date, return as is (might be "Present" or similar)
                                                        return dateString;
                                                    }
                                                    return date.toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric', 
                                                        year: 'numeric' 
                                                    });
                                                } catch (e) {
                                                    return dateString;
                                                }
                                            };
                                            
                                            const formattedStart = formatDate(set.start);
                                            const formattedEnd = formatDate(set.end);
                                            
                                            return (
                                                <div key={set.id || index} className={styles.experienceitem}>
                                                    <h3>{set.hospital}</h3>
                                                    <p className={styles.jobtitle}>{set.role}</p>
                                                    <p className={styles.jobperiod}>
                                                        {formattedStart} - {formattedEnd}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </section>
                                )}
                                <Reviews doctorId={doctorId} user={user} />

                                {/* <section className={styles.reviewssection}>
                                    <h2>Reviews about {approvals?.name}</h2>
                                    <div className={styles.reviewitem}>
                                        <div className={styles.reviewerinfo}>
                                            <div className={styles.revieweravatar}>S</div>
                                            <div>
                                                <p className={styles.reviewername}>Sheeza Qamar</p>
                                                <p className={styles.reviewdate}>Jan 28, 2023</p>
                                            </div>
                                        </div>
                                        <p className={styles.reviewtext}>"Good Experience with Dr Mahpara safdar"</p>
                                    </div>
                                </section> */}

                                {settings?.faqs && settings.faqs.length > 0 && (
                                    <section className={styles.faqsection}>
                                        <h2>Frequently Asked Questions</h2>
                                        <div className={styles.faqList}>
                                            {settings.faqs.map((item, index) => {
                                                const isOpen = openFAQItems.includes(index);
                                                return (
                                                    <div 
                                                        key={index}
                                                        className={styles.faqItem}
                                                        onClick={() => {
                                                            setOpenFAQItems(prev => 
                                                                prev.includes(index) 
                                                                    ? prev.filter(i => i !== index)
                                                                    : [...prev, index]
                                                            );
                                                        }}
                                                    >
                                                        <div className={styles.faqHeader}>
                                                            <h3 className={styles.faqQuestion}>{item.question}</h3>
                                                            <div className={styles.faqIcon}>
                                                                <svg 
                                                                    width="20" 
                                                                    height="20" 
                                                                    viewBox="0 0 24 24" 
                                                                    fill="none" 
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className={isOpen ? styles.iconOpen : styles.iconClosed}
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
                                                        {isOpen && (
                                                            <div className={styles.faqAnswer}>
                                                                <p>{item.answer}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}
                            </div>
                            <div className={styles.profilesidebar}>
                                <div className={styles.clinicinfo}>
                                    <h2>{approvals?.name} Clinic</h2>
                                    
                                    <div className={`${styles.consultationOption} ${styles.inPersonOption}`}>
                                        <div className={styles.optionContent}>
                                            <div className={`${styles.optionIcon} ${styles.inPersonIcon}`}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                            <span className={styles.optionLabel}>Consultation Fee</span>
                                        </div>
                                        <span className={`${styles.optionPrice} ${styles.inPersonPrice}`}>
                                            Rs. {settings?.fees ? Number(settings.fees).toLocaleString() : '3,000'}
                                        </span>
                                    </div>

                                    <button 
                                        className={styles.bookappointmentbtn} 
                                        onClick={() => {
                                            if (user && String(user.id) === String(doctorId)) {
                                                return;
                                            }
                                            if (user?.role === 'doctor') {
                                                return;
                                            }
                                            navigate(`/BookAppointment/${doctorId}`);
                                        }}
                                        disabled={user && (String(user.id) === String(doctorId) || user?.role === 'doctor')}
                                        title={user?.role === 'doctor' ? "Doctors cannot book appointments for themselves. Please log in as a patient to book an appointment." : (user && String(user.id) === String(doctorId) ? "You cannot book an appointment with yourself." : "")}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        Book Appointment
                                    </button>
                                    
                                    <button 
                                        className={styles.messagebtn} 
                                        onClick={async () => {
                                            if (!user) {
                                                setAlertMessage("Please login to start a chat");
                                                setShowAlert(true);
                                                setTimeout(() => setShowAlert(false), 3000);
                                                return;
                                            }

                                            if (String(user.id) === String(doctorId)) {
                                                setAlertMessage("You cannot message yourself.");
                                                setShowAlert(true);
                                                setTimeout(() => setShowAlert(false), 3000);
                                                return;
                                            }

                                            try {
                                                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ user1: user.id, user2: doctorId }),
                                                });

                                                if (res.ok) {
                                                    const chat = await res.json();
                                                    navigate(`/Chat/${chat.id}`);
                                                } else {
                                                    console.error("Failed to create/find chat", await res.text());
                                                    setAlertMessage("Failed to start chat. Please try again.");
                                                    setShowAlert(true);
                                                    setTimeout(() => setShowAlert(false), 3000);
                                                }
                                            } catch (err) {
                                                console.error("Error starting chat:", err);
                                                setAlertMessage("Error starting chat. Please try again.");
                                                setShowAlert(true);
                                                setTimeout(() => setShowAlert(false), 3000);
                                            }
                                        }}
                                    >
                                        <MessageSquare size={16} className={styles.messageIcon} />
                                        Message Me
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Alert Popup */}
                {showAlert && (
                    <div className={styles.alertOverlay}>
                        <div className={styles.alertPopup}>
                            <div className={styles.alertIcon}>⚠️</div>
                            <h3 className={styles.alertTitle}>Notice</h3>
                            <p className={styles.alertMessage}>{alertMessage}</p>
                            <button className={styles.alertButton} onClick={() => setShowAlert(false)}>
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}

export default Profile;