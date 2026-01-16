import React, { useState } from 'react';
import Button from '../ui/Button';

const PasswordPromptModal = ({ isOpen, onClose, onConfirm }) => {
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(password);
        setPassword(''); // Limpa a senha após a tentativa
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h3>Confirmação de Segurança</h3>
                </div>
                <div className="modal-body">
                    <p>Para realizar esta ação, por favor, insira a senha mestra do fluxo de caixa.</p>
                    <input
                        type="password"
                        className="input-field"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="modal-footer">
                    <Button onClick={handleConfirm} className="btn-primary">Confirmar</Button>
                    <Button onClick={onClose} className="btn-secondary">Cancelar</Button>
                </div>
            </div>
        </div>
    );
};

export default PasswordPromptModal;
