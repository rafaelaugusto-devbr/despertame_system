// src/services/despertameApi.js
// Classe unificada para interação com a API Despertame
// Baseada na documentação oficial da API

import { API_BASE_URL, API_KEY } from '../config/api';
import { BUCKET_DOMAINS } from './storageApi';

/**
 * Classe principal da API Despertame
 * Unifica gestão de usuários e storage R2
 */
class DespertameAPI {
  constructor(apiKey = API_KEY) {
    this.apiKey = apiKey;
    this.baseURL = API_BASE_URL;
  }

  // =========================================================================
  // USUÁRIOS - Requer autenticação com API Key
  // =========================================================================

  /**
   * Cria um novo usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {string} displayName - Nome de exibição
   * @param {boolean} isAdmin - Se o usuário é administrador
   * @returns {Promise<Object>} Resultado da operação
   */
  async createUser(email, password, displayName, isAdmin = false) {
    const response = await fetch(`${this.baseURL}/api/users/create`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, displayName, isAdmin })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao criar usuário');
    }

    return data;
  }

  /**
   * Lista todos os usuários
   * @returns {Promise<Object>} Lista de usuários
   */
  async listUsers() {
    const response = await fetch(`${this.baseURL}/api/users`, {
      headers: { 'X-API-Key': this.apiKey }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao listar usuários');
    }

    return data;
  }

  /**
   * Habilita ou desabilita um usuário
   * @param {string} uid - ID do usuário
   * @param {boolean} disabled - true para desabilitar, false para habilitar
   * @returns {Promise<Object>} Resultado da operação
   */
  async toggleUser(uid, disabled) {
    const response = await fetch(`${this.baseURL}/api/users/${uid}/toggle`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ disabled })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao atualizar usuário');
    }

    return data;
  }

  /**
   * Exclui um usuário
   * @param {string} uid - ID do usuário
   * @returns {Promise<Object>} Resultado da operação
   */
  async deleteUser(uid) {
    const response = await fetch(`${this.baseURL}/api/users/${uid}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': this.apiKey }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao excluir usuário');
    }

    return data;
  }

  /**
   * Muda a própria senha
   * @param {string} email - Email do usuário
   * @param {string} currentPassword - Senha atual
   * @param {string} newPassword - Nova senha
   * @returns {Promise<Object>} Resultado da operação
   */
  async changePassword(email, currentPassword, newPassword) {
    const response = await fetch(`${this.baseURL}/api/me/password`, {
      method: 'PUT',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, currentPassword, newPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao alterar senha');
    }

    return data;
  }

  /**
   * Admin muda senha de outro usuário
   * @param {string} uid - ID do usuário
   * @param {string} newPassword - Nova senha
   * @returns {Promise<Object>} Resultado da operação
   */
  async changeUserPassword(uid, newPassword) {
    const response = await fetch(`${this.baseURL}/api/users/${uid}/password`, {
      method: 'PUT',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao alterar senha do usuário');
    }

    return data;
  }

  // =========================================================================
  // STORAGE R2 - Público (não requer autenticação)
  // =========================================================================

  /**
   * Normaliza URL para usar domínio customizado
   */
  _normalizeFileUrl(bucketName, url, filename) {
    const domain = BUCKET_DOMAINS[bucketName];
    if (!domain) {
      return url;
    }

    // Se a URL já usa o domínio customizado, retorna como está
    if (url && url.startsWith(domain)) {
      return url;
    }

    // Caso contrário, constrói URL com domínio customizado
    return `${domain}/${filename}`;
  }

  /**
   * Normaliza lista de arquivos
   */
  _normalizeFileList(bucketName, files) {
    return files.map(file => ({
      ...file,
      url: this._normalizeFileUrl(bucketName, file.url, file.key)
    }));
  }

  /**
   * Lista arquivos de um bucket
   * @param {string} bucket - Nome do bucket (logo, financeiro, tesouraria, blog)
   * @returns {Promise<Object>} Lista de arquivos
   */
  async listFiles(bucket) {
    const response = await fetch(`${this.baseURL}/api/storage/${bucket}`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao listar arquivos');
    }

    // Normaliza URLs para usar domínios customizados
    if (data.files) {
      data.files = this._normalizeFileList(bucket, data.files);
    }

    return data;
  }

  /**
   * Faz upload de um arquivo
   * @param {string} bucket - Nome do bucket
   * @param {File} file - Arquivo para upload
   * @param {Function} onProgress - Callback de progresso (opcional)
   * @returns {Promise<Object>} Informações do arquivo enviado
   */
  async uploadFile(bucket, file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

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
            // Normaliza URL para usar domínio customizado
            if (data.url && data.key) {
              data.url = this._normalizeFileUrl(bucket, data.url, data.key);
            }
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
      xhr.open('POST', `${this.baseURL}/api/storage/${bucket}/upload`);
      xhr.send(formData);
    });
  }

  /**
   * Deleta um arquivo
   * @param {string} bucket - Nome do bucket
   * @param {string} filename - Nome do arquivo
   * @returns {Promise<Object>} Resultado da operação
   */
  async deleteFile(bucket, filename) {
    const response = await fetch(
      `${this.baseURL}/api/storage/${bucket}/delete/${encodeURIComponent(filename)}`,
      { method: 'DELETE' }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao deletar arquivo');
    }

    return data;
  }

  /**
   * Obtém URL pública de um arquivo
   * @param {string} bucket - Nome do bucket
   * @param {string} filename - Nome do arquivo
   * @returns {string} URL pública do arquivo
   */
  getFileUrl(bucket, filename) {
    const domain = BUCKET_DOMAINS[bucket];
    if (!domain) {
      console.warn(`Domínio customizado não encontrado para bucket: ${bucket}`);
      return `${this.baseURL}/api/storage/${bucket}/${filename}`;
    }
    return `${domain}/${filename}`;
  }
}

// Exporta instância singleton
export const api = new DespertameAPI();

// Exporta a classe para instâncias customizadas
export default DespertameAPI;
