// src/services/usersApi.js
// Serviço de integração com API de usuários

import { API_BASE_URL, API_KEY } from '../config/api';

/**
 * Função auxiliar para fazer requisições com API Key
 */
const fetchWithApiKey = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'X-API-Key': API_KEY,
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
export const changeMyPassword = async ({ email, currentPassword, newPassword }) => {
  return await fetchWithApiKey(`${API_BASE_URL}/api/me/password`, {
    method: 'PUT',
    body: JSON.stringify({ email, currentPassword, newPassword }),
  });
};

/**
 * Lista todos os usuários (Admin)
 */
export const listUsers = async () => {
  return await fetchWithApiKey(`${API_BASE_URL}/api/users`);
};

/**
 * Cria novo usuário (Admin)
 */
export const createUser = async ({ email, password, displayName, isAdmin = false }) => {
  return await fetchWithApiKey(`${API_BASE_URL}/api/users/create`, {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName, isAdmin }),
  });
};

/**
 * Muda senha de outro usuário (Admin)
 */
export const changeUserPassword = async (uid, newPassword) => {
  return await fetchWithApiKey(`${API_BASE_URL}/api/users/${uid}/password`, {
    method: 'PUT',
    body: JSON.stringify({ newPassword }),
  });
};

/**
 * Habilita ou desabilita usuário (Admin)
 */
export const toggleUserStatus = async (uid, disabled) => {
  return await fetchWithApiKey(`${API_BASE_URL}/api/users/${uid}/toggle`, {
    method: 'POST',
    body: JSON.stringify({ disabled }),
  });
};

/**
 * Exclui usuário (Admin)
 */
export const deleteUser = async (uid) => {
  return await fetchWithApiKey(`${API_BASE_URL}/api/users/${uid}`, {
    method: 'DELETE',
  });
};
