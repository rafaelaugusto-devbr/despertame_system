import React from 'react';
import { useModal } from '../../contexts/ModalContext';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

const GlobalModal = () => {
  const { modal, closeModal } = useModal();

  if (!modal.open) return null;

  const getIcon = () => {
    switch (modal.type) {
      case 'success': return <FiCheckCircle size={40} color="#4CAF50" />;
      case 'error': return <FiAlertCircle size={40} color="#f44336" />;
      default: return <FiInfo size={40} color="#2196f3" />;
    }
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeModal}><FiX /></button>
        <div className="modal-icon-area">{getIcon()}</div>
        <h3 className="modal-title">{modal.title}</h3>
        <p className="modal-message">{modal.message}</p>
        
        <div className="modal-actions">
          {modal.onConfirm ? (
            <>
              <button className="btn-secondary" onClick={closeModal}>Cancelar</button>
              <button className="btn-primary" onClick={() => { modal.onConfirm(); closeModal(); }}>Confirmar</button>
            </>
          ) : (
            <button className="btn-primary" onClick={closeModal}>OK</button>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(3px); animation: fadeIn 0.2s; }
        .modal-container { background: #1e1e1e; border: 1px solid #333; width: 90%; max-width: 400px; padding: 30px; border-radius: 16px; text-align: center; position: relative; box-shadow: 0 20px 50px rgba(0,0,0,0.5); animation: scaleIn 0.2s; }
        .modal-close-btn { position: absolute; top: 15px; right: 15px; background: none; border: none; color: #666; cursor: pointer; font-size: 1.2rem; }
        .modal-icon-area { margin-bottom: 15px; }
        .modal-title { color: #fff; margin: 0 0 10px 0; font-size: 1.5rem; }
        .modal-message { color: #ccc; margin-bottom: 25px; line-height: 1.5; }
        .modal-actions { display: flex; justify-content: center; gap: 15px; }
        .btn-primary { background: #ff5722; color: white; padding: 10px 25px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold; transition: 0.2s; }
        .btn-primary:hover { background: #f4511e; transform: translateY(-2px); }
        .btn-secondary { background: transparent; color: #aaa; padding: 10px 25px; border-radius: 8px; border: 1px solid #444; cursor: pointer; transition: 0.2s; }
        .btn-secondary:hover { border-color: #666; color: #fff; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default GlobalModal;