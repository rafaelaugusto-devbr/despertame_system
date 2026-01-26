// src/services/operariosService.js
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'operarios';

/**
 * Lista todos os operários
 * @param {Object} filters - Filtros opcionais
 * @returns {Promise<Array>}
 */
export async function listarOperarios(filters = {}) {
  try {
    let q = collection(db, COLLECTION_NAME);

    // Aplica filtros se fornecidos
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters.funcao) {
      q = query(q, where('funcao', '==', filters.funcao));
    }

    // Ordena por nome
    q = query(q, orderBy('nome', 'asc'));

    const snapshot = await getDocs(q);
    const operarios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return operarios;
  } catch (error) {
    console.error('Erro ao listar operários:', error);
    throw error;
  }
}

/**
 * Busca um operário por ID
 * @param {string} id - ID do operário
 * @returns {Promise<Object|null>}
 */
export async function buscarOperarioPorId(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar operário:', error);
    throw error;
  }
}

/**
 * Cria um novo operário
 * @param {Object} operario - Dados do operário
 * @returns {Promise<string>} ID do operário criado
 */
export async function criarOperario(operario) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...operario,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar operário:', error);
    throw error;
  }
}

/**
 * Atualiza um operário existente
 * @param {string} id - ID do operário
 * @param {Object} dados - Dados a atualizar
 * @returns {Promise<void>}
 */
export async function atualizarOperario(id, dados) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...dados,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao atualizar operário:', error);
    throw error;
  }
}

/**
 * Exclui um operário
 * @param {string} id - ID do operário
 * @returns {Promise<void>}
 */
export async function excluirOperario(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao excluir operário:', error);
    throw error;
  }
}

/**
 * Busca operários por nome (busca parcial)
 * @param {string} termo - Termo de busca
 * @returns {Promise<Array>}
 */
export async function buscarOperariosPorNome(termo) {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const operarios = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(op => op.nome.toLowerCase().includes(termo.toLowerCase()));

    return operarios;
  } catch (error) {
    console.error('Erro ao buscar operários por nome:', error);
    throw error;
  }
}

/**
 * Obtém estatísticas dos operários
 * @returns {Promise<Object>}
 */
export async function obterEstatisticasOperarios() {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const operarios = snapshot.docs.map(doc => doc.data());

    const stats = {
      total: operarios.length,
      ativos: operarios.filter(op => op.status === 'Ativo').length,
      inativos: operarios.filter(op => op.status === 'Inativo').length,
      afastados: operarios.filter(op => op.status === 'Afastado').length,
      porFuncao: {},
    };

    // Conta por função
    operarios.forEach(op => {
      const funcao = op.funcao || 'Sem função';
      stats.porFuncao[funcao] = (stats.porFuncao[funcao] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    throw error;
  }
}
