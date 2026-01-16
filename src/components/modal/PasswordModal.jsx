import React, { useState, useEffect, useRef } from 'react';
import { FiEye, FiEyeOff, FiLock, FiShield } from 'react-icons/fi';
import './PasswordModal.css';

const PasswordModal = ({ onSubmit, error, pageName = 'Área Protegida' }) => {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Shake animation on error
  useEffect(() => {
    if (error) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
    }
  };

  return (
    <div className="password-modal-overlay">
      <div className={`password-modal ${isShaking ? 'password-modal--shake' : ''}`}>
        <div className="password-modal__icon">
          <div className="password-modal__icon-circle">
            <FiShield size={32} />
          </div>
        </div>

        <div className="password-modal__header">
          <h2 className="password-modal__title">{pageName}</h2>
          <p className="password-modal__subtitle">
            Esta área requer autenticação adicional
          </p>
        </div>

        <form onSubmit={handleSubmit} className="password-modal__form">
          <div className="password-modal__input-group">
            <label htmlFor="password-input" className="password-modal__label">
              <FiLock size={16} />
              Senha de Acesso
            </label>

            <div className="password-modal__input-wrapper">
              <input
                id="password-input"
                ref={inputRef}
                className={`password-modal__input ${error ? 'password-modal__input--error' : ''}`}
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                required
                autoComplete="off"
              />
              <button
                type="button"
                className="password-modal__toggle"
                onClick={() => setShow(!show)}
                aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            {error && (
              <div className="password-modal__error">
                <span className="password-modal__error-icon">⚠</span>
                {error}
              </div>
            )}
          </div>

          <button type="submit" className="password-modal__submit">
            Acessar Painel
          </button>
        </form>

        <div className="password-modal__footer">
          <p className="password-modal__help">
            Não possui acesso? Entre em contato com o administrador.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
