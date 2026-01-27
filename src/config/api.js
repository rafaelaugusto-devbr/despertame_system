// src/config/api.js
// Configuração centralizada da API

/**
 * Obtém a URL base da API
 * Sempre usa a API hospedada em produção
 */
export const getApiBaseUrl = () => {
  const apiUrl = 'https://api.despertame.org';
  console.log('[API Config] URL da API:', apiUrl);
  return apiUrl;
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * API Key fixa para autenticação
 */
export const API_KEY = 'c6ecf126fe7240e3a066d6b65bfa61fe45ous';

console.log('[API Config] Configuração carregada:', {
  apiUrl: API_BASE_URL,
  apiKeyConfigured: !!API_KEY
});
