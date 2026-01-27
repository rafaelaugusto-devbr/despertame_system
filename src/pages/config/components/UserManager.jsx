// src/components/UserManager.jsx

import React, { useState, useEffect } from 'react';
import { createUser, listUsers, changeUserPassword, toggleUserStatus } from '../../../services/usersApi';
import { useModal } from '../../../contexts/ModalContext';

// Ícones
const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconUnlock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

const IconKey = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    isAdmin: false,
  });

  const [passwordData, setPasswordData] = useState({
    uid: '',
    userEmail: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { showModal } = useModal();

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const result = await listUsers();
      setUsers(Array.isArray(result?.users) ? result.users : []);
    } catch (e) {
      showModal({
        title: 'Erro',
        message: e.message || 'Falha ao carregar usuários.',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({ email: '', password: '', displayName: '', isAdmin: false });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      showModal({
        title: 'Atenção',
        message: 'E-mail e senha são obrigatórios.',
        type: 'danger',
      });
      return;
    }

    if (formData.password.length < 6) {
      showModal({
        title: 'Atenção',
        message: 'A senha deve ter no mínimo 6 caracteres.',
        type: 'danger',
      });
      return;
    }

    try {
      setSaving(true);

      await createUser({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        isAdmin: formData.isAdmin,
      });

      setShowCreateModal(false);
      resetForm();

      showModal({
        title: 'Sucesso',
        message: 'Usuário criado com sucesso.',
        type: 'info',
      });

      await loadUsers();
    } catch (e) {
      showModal({
        title: 'Erro ao criar',
        message: e?.message || 'Não foi possível criar o usuário.',
        type: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUser = (user) => {
    const willDisable = !user.disabled;

    showModal({
      title: 'Alterar Status',
      message: `Deseja ${willDisable ? 'desativar' : 'ativar'} o usuário "${user.displayName || user.email}"?`,
      type: willDisable ? 'danger' : 'info',
      onConfirm: async () => {
        try {
          await toggleUserStatus(user.uid, willDisable);
          showModal({
            title: 'Sucesso',
            message: `Usuário ${willDisable ? 'desativado' : 'ativado'} com sucesso.`,
            type: 'info',
          });
          await loadUsers();
        } catch (e) {
          showModal({
            title: 'Erro',
            message: e?.message || 'Falha ao alterar status do usuário.',
            type: 'danger',
          });
        }
      },
    });
  };


  const handleOpenPasswordModal = (user) => {
    setPasswordData({
      uid: user.uid,
      userEmail: user.email,
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordModal(true);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      showModal({
        title: 'Atenção',
        message: 'Por favor, preencha todos os campos.',
        type: 'danger',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showModal({
        title: 'Atenção',
        message: 'A senha deve ter no mínimo 6 caracteres.',
        type: 'danger',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showModal({
        title: 'Atenção',
        message: 'As senhas não coincidem.',
        type: 'danger',
      });
      return;
    }

    try {
      setSaving(true);
      await changeUserPassword(passwordData.uid, passwordData.newPassword);

      setShowPasswordModal(false);
      setPasswordData({
        uid: '',
        userEmail: '',
        newPassword: '',
        confirmPassword: ''
      });

      showModal({
        title: 'Sucesso',
        message: 'Senha atualizada com sucesso.',
        type: 'info',
      });
    } catch (e) {
      showModal({
        title: 'Erro ao atualizar senha',
        message: e?.message || 'Não foi possível atualizar a senha.',
        type: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-content">
      {/* HEADER PADRÃO */}
      <div className="header">
        <h1>Gerenciamento de Usuários</h1>
        <p>Controle de administradores e permissões do sistema</p>
      </div>

      {/* CARD */}
      <div className="list-card">
        <div className="list-card-header">
          <h3>Usuários do Sistema</h3>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <IconPlus /> Novo Usuário
          </button>
        </div>

        <div className="user-table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Tipo</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-state">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}

              {users.map((user) => (
                <tr key={user.uid}>
                  <td>
                    <strong>{user.displayName || 'Sem nome'}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.isAdmin ? 'badge-primary' : 'badge-secondary'}`}>
                      {user.isAdmin ? 'Admin' : 'Usuário'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.disabled ? 'badge-danger' : 'badge-success'}`}>
                      {user.disabled ? 'Inativo' : 'Ativo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-btn"
                        title="Alterar Senha"
                        onClick={() => handleOpenPasswordModal(user)}
                      >
                        <IconKey />
                      </button>

                      <button
                        className="icon-btn"
                        title={user.disabled ? 'Ativar' : 'Desativar'}
                        onClick={() => handleToggleUser(user)}
                      >
                        {user.disabled ? <IconUnlock /> : <IconLock />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && <p style={{ padding: '1rem' }}>Carregando usuários...</p>}
        </div>
      </div>

      {/* MODAL CRIAR USUÁRIO */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Novo Usuário</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <label>Nome</label>
              <input
                className="input-field"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Ex: João Silva"
              />

              <label>E-mail *</label>
              <input
                className="input-field"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@dominio.com"
              />

              <label>Senha * (mínimo 6 caracteres)</label>
              <input
                className="input-field"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />

              <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isAdmin}
                    onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <span>Administrador (acesso total ao sistema)</span>
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Criando...' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ALTERAR SENHA */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Alterar Senha</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    uid: '',
                    userEmail: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdatePassword}>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                Alterando senha para: <strong>{passwordData.userEmail}</strong>
              </p>

              <label>Nova Senha *</label>
              <input
                className="input-field"
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />

              <label>Confirmar Nova Senha *</label>
              <input
                className="input-field"
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Digite a senha novamente"
                minLength={6}
              />

              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                A senha será atualizada imediatamente sem necessidade de confirmação por email.
              </p>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      uid: '',
                      userEmail: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Atualizando...' : 'Atualizar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
