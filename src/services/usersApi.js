// src/services/usersApi.js
// Serviço de integração com API de usuários

import { API_BASE_URL, API_KEY } from '../config/api';

/**
 * Função auxiliar para fazer requisições com API Key
 */
const fetchWithApiKey = async (url, options = {}) => {
  try {
    console.log(`[UsersAPI] Fazendo requisição para: ${url}`);
    console.log(`[UsersAPI] API Key: ${API_KEY ? '***configurada***' : 'NÃO CONFIGURADA'}`);
    console.log(`[UsersAPI] Método: ${options.method || 'GET'}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log(`[UsersAPI] Status da resposta: ${response.status}`);

    if (!response.ok) {
      let errorMessage = 'Erro na requisição';
      try {
        const data = await response.json();
        console.error(`[UsersAPI] Erro na resposta:`, data);
        errorMessage = data.error || errorMessage;
      } catch (e) {
        console.error(`[UsersAPI] Erro ao parsear resposta de erro:`, e);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`[UsersAPI] Dados recebidos:`, data);

    return data;
  } catch (error) {
    console.error(`[UsersAPI] Erro na requisição:`, error);

    // Verifica se é um erro de rede
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Não foi possível conectar à API. Verifique sua conexão com a internet.');
    }

    throw error;
  }
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
 * Atualiza perfil do usuário logado (photoURL, displayName, etc)
 */
export const updateUserProfile = async ({ email, photoURL, displayName }) => {
  return await fetchWithApiKey(`${API_BASE_URL}/api/me/profile`, {
    method: 'PUT',
    body: JSON.stringify({ email, photoURL, displayName }),
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
