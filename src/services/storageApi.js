// src/services/storageApi.js
// Serviço de integração com API de Storage (R2)

const API_BASE_URL = 'https://api.despertame.com';

/**
 * Buckets disponíveis
 */
export const BUCKETS = {
  LOGO: 'logo',
  FINANCEIRO: 'financeiro',
  TESOURARIA: 'tesouraria',
  BLOG: 'blog',
};

/**
 * Lista arquivos de um bucket
 * Não requer autenticação
 */
export const listFiles = async (bucketName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/storage/${bucketName}`);

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao listar arquivos');
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro ao listar arquivos do bucket ${bucketName}:`, error);
    throw error;
  }
};

/**
 * Lista arquivos de todos os buckets
 */
export const listAllBuckets = async () => {
  const buckets = Object.values(BUCKETS);
  const results = {};

  await Promise.all(
    buckets.map(async (bucket) => {
      try {
        const data = await listFiles(bucket);
        results[bucket] = data.files || [];
      } catch (error) {
        console.error(`Erro ao listar bucket ${bucket}:`, error);
        results[bucket] = [];
      }
    })
  );

  return results;
};

/**
 * Faz upload de arquivo para um bucket
 * Não requer autenticação
 */
export const uploadFile = async (bucketName, file, onProgress = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      // Progress event
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      // Load event (sucesso)
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            reject(new Error('Erro ao processar resposta'));
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.error || 'Erro ao fazer upload'));
          } catch (e) {
            reject(new Error('Erro ao fazer upload'));
          }
        }
      });

      // Error event
      xhr.addEventListener('error', () => {
        reject(new Error('Erro de rede ao fazer upload'));
      });

      // Abort event
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelado'));
      });

      // Envia a requisição
      xhr.open('POST', `${API_BASE_URL}/api/storage/${bucketName}/upload`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error(`Erro ao fazer upload para ${bucketName}:`, error);
    throw error;
  }
};

/**
 * Deleta arquivo de um bucket
 * Não requer autenticação
 */
export const deleteFile = async (bucketName, filename) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/storage/${bucketName}/delete/${encodeURIComponent(filename)}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao deletar arquivo');
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro ao deletar arquivo ${filename}:`, error);
    throw error;
  }
};

/**
 * Obtém URL pública de um arquivo
 */
export const getFileUrl = (bucketName, filename) => {
  return `${API_BASE_URL}/api/storage/${bucketName}/${filename}`;
};

/**
 * Formata tamanho de arquivo
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Obtém extensão de arquivo
 */
export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

/**
 * Verifica se arquivo é imagem
 */
export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  return imageExtensions.includes(getFileExtension(filename));
};

/**
 * Agrupa arquivos por extensão
 */
export const groupFilesByExtension = (files) => {
  const grouped = {};

  files.forEach((file) => {
    const ext = getFileExtension(file.key);
    if (!grouped[ext]) {
      grouped[ext] = [];
    }
    grouped[ext].push(file);
  });

  return grouped;
};
