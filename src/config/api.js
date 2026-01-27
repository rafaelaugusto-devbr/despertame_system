// src/config/api.js
// Configuração centralizada da API

/**
 * Obtém a URL base da API baseada no ambiente
 */
export const getApiBaseUrl = () => {
  // Em desenvolvimento, usa localhost
  if (import.meta.env.DEV || window.location.hostname === 'localhost') {
    console.log('[API Config] Ambiente: DESENVOLVIMENTO');
    return 'http://localhost:8787'; // Porta padrão do Wrangler dev
  }

  // Em produção, usa a URL da API
  console.log('[API Config] Ambiente: PRODUÇÃO');
  return 'https://api.despertame.com';
};

export const API_BASE_URL = getApiBaseUrl();

console.log('[API Config] API Base URL:', API_BASE_URL);

/**
 * API Key fixa para autenticação
 */
export const API_KEY = 'c6ecf126fe7240e3a066d6b65bfa61fe45ous';

console.log('[API Config] API Key configurada:', API_KEY ? 'SIM' : 'NÃO');
