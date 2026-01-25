import { getAuth } from 'firebase/auth';

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

// --- DOCUMENT MANAGEMENT FUNCTIONS ---

/**
 * Upload a document/asset to Cloudflare
 * @param {File} file - The file to upload
 * @param {Object} metadata - Additional metadata (titulo, descricao, pasta, etc.)
 * @returns {Promise} Response with file URL and metadata
 */
export async function uploadDocument(file, metadata = {}) {
  const formData = new FormData();
  formData.append('file', file);

  // Add metadata to FormData
  Object.keys(metadata).forEach(key => {
    formData.append(key, metadata[key]);
  });

  const token = await getAuthToken();

  try {
    const response = await fetch(`${API_URL}/api/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type - browser will set it with boundary for multipart/form-data
      },
      body: formData
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Rota não encontrada. Verifique se a API está configurada corretamente em ${API_URL}/api/documents/upload`);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Erro ${response.status}: ${response.statusText}`);
    }
    return data;
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
}

/**
 * List all documents/assets from a specific folder or all
 * @param {string} pasta - Optional folder name to filter
 * @returns {Promise} List of documents
 */
export async function listDocuments(pasta = null) {
  const endpoint = pasta
    ? `/api/documents/list?pasta=${encodeURIComponent(pasta)}`
    : '/api/documents/list';
  return await apiRequest(endpoint);
}

/**
 * Delete a document/asset
 * @param {string} documentId - Document ID to delete
 * @returns {Promise} Success response
 */
export async function deleteDocument(documentId) {
  return await apiRequest(`/api/documents/${documentId}`, {
    method: 'DELETE'
  });
}

/**
 * Create a folder
 * @param {string} folderName - Name of the folder to create
 * @returns {Promise} Success response
 */
export async function createFolder(folderName) {
  return await apiRequest('/api/documents/folder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ folderName })
  });
}

/**
 * List all folders
 * @returns {Promise} List of folders
 */
export async function listFolders() {
  return await apiRequest('/api/documents/folders');
}
