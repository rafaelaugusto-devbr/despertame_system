import { getAuth } from 'firebase/auth';

// Certifique-se que esta URL está correta (sem barra no final geralmente é melhor, mas tratei nos endpoints)
const API_URL = 'https://api.despertame.org'; 

async function getAuthToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');
  return await user.getIdToken();
}

async function apiRequest(endpoint, options = {}) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro na requisição');
    return data;
  } catch (error) {
    console.error(`Erro na API (${endpoint}):`, error);
    throw error;
  }
}

// --- FUNÇÕES EXPORTADAS ---

// 1. SINCRONIZAR USUÁRIO (NOVO)
export async function syncUser() {
  return await apiRequest('/api/users/sync', { method: 'POST' });
}

// Listar
export async function listUsers() {
  return await apiRequest('/api/users');
}

// Criar
export async function createUser(userData) {
  return await apiRequest('/api/users/create', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
}

// Bloquear/Ativar
export async function toggleUser({ uid, disabled }) {
  return await apiRequest(`/api/users/${uid}/toggle`, {
    method: 'PATCH',
    body: JSON.stringify({ disabled })
  });
}

// Deletar
export async function deleteUser({ uid }) {
  return await apiRequest(`/api/users/${uid}`, { method: 'DELETE' });
}