import React, { useEffect, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}) => {
  
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);
  
  if (!isOpen) return null;
  
  const sizeStyles = {
    sm: { maxWidth: '28rem' },
    md: { maxWidth: '32rem' },
    lg: { maxWidth: '42rem' },
    xl: { maxWidth: '56rem' }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={sizeStyles[size]}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}
            >
              ×
            </button>
          )}
        </div>
        
        <div className="modal-body">
          {children}
        </div>
        
        {onConfirm && (
          <div className="modal-footer">
            <button onClick={onClose} className="btn-secondary">
              {cancelText}
            </button>
            <button onClick={onConfirm} className="btn-primary">
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;