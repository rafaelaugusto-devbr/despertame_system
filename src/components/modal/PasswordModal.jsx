import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const PasswordModal = ({ onSubmit, error }) => {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Área Protegida</h3>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(password);
        }}>
          <label>Senha</label>

          <div className="input-wrapper">
            <input
              className="input-field"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShow(!show)}
            >
              {show ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {error && <p id="erro">{error}</p>}

          <div className="modal-footer">
            <button className="btn btn-primary" type="submit">
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
