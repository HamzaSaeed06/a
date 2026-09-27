import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Modal = () => {
  const { activeModal, closeModal } = useApp();

  if (!activeModal) return null;

  const {
    title,
    body,
    confirmText = 'OK',
    confirmDanger = false,
    onConfirm,
    secondaryText,
    onSecondary
  } = activeModal;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  const handleSecondary = () => {
    if (onSecondary) onSecondary();
    closeModal();
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button 
            className="modal-close-btn" 
            onClick={closeModal}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {body}
        </div>

        <div className="modal-footer">
          {secondaryText && (
            <button 
              className="page-action-btn"
              style={{ background: '#F1F5F9', color: '#0F172A' }}
              onClick={handleSecondary}
            >
              {secondaryText}
            </button>
          )}
          <button 
            className={`page-action-btn ${confirmDanger ? 'danger' : ''}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
