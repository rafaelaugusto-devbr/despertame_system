// src/services/googleSheetsApi.js
// Serviço de integração com Google Apps Script API para inscrições de retiros

const API_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjeI1xYwuoKTQCAbCc_M89xSIBYbTMXcrAHHsgHBCNdr2eJtR4rG3p5Eza7x658yFUfAWd3AC4Vfkn1T-xLflaqWZkxod-z2Ugdo-5DfBINX-_Z28y2bs_AJ2uDabwf7gYBRZbRY616COXQjUCJgoO98QjEgmwGdLR7zHTpp1Anx2LXJ-5mWWmx5t2uJpzyGZbbV09wSIOfomvI-ShlZ1LHpWIOwF3Rk6ErAqR-wOcDxJhTIeoMAds2QGdT2MO1IekahhpuqYv-TYtUjJbSiR2gGZiHnOkaihw7KSxhccAiIbP3f8hYOiPZeKmLQUZsZJXkCwn-38YBGjpxBYvYsgt5Fqv4EYu9y40zE2Gwra986nhKKP2LS0s2Ih-PYg&lib=MVYhAVXTDdise702xjaYgBauiLsUwLjAJ';
const API_KEY = '1o8oNUJs5-lt3EsIpTZ07Gdfcla15yVKiajhaYFooyBo453';

/**
 * Sincroniza eventos do Google Drive
 * @returns {Promise<{success: boolean, status: string, processed: number, added: number, skipped: number}>}
 */
export async function syncEvents() {
  try {
    const url = `${API_URL}&action=sync&apiKey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao sincronizar eventos:', error);
    throw error;
  }
}

/**
 * Busca o registro de eventos/anos disponíveis
 * @returns {Promise<{success: boolean, data: {items: Array<{evento: string, anos: string[]}>}}>}
 */
export async function getRegistry() {
  try {
    const url = `${API_URL}&action=registry&apiKey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar registro:', error);
    throw error;
  }
}

/**
 * Busca dados de inscritos de um evento/ano específico
 * @param {Object} params - Parâmetros da busca
 * @param {string} params.evento - Nome do evento
 * @param {string} params.ano - Ano do evento
 * @param {number} [params.offset=0] - Offset para paginação
 * @param {number} [params.limit=100] - Limite de registros
 * @param {string} [params.q] - Termo de busca
 * @returns {Promise<{success: boolean, data: {total: number, offset: number, limit: number, headers: string[], items: Array}}>}
 */
export async function getInscritosData({ evento, ano, offset = 0, limit = 100, q = '' }) {
  try {
    let url = `${API_URL}&action=data&apiKey=${API_KEY}&evento=${encodeURIComponent(evento)}&ano=${encodeURIComponent(ano)}&offset=${offset}&limit=${limit}`;

    if (q) {
      url += `&q=${encodeURIComponent(q)}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados de inscritos:', error);
    throw error;
  }
}

/**
 * Atualiza um campo de um inscrito
 * @param {Object} params - Parâmetros da atualização
 * @param {string} params.evento - Nome do evento
 * @param {string} params.ano - Ano do evento
 * @param {number} params.rowIndex - Índice da linha (>=2)
 * @param {string} params.campo - Nome do campo a atualizar
 * @param {any} params.valor - Novo valor
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export async function updateInscritoField({ evento, ano, rowIndex, campo, valor }) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: API_KEY,
        action: 'update',
        evento,
        ano,
        rowIndex,
        campo,
        valor,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao atualizar campo:', error);
    throw error;
  }
}

/**
 * Atualiza múltiplos campos de um inscrito de uma vez
 * @param {Object} params - Parâmetros da atualização
 * @param {string} params.evento - Nome do evento
 * @param {string} params.ano - Ano do evento
 * @param {number} params.rowIndex - Índice da linha (>=2)
 * @param {Object} params.patch - Objeto com campos e valores {Campo1: Valor1, Campo2: Valor2}
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export async function bulkUpdateInscrito({ evento, ano, rowIndex, patch }) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: API_KEY,
        action: 'bulk_update',
        evento,
        ano,
        rowIndex,
        patch,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao atualizar múltiplos campos:', error);
    throw error;
  }
}

/**
 * Verifica a saúde da API
 * @returns {Promise<{success: boolean, ok: boolean}>}
 */
export async function healthCheck() {
  try {
    const url = `${API_URL}&action=health&apiKey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao verificar saúde da API:', error);
    throw error;
  }
}

/**
 * Exporta dados para CSV
 * @param {Array} items - Array de objetos
 * @param {Array} headers - Array de cabeçalhos
 * @param {string} filename - Nome do arquivo
 */
export function exportToCSV(items, headers, filename = 'inscritos.csv') {
  if (!items || items.length === 0) return;

  // Cria cabeçalhos
  const csvHeaders = headers.join(',');

  // Cria linhas
  const csvRows = items.map(item => {
    return headers.map(header => {
      const value = item[header] ?? '';
      // Escapa valores com vírgula ou aspas
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',');
  });

  // Combina tudo
  const csv = [csvHeaders, ...csvRows].join('\n');

  // Cria blob e download
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
