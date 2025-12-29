import React from 'react';
import  styles from './Modal.module.css';

const Modal = ({ title, message, onClose }) => {
    return (
        <div className={styles.modaloverlay}>
            <div className={styles.modalcontent}>
                <h2>{title}</h2>
                <p>{message}</p>
                <button className={styles.modalclose} onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default Modal;
