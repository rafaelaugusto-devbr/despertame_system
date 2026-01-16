// src/components/UserManager.jsx

import React, { useState, useEffect } from 'react';
import { createUser, listUsers, toggleUser, deleteUser } from '../../../services/userApi';
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

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
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
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <IconPlus /> Novo Admin
          </button>
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
    </div>
  );
};

export default UserManager;
