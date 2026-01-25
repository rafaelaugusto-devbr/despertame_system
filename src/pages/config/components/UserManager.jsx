// src/components/UserManager.jsx

import React, { useState, useEffect } from 'react';
import { createUser, listUsers, toggleUser, deleteUser, inviteUser, resetUserPassword, updateUserPassword } from '../../../services/userApi';
import { useModal } from '../../../contexts/ModalContext';

// Ícones (mantive os seus)
const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconTrash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconKey = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const IconEdit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });

  const [inviteEmail, setInviteEmail] = useState('');
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
        message: 'Falha ao carregar usuários.',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({ email: '', password: '', displayName: '' });
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

    try {
      setSaving(true);

      await createUser({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
      });

      setShowCreateModal(false);
      resetForm();

      showModal({
        title: 'Sucesso',
        message: 'Administrador criado com sucesso.',
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
    const willBlock = !user.disabled;

    showModal({
      title: 'Alterar Status',
      message: `Deseja ${willBlock ? 'bloquear' : 'ativar'} o usuário "${user.displayName || user.email}"?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await toggleUser(user.uid);
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

  const handleDeleteUser = (user) => {
    showModal({
      title: 'Excluir Usuário',
      message: `Tem certeza que deseja excluir "${user.displayName || user.email}"? Essa ação não pode ser desfeita.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteUser(user.uid);
          await loadUsers();
        } catch (e) {
          showModal({
            title: 'Erro',
            message: e?.message || 'Falha ao excluir o usuário.',
            type: 'danger',
          });
        }
      },
    });
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();

    if (!inviteEmail) {
      showModal({
        title: 'Atenção',
        message: 'E-mail é obrigatório.',
        type: 'danger',
      });
      return;
    }

    try {
      setSaving(true);
      await inviteUser(inviteEmail);

      setShowInviteModal(false);
      setInviteEmail('');

      showModal({
        title: 'Sucesso',
        message: `Convite enviado para ${inviteEmail}`,
        type: 'info',
      });
    } catch (e) {
      showModal({
        title: 'Erro ao enviar convite',
        message: e?.message || 'Não foi possível enviar o convite.',
        type: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = (user) => {
    showModal({
      title: 'Redefinir Senha',
      message: `Deseja enviar um e-mail de redefinição de senha para "${user.displayName || user.email}"?`,
      type: 'info',
      onConfirm: async () => {
        try {
          await resetUserPassword(user.uid);
          showModal({
            title: 'Sucesso',
            message: 'E-mail de redefinição de senha enviado com sucesso.',
            type: 'info',
          });
        } catch (e) {
          showModal({
            title: 'Erro',
            message: e?.message || 'Falha ao enviar e-mail de redefinição.',
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
      await updateUserPassword(passwordData.uid, passwordData.newPassword);

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
          <h3>Administradores</h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => setShowInviteModal(true)}>
              <IconMail /> Enviar Convite
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <IconPlus /> Novo Admin
            </button>
          </div>
        </div>

        <div className="user-table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty-state">
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
                    <span className={`badge ${user.disabled ? 'badge-danger' : 'badge-success'}`}>
                      {user.disabled ? 'Bloqueado' : 'Ativo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-btn"
                        title="Alterar Senha"
                        onClick={() => handleOpenPasswordModal(user)}
                      >
                        <IconEdit />
                      </button>

                      <button
                        className="icon-btn"
                        title="Enviar Email de Reset"
                        onClick={() => handleResetPassword(user)}
                      >
                        <IconKey />
                      </button>

                      <button
                        className="icon-btn"
                        title="Ativar/Bloquear"
                        onClick={() => handleToggleUser(user)}
                      >
                        {user.disabled ? <IconUnlock /> : <IconLock />}
                      </button>

                      <button
                        className="icon-btn delete"
                        title="Excluir"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <IconTrash />
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
              <h3>Novo Administrador</h3>
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

              <label>E-mail</label>
              <input
                className="input-field"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@dominio.com"
              />

              <label>Senha</label>
              <input
                className="input-field"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />

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
                  {saving ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ENVIAR CONVITE */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Enviar Convite</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleInviteUser}>
              <label>E-mail do Usuário</label>
              <input
                className="input-field"
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@dominio.com"
              />

              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                Um e-mail de convite será enviado para este endereço com instruções para criar uma conta.
              </p>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                  }}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Enviando...' : 'Enviar Convite'}
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
