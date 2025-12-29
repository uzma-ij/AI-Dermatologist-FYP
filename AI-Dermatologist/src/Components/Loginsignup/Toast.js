import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'error', onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose();
        }, 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      padding: '16px 20px',
      minWidth: '320px',
      maxWidth: '400px',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transform: isVisible ? 'translateX(0)' : 'translateX(120%)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '1px solid',
    };

    if (type === 'error') {
      return {
        ...baseStyles,
        borderColor: '#fecdca',
        borderLeft: '4px solid #d92d20',
        backgroundColor: '#fef3f2',
      };
    } else if (type === 'success') {
      return {
        ...baseStyles,
        borderColor: '#a7f3d0',
        borderLeft: '4px solid #12b76a',
        backgroundColor: '#ecfdf3',
      };
    } else if (type === 'warning') {
      return {
        ...baseStyles,
        borderColor: '#fde68a',
        borderLeft: '4px solid #f59e0b',
        backgroundColor: '#fffbeb',
      };
    }
    return baseStyles;
  };

  const getIcon = () => {
    if (type === 'error') {
      return (
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#d92d20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>✕</span>
        </div>
      );
    } else if (type === 'success') {
      return (
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#12b76a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
        </div>
      );
    } else if (type === 'warning') {
      return (
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>!</span>
        </div>
      );
    }
    return null;
  };

  const getTextColor = () => {
    if (type === 'error') return '#d92d20';
    if (type === 'success') return '#027a48';
    if (type === 'warning') return '#b45309';
    return '#101828';
  };

  return (
    <div style={getToastStyles()}>
      {getIcon()}
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 600,
            color: getTextColor(),
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
      </div>
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '20px',
          color: '#6b7280',
          cursor: 'pointer',
          padding: '0',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          transition: 'background-color 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f3f4f6';
          e.target.style.color = '#374151';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = '#6b7280';
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;