import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styles from './Navbar.module.css';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import Modal from '../Loginsignup/Model';
import userimg from '../../assets/doctorlist.png';
import { supabase } from "../../supabase";
import notificationService from '../../services/notificationService';
import NotificationPopup from '../NotificationPopup/NotificationPopup';
import { Link } from 'react-router-dom';


export default function Navbar({ user }) {
    const [showModal, setShowModal] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [hasSubmittedProfile, setHasSubmittedProfile] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState(null);
    const [unreadChats, setUnreadChats] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [currentNotification, setCurrentNotification] = useState(null);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const profileColumnRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    const isLoggedIn = useMemo(() => !!user, [user]);
    const isHomePage = location.pathname === '/';

    // Memoize all handlers to prevent unnecessary re-renders
    const handleProtectedClick = useCallback((e) => {
        if (!isLoggedIn) {
            e.preventDefault();
            setShowModal(true);
        }
    }, [isLoggedIn]);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
    }, []);

    const handleProfileClick = useCallback(() => {
        if (user?.role === 'doctor') {
            setShowPopup(prev => !prev);
        }
    }, [user?.role]);

    const handleProfileForApproval = useCallback(() => {
        if (hasSubmittedProfile) {
            // Show status modal instead of navigating
            setShowStatusModal(true);
            setShowLogoutPopup(false);
        } else {
            // Navigate to form if no profile submitted yet
        navigate('/ProfileDraft');
            setShowLogoutPopup(false);
        }
    }, [navigate, hasSubmittedProfile]);

    const handleDashboard = useCallback(() => {
        navigate('/NewRequest');
        setShowLogoutPopup(false);
    }, [navigate]);

    const handleCreateProfile = useCallback(() => {
        setShowPopup(false);
        navigate('/ProfileDraft');
    }, [navigate]);

    const profileSettings = useCallback(() => {
        setShowPopup(false);
        navigate("/ProfileSetting");
    }, [navigate]);

    const handleProfileSettings = useCallback(() => {
        navigate('/ProfileSetting');
        setShowLogoutPopup(false);
    }, [navigate]);

    const handleNotificationClick = useCallback(() => {
        navigate('/Notifications');
    }, [navigate]);

    const handleBookings = useCallback((e) => {
        setShowPopup(false);
        if (!isLoggedIn) {
            setShowModal(true);
            return;
        }
        navigate(`/UserBookings/${user.id}`);
    }, [isLoggedIn, user?.id, navigate]);

    const handleNotificationReceived = useCallback((notification) => {
        console.log('New notification received:', notification);
        setCurrentNotification(notification);
        setUnreadNotifications(prev => prev + 1);
        if (notification?.type === 'message') {
            setUnreadChats(prev => prev + 1);
        }
        playNotificationSound();
    }, []);

    const handleNotificationClose = useCallback(() => {
        setCurrentNotification(null);
    }, []);

    const handleMarkAsRead = useCallback(async (notificationId) => {
        await notificationService.markAsRead(notificationId);
        setUnreadNotifications(prev => Math.max(0, prev - 1));
    }, []);

    const playNotificationSound = useCallback(() => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }, []);

    useEffect(() => {
        if (!user?.id || user?.role !== 'doctor') return;

        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('ProfileforApproval')
                .select('id,approvalStatus')
                .eq('id', user.id)
                .maybeSingle();

            if (data) {
                setHasSubmittedProfile(true); // Profile already exists
                setApprovalStatus(data.approvalStatus);
            } else {
                setHasSubmittedProfile(false); // No profile yet
                setApprovalStatus(null); // no profile yet
            }
        };

        // Initial fetch
            fetchProfile();

        // Subscribe to real-time changes for approval status updates
        const channel = supabase
            .channel('profile-approval-status')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'ProfileforApproval',
                    filter: `id=eq.${user.id}`
                },
                (payload) => {
                    console.log('Profile approval status updated:', payload.new);
                    if (payload.new.approvalStatus) {
                        setApprovalStatus(payload.new.approvalStatus);
                        setHasSubmittedProfile(true);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ProfileforApproval',
                    filter: `id=eq.${user.id}`
                },
                (payload) => {
                    console.log('Profile submitted:', payload.new);
                    setHasSubmittedProfile(true);
                    setApprovalStatus(payload.new.approvalStatus || 'Pending');
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, user?.role]);

    // fetch unread chat count for navbar badge - increased interval to reduce polling
    useEffect(() => {
            if (!user?.id) {
                setUnreadChats(0);
                return;
            }

        let intervalId;
        const fetchUnread = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${user.id}`);
                const data = await res.json();
                const count = (data || []).filter((c) => c.hasUnread).length;
                setUnreadChats(count);
            } catch (e) {
                // silent fail; keep previous value
            }
        };
        
        // Initial fetch
        fetchUnread();
        // Poll every 30s instead of 10s to reduce server load
        intervalId = setInterval(fetchUnread, 30000);
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [user?.id]);

    // Listen for chats being marked read from the chat view to keep badge in sync instantly
    useEffect(() => {
        const onChatRead = (e) => {
            // decrement by 1 but not below zero
            setUnreadChats(prev => Math.max(0, prev - 1));
        };
        window.addEventListener('chatRead', onChatRead);
        return () => window.removeEventListener('chatRead', onChatRead);
    }, []);

    // Fetch real notifications and subscribe to new ones
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user?.id) {
                setUnreadNotifications(0);
                return;
            }

            try {
                const notifications = await notificationService.getUnreadNotifications(user.id);
                setUnreadNotifications(notifications.length);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();

        // Subscribe to real-time notifications
        const subscription = notificationService.subscribeToNotifications(
            user?.id,
            handleNotificationReceived
        );

        return () => {
            if (subscription) {
                notificationService.unsubscribe();
            }
        };
    }, [user?.id]);

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut();
        setShowLogoutPopup(false);
        navigate('/Firstscreen');
        window.location.reload();
    }, [navigate]);

    // Close logout popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileColumnRef.current && !profileColumnRef.current.contains(event.target)) {
                setShowLogoutPopup(false);
            }
        };

        if (showLogoutPopup) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showLogoutPopup]);

    return (
        <>
            <header className={styles.header}>
                <Link to="/" className={styles.logoLink}>
                    <div className={styles.logoContainer}>
                        <div className={styles.logoIcon}>🩺</div>
                        <div className={styles.logo}>AI Dermatologist</div>
                    </div>
                </Link>


                <nav className={styles.navLinks}>
                    <a
                        href="#features"
                        className={styles.scrollLink}
                        onClick={(e) => {
                            e.preventDefault();
                            if (isHomePage) {
                                // If already on home page, scroll to section
                            const element = document.getElementById('features');
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            } else {
                                // If on another page, navigate to home page with hash in state
                                navigate('/', { state: { scrollTo: 'features' }, replace: false });
                            }
                        }}
                    >
                        Features
                    </a>
                    <a
                        href="#how-it-works"
                        className={styles.scrollLink}
                        onClick={(e) => {
                            e.preventDefault();
                            if (isHomePage) {
                                // If already on home page, scroll to section
                            const element = document.getElementById('how-it-works');
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            } else {
                                // If on another page, navigate to home page with hash in state
                                navigate('/', { state: { scrollTo: 'how-it-works' }, replace: false });
                            }
                        }}
                    >
                        How It Works
                    </a>

                    <NavLink
                        to="/"
                        onClick={handleProtectedClick}
                        className={({ isActive }) => (isActive ? styles.activeLink : undefined)}
                        end
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/Upload"
                        onClick={handleProtectedClick}
                        className={({ isActive }) => (isActive ? styles.activeLink : undefined)}
                    >
                        Scan Disease
                    </NavLink>
                    <NavLink
                        to="/Listing"
                        onClick={handleProtectedClick}
                        className={({ isActive }) => (isActive ? styles.activeLink : undefined)}
                    >
                        Find Doctors
                    </NavLink>
                    <NavLink
                        to="/Chat"
                        onClick={handleProtectedClick}
                        className={({ isActive }) => (isActive ? styles.activeLink : undefined)}
                    >
                        <span style={{ position: 'relative' }}>
                            Chats
                            {unreadChats > 0 && (
                                <span className={styles.badge}>{unreadChats}</span>
                            )}
                        </span>
                    </NavLink>

                    <NavLink
                        to={isLoggedIn ? `/UserBookings/${user.id}` : '#'}
                        onClick={handleProtectedClick}
                        className={({ isActive }) => (isActive && isLoggedIn ? styles.activeLink : undefined)}
                    >
                        Appointments
                    </NavLink>



                </nav>

                <div className={styles.authSection}>
                    {!isLoggedIn && (
                        <button
                            className={styles.getStartedNavButton}
                            onClick={() => navigate('/Firstscreen')}
                        >
                            Get Started
                        </button>
                    )}
                    {isLoggedIn ? (
                        <div className={styles.userInfo}>
                            {/* Notification Icon */}
                            <div
                                className={styles.notificationIcon}
                                onClick={handleNotificationClick}
                                style={{ cursor: 'pointer', position: 'relative' }}
                            >
                                <svg 
                                    width="22" 
                                    height="22" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={styles.notificationBell}
                                >
                                    <path 
                                        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                    <path 
                                        d="M13.73 21a2 2 0 0 1-3.46 0" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                {unreadNotifications > 0 && (
                                    <span className={styles.notificationBadge}>{unreadNotifications}</span>
                                )}
                            </div>

                            <div className={styles.profileColumn} ref={profileColumnRef} style={{ position: 'relative' }}>
                                <div
                                    className={styles.profilePic}
                                    onClick={() => setShowLogoutPopup(prev => !prev)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className={styles.username}>{user.name}</span>

                                {/* Conditional Popup with Clickable Text */}
                                {showPopup && user?.role === 'doctor' && (
                                    <div className={styles.popupMenu}>
                                        {approvalStatus === null && (
                                            <span
                                                onClick={handleCreateProfile}
                                                className={styles.popupText}
                                            >
                                                Create Profile
                                            </span>
                                        )}
                                        {approvalStatus === 'Pending' && (
                                            <span className={styles.popupText}>
                                                Pending
                                            </span>
                                        )}
                                        {approvalStatus === 'Rejected' && (
                                            <span
                                                onClick={handleCreateProfile}
                                                className={styles.popupText}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                Fix & Resubmit Form
                                            </span>
                                        )}
                                        {approvalStatus === 'Approved' && (
                                            <span
                                                onClick={profileSettings}
                                                className={styles.popupText}
                                            >
                                                Profile Settings
                                            </span>
                                        )}
                                    </div>


                                )}
                                {showLogoutPopup && (
                                    <div className={`${styles.popupMenu} ${styles.logoutPopup}`}>
                                        {user?.role === 'admin' && (
                                            <span 
                                                className={styles.popupText} 
                                                onClick={handleDashboard}
                                                style={{ cursor: 'pointer', marginBottom: '8px', display: 'block', paddingBottom: '8px', borderBottom: '1px solid #e0e0e0' }}
                                            >
                                                Dashboard
                                            </span>
                                        )}
                                        {user?.role === 'doctor' && (
                                            <span 
                                                className={styles.popupText} 
                                                onClick={handleProfileForApproval}
                                                style={{ cursor: 'pointer', marginBottom: '8px', display: 'block', paddingBottom: '8px', borderBottom: '1px solid #e0e0e0' }}
                                            >
                                                {hasSubmittedProfile ? 'Profile Status' : 'Profile for Approval'}
                                            </span>
                                        )}
                                        {user?.role === 'doctor' && approvalStatus === 'Approved' && (
                                            <span 
                                                className={styles.popupText} 
                                                onClick={handleProfileSettings}
                                                style={{ cursor: 'pointer', marginBottom: '8px', display: 'block', paddingBottom: '8px', borderBottom: '1px solid #e0e0e0' }}
                                            >
                                                Profile Settings
                                            </span>
                                        )}
                                        <span className={styles.popupText} onClick={handleLogout}>
                                            Logout
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </header>

            {!isLoggedIn && showModal && (
                <Modal
                    title="Access Restricted"
                    message="Please sign up first to access this section."
                    onClose={handleCloseModal}
                />
            )}

            {showStatusModal && (
                <Modal
                    title="Profile Status"
                    message={
                        (() => {
                            const status = approvalStatus?.toLowerCase();
                            if (status === 'pending') {
                                return 'Status is pending';
                            } else if (status === 'approved') {
                                return 'Request has been approved by admin';
                            } else if (status === 'rejected') {
                                return 'Your profile request has been rejected. Please resubmit your profile.';
                            } else if (status === 'de-activated') {
                                return 'Your profile is de activated';
                            } else {
                                return 'Unknown status';
                            }
                        })()
                    }
                    onClose={() => setShowStatusModal(false)}
                />
            )}

            {/* Notification Popup */}
            {currentNotification && (
                <NotificationPopup
                    notification={currentNotification}
                    onClose={handleNotificationClose}
                    onMarkAsRead={handleMarkAsRead}
                />
            )}
        </>
    );
}
