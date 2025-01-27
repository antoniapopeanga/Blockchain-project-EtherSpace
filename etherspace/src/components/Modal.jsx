import React from 'react';
import styles from './css/Modal.module.css';

function Modal({ message, onConfirm, onCancel }) {
    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContainer}>
                <h2 className={styles.modalTitle}>{message}</h2>
                <div className={styles.modalActions}>
                    <button onClick={onConfirm} className={styles.confirmButton}>OK</button>
                    <button onClick={onCancel} className={styles.cancelButton}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default Modal;
