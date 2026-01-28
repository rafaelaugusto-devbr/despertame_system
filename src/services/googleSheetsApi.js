// src/services/googleSheetsApi.js

/**
 * ⚠️ IMPORTANTE: Configure a URL da sua API aqui
 *
 * Para obter a URL:
 * 1. Abra o Google Apps Script
 * 2. Clique em "Implantar" → "Nova implantação"
 * 3. Tipo: "Aplicativo da Web"
 * 4. Executar como: "Eu"
 * 5. Quem tem acesso: "Qualquer pessoa"
 * 6. Copie a URL gerada
 */

const API_CONFIG = {
  // URL da API do Google Apps Script
  BASE_URL: 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjeI1xYwuoKTQCAbCc_M89xSIBYbTMXcrAHHsgHBCNdr2eJtR4rG3p5Eza7x658yFUfAWd3AC4Vfkn1T-xLflaqWZkxod-z2Ugdo-5DfBINX-_Z28y2bs_AJ2uDabwf7gYBRZbRY616COXQjUCJgoO98QjEgmwGdLR7zHTpp1Anx2LXJ-5mWWmx5t2uJpzyGZbbV09wSIOfomvI-ShlZ1LHpWIOwF3Rk6ErAqR-wOcDxJhTIeoMAds2QGdT2MO1IekahhpuqYv-TYtUjJbSiR2gGZiHnOkaihw7KSxhccAiIbP3f8hYOiPZeKmLQUZsZJXkCwn-38YBGjpxBYvYsgt5Fqv4EYu9y40zE2Gwra986nhKKP2LS0s2Ih-PYg&lib=MVYhAVXTDdise702xjaYgBauiLsUwLjAJ',
  API_KEY: '1o8oNUJs5-lt3EsIpTZ07Gdfcla15yVKiajhaYFooyBo453',
};

/**
 * Função auxiliar para fazer requisições GET
 */
const fetchGet = async (params) => {
  const url = new URL(API_CONFIG.BASE_URL);

  // Adiciona parâmetros à URL
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro na requisição GET:', error);
    throw error;
  }
};

/**
 * Função auxiliar para fazer requisições POST
 */
const fetchPost = async (body) => {
  try {
    const response = await fetch(API_CONFIG.BASE_URL, {
      method: 'POST',
      body: JSON.stringify(body),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro na requisição POST:', error);
    throw error;
  }
};

/**
 * Health check - verifica se a API está respondendo
 */
export const healthCheck = async () => {
  try {
    return await fetchGet({
      action: 'health',
      apiKey: API_CONFIG.API_KEY,
    });
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/**
 * Sincroniza eventos do Google Drive para o índice
 */
export const syncEvents = async () => {
  try {
    return await fetchGet({
      action: 'sync',
      apiKey: API_CONFIG.API_KEY,
    });
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/**
 * Obtém o registro de eventos/anos disponíveis
 */
export const getRegistry = async () => {
  try {
    return await fetchGet({
      action: 'registry',
      apiKey: API_CONFIG.API_KEY,
    });
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/**
 * Obtém dados dos inscritos de um evento/ano
 */
export const getInscritosData = async ({ evento, ano, offset = 0, limit = 50, q = '' }) => {
  try {
    return await fetchGet({
      action: 'data',
      evento,
      ano,
      offset,
      limit,
      q,
      apiKey: API_CONFIG.API_KEY,
    });
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/**
 * Atualiza um campo específico de um inscrito
 */
export const updateInscritoField = async ({ evento, ano, rowIndex, campo, valor }) => {
  try {
    return await fetchPost({
      action: 'update',
      apiKey: API_CONFIG.API_KEY,
      evento,
      ano,
      rowIndex,
      campo,
      valor,
    });
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/**
 * Atualiza múltiplos campos de um inscrito (bulk update)
 */
export const bulkUpdateInscrito = async ({ evento, ano, rowIndex, patch }) => {
  try {
    return await fetchPost({
      action: 'bulk_update',
      apiKey: API_CONFIG.API_KEY,
      evento,
      ano,
      rowIndex,
      patch,
    });
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/**
 * Exporta dados para CSV
 */
export const exportToCSV = (data, headers, filename = 'export.csv') => {
  try {
    // Remove campos internos
    const cleanHeaders = headers.filter(h => !['rowIndex', 'evento', 'ano'].includes(h));

    // Cria CSV
    let csv = cleanHeaders.join(',') + '\n';

    data.forEach(row => {
      const values = cleanHeaders.map(header => {
        const value = row[header] || '';
        const stringValue = String(value).replace(/"/g, '""');
        return stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')
          ? `"${stringValue}"`
          : stringValue;
      });
      csv += values.join(',') + '\n';
    });

    // Download
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    throw new Error('Erro ao exportar arquivo CSV: ' + error.message);
  }
};
