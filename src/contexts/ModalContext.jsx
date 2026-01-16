import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
  });

  const showModal = ({ title, message, type = 'info', onConfirm }) => {
    setModal({ open: true, title, message, type, onConfirm });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, open: false }));
  };

  return (
    <ModalContext.Provider value={{ showModal, closeModal }}>
      {children}

      {modal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modal.title}</h3>
              <button className="modal-close-btn" onClick={closeModal}>×</button>
            </div>

            <p style={{ color: 'var(--color-text-secondary)' }}>
              {modal.message}
            </p>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancelar
              </button>

              {modal.onConfirm && (
                <button
                  className={`btn ${
                    modal.type === 'danger' ? 'btn-danger' : 'btn-primary'
                  }`}
                  onClick={() => {
                    modal.onConfirm();
                    closeModal();
                  }}
                >
                  Confirmar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
