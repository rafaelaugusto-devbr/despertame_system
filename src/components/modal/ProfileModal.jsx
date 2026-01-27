import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { changeMyPassword } from '../../services/usersApi';
import { useModal } from '../../contexts/ModalContext';
import { FiX, FiUser, FiMail, FiLock } from 'react-icons/fi';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showModal({
        title: 'Erro',
        message: 'Por favor, preencha todos os campos.',
        type: 'warning',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showModal({
        title: 'Erro',
        message: 'A nova senha e a confirmação não coincidem.',
        type: 'warning',
      });
      return;
    }

    if (newPassword.length < 6) {
      showModal({
        title: 'Erro',
        message: 'A nova senha deve ter pelo menos 6 caracteres.',
        type: 'warning',
      });
      return;
    }

    setLoading(true);

    try {
      await changeMyPassword({
        email: user.email,
        currentPassword,
        newPassword,
      });

      showModal({
        title: 'Sucesso',
        message: 'Senha alterada com sucesso!',
        type: 'success',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      showModal({
        title: 'Erro',
        message: error.message || 'Erro ao alterar senha. Verifique se a senha atual está correta.',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose}>
          <FiX size={24} />
        </button>

        <div className="profile-modal-header">
          <h2>Meu Perfil</h2>
        </div>

        <div className="profile-modal-body">
          {/* Informações do usuário */}
          <div className="profile-info-section">
            <h3>Informações Pessoais</h3>
            <div className="profile-info-item">
              <FiUser className="profile-info-icon" />
              <div>
                <label>Nome</label>
                <span>{user?.displayName || 'Não informado'}</span>
              </div>
            </div>
            <div className="profile-info-item">
              <FiMail className="profile-info-icon" />
              <div>
                <label>Email</label>
                <span>{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Formulário de alteração de senha */}
          <div className="profile-password-section">
            <h3>
              <FiLock className="section-icon" />
              Alterar Senha
            </h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Senha Atual</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Nova Senha</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Digite a nova senha (mínimo 6 caracteres)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Digite novamente a nova senha"
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
