import React, { useState } from 'react';
import styles from './Notifications.module.css';
import Navbar from '../Homepage/Navbar';
import Footer from '../Homepage/Footer';
import notificationService from '../../services/notificationService';
import { useData } from '../../contexts/DataContext';

function Notifications({ user }) {
  const { notifications, notificationsLoading, markNotificationRead, refreshNotifications } = useData();
  const [localNotifications, setLocalNotifications] = useState([]);

  // Refresh notifications when component mounts to ensure we have latest data
  React.useEffect(() => {
    if (user?.id) {
      refreshNotifications();
    }
  }, [user?.id, refreshNotifications]);

  // Sync local state with context
  React.useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      markNotificationRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user.id);
      // Refresh notifications from context
      refreshNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  if (notificationsLoading && localNotifications.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <Navbar user={user} />
        <div className={styles.container}>
          <div className={styles.heroSection}>
            <h1 className={styles.mainTitle}>
              Your <span className={styles.gradientText}>Notifications</span>
            </h1>
          </div>
          <div className={styles.loaderBox}>
            <div className={styles.loader}></div>
            <p>Loading notifications...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
    
  }

  return (
    <div className={styles.pageContainer}>
      <Navbar user={user} />
      <div className={styles.container}>
        <div className={styles.heroSection}>
          <h1 className={styles.mainTitle}>
            Your <span className={styles.gradientText}>Notifications</span>
          </h1>
          <p className={styles.description}>
            Stay updated with your latest messages, appointments, and important updates.
          </p>
          {localNotifications.length > 0 && (
            <div className={styles.headerActions}>
              <button 
                className={styles.markAllButton}
                onClick={handleMarkAllAsRead}
              >
                Mark All as Read
              </button>
            </div>
          )}
        </div>

        {localNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No notifications</h3>
            <p className={styles.emptyMessage}>You're all caught up! New notifications will appear here.</p>
          </div>
        ) : (
          <div className={styles.notificationsList}>
            {localNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`${styles.notificationItem} ${
                  notification.status === 'unread' ? styles.unread : styles.read
                }`}
              >
                <div className={styles.notificationContent}>
                  <div className={styles.notificationHeader}>
                    <h4 className={styles.notificationTitle}>
                      {notification.title}
                    </h4>
                    {notification.status === 'unread' && (
                      <span className={styles.unreadIndicator}></span>
                    )}
                  </div>
                  <p className={styles.notificationMessage}>
                    {notification.message}
                  </p>
                  <div className={styles.notificationMeta}>
                    <span className={styles.notificationTime}>
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {notification.type === 'profile_rejection' && (
                        <button 
                          className={styles.fixResubmitButton}
                          onClick={() => {
                            window.location.href = '/ProfileDraft';
                          }}
                        >
                          Fix & Resubmit Form
                        </button>
                      )}
                      {notification.status === 'unread' && (
                        <button 
                          className={styles.markReadButton}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Notifications;
