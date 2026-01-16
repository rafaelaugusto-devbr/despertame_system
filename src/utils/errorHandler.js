/**
 * Error Handler Utility
 *
 * Provides centralized error handling and user-friendly error messages
 */

// Firebase Error Code Mapping
const FIREBASE_ERROR_MESSAGES = {
  'auth/user-not-found': 'Usuário não encontrado. Verifique o e-mail e tente novamente.',
  'auth/wrong-password': 'Senha incorreta. Tente novamente.',
  'auth/email-already-in-use': 'Este e-mail já está em uso.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/user-disabled': 'Esta conta foi desabilitada.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
  'permission-denied': 'Você não tem permissão para realizar esta ação.',
  'not-found': 'Documento não encontrado.',
  'already-exists': 'Este registro já existe.',
  'unavailable': 'Serviço temporariamente indisponível. Tente novamente.',
};

/**
 * Get user-friendly error message from error object
 */
export const getErrorMessage = (error) => {
  // If error is already a string
  if (typeof error === 'string') {
    return error;
  }

  // Check for Firebase error code
  if (error?.code) {
    const message = FIREBASE_ERROR_MESSAGES[error.code];
    if (message) return message;
  }

  // Check for Firestore error
  if (error?.message?.includes('permission-denied')) {
    return 'Você não tem permissão para acessar estes dados.';
  }

  if (error?.message?.includes('not-found')) {
    return 'Registro não encontrado.';
  }

  // Network errors
  if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  // Return custom message or default
  return error?.message || 'Ocorreu um erro inesperado. Tente novamente.';
};

/**
 * Handle error and show notification
 */
export const handleError = (error, showError) => {
  const message = getErrorMessage(error);

  if (import.meta.env.DEV) {
    console.error('Error:', error);
  }

  if (showError) {
    showError(message);
  }

  return message;
};

/**
 * Async operation wrapper with error handling
 */
export const withErrorHandling = async (operation, showError, errorMessage) => {
  try {
    return await operation();
  } catch (error) {
    const message = errorMessage || getErrorMessage(error);

    if (import.meta.env.DEV) {
      console.error('Operation failed:', error);
    }

    if (showError) {
      showError(message);
    }

    throw error;
  }
};

/**
 * Logger utility (only logs in development)
 */
export const logger = {
  log: (...args) => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  },
  error: (...args) => {
    if (import.meta.env.DEV) {
      console.error(...args);
    }
  },
  warn: (...args) => {
    if (import.meta.env.DEV) {
      console.warn(...args);
    }
  },
  info: (...args) => {
    if (import.meta.env.DEV) {
      console.info(...args);
    }
  },
};
