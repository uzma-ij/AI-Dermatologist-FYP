import React, { useState, useEffect } from 'react';
import styles from './NotificationPopup.module.css';

const NotificationPopup = ({ notification, onClose, onMarkAsRead }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const handleClick = () => {
    if (notification.status === 'unread') {
      onMarkAsRead(notification.id);
    }
    handleClose();
  };

  if (!notification || !isVisible) return null;

  return (
    <div className={`${styles.notificationPopup} ${isVisible ? styles.show : ''}`}>
      <div className={styles.notificationContent} onClick={handleClick}>
        <div className={styles.notificationHeader}>
          <h4 className={styles.notificationTitle}>{notification.title}</h4>
          <button 
            className={styles.closeButton}
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            ×
          </button>
        </div>
        <p className={styles.notificationMessage}>{notification.message}</p>
        <div className={styles.notificationTime}>
          {new Date(notification.created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;

