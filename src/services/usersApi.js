// src/services/usersApi.js
// Serviço de integração com API de usuários

const API_BASE_URL = 'https://api.despertame.com';

/**
 * Obtém o token de autenticação do usuário logado
 */
const getAuthToken = async () => {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  return await user.getIdToken();
};

/**
 * Função auxiliar para fazer requisições autenticadas
 */
const fetchWithAuth = async (url, options = {}) => {
  const token = await getAuthToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisição');
  }

  return data;
};

/**
 * Muda a própria senha do usuário logado
 */
export const changeMyPassword = async ({ currentPassword, newPassword }) => {
  return await fetchWithAuth(`${API_BASE_URL}/api/me/password`, {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};

/**
 * Lista todos os usuários (Admin)
 */
export const listUsers = async () => {
  return await fetchWithAuth(`${API_BASE_URL}/api/users`);
};

/**
 * Cria novo usuário (Admin)
 */
export const createUser = async ({ email, password, displayName, isAdmin = false }) => {
  return await fetchWithAuth(`${API_BASE_URL}/api/users/create`, {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName, isAdmin }),
  });
};

/**
 * Muda senha de outro usuário (Admin)
 */
export const changeUserPassword = async (uid, newPassword) => {
  return await fetchWithAuth(`${API_BASE_URL}/api/users/${uid}/password`, {
    method: 'PUT',
    body: JSON.stringify({ newPassword }),
  });
};

/**
 * Habilita ou desabilita usuário (Admin)
 */
export const toggleUserStatus = async (uid, disabled) => {
  return await fetchWithAuth(`${API_BASE_URL}/api/users/${uid}/toggle`, {
    method: 'POST',
    body: JSON.stringify({ disabled }),
  });
};

/**
 * Exclui usuário (Admin)
 */
export const deleteUser = async (uid) => {
  return await fetchWithAuth(`${API_BASE_URL}/api/users/${uid}`, {
    method: 'DELETE',
  });
};
