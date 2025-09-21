import React from 'react';
import './CustomConfirmModal.css';

const CustomConfirmModal = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal">
        <h3 className="custom-modal-title">{title}</h3>
        <div className="custom-modal-message">{message}</div>
        <div className="custom-modal-actions">
          <button className="custom-modal-btn confirm" onClick={onConfirm}>Yes, Delete</button>
          <button className="custom-modal-btn cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CustomConfirmModal;
