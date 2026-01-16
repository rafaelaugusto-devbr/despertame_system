import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
  getCountFromServer,
} from 'firebase/firestore';
import { useNotification } from './useNotification';
import { handleError } from '../utils/errorHandler';

/**
 * Custom hook para buscar dados do dashboard de forma otimizada
 *
 * Otimizações:
 * - Usa cache local (sessionStorage) para evitar múltiplas requisições
 * - Limita queries aos últimos 30 dias para cálculos financeiros
 * - Usa getCountFromServer para contagem eficiente
 * - Tratamento de erros centralizado
 */
export const useDashboardData = () => {
  const [kpiData, setKpiData] = useState({
    totalLeads: 0,
    saldo: 0,
    entradas: 0,
    saidas: 0,
  });
  const [proximosEventos, setProximosEventos] = useState([]);
  const [ultimosPosts, setUltimosPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Definir período para cálculos (últimos 30 dias)
        const now = Timestamp.now();
        const thirtyDaysAgo = Timestamp.fromDate(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );

        // Executar queries em paralelo para melhor performance
        const [
          lancamentosSnapshot,
          leadsSnapshot,
          eventosSnapshot,
          postsSnapshot,
        ] = await Promise.all([
          // 1. Buscar lançamentos dos últimos 30 dias (otimizado)
          getDocs(
            query(
              collection(db, 'fluxoCaixaLancamentos'),
              where('data', '>=', thirtyDaysAgo),
              orderBy('data', 'desc')
            )
          ),

          // 2. Buscar total de leads (apenas contagem)
          getCountFromServer(collection(db, 'leads')),

          // 3. Buscar próximos 3 eventos
          getDocs(
            query(
              collection(db, 'calendarioEventos'),
              where('start', '>=', now),
              orderBy('start', 'asc'),
              limit(3)
            )
          ),

          // 4. Buscar últimos 3 posts
          getDocs(
            query(
              collection(db, 'posts'),
              orderBy('data', 'desc'),
              limit(3)
            )
          ),
        ]);

        // Calcular totais financeiros
        let entradas = 0;
        let saidas = 0;

        lancamentosSnapshot.forEach((doc) => {
          const data = doc.data();
          const valor = Number(data.valor) || 0;

          if (data.tipo === 'entrada') {
            entradas += valor;
          } else if (data.tipo === 'saida') {
            saidas += valor;
          }
        });

        const totalLeads = leadsSnapshot.data().count;

        // Atualizar estados
        setKpiData({
          totalLeads,
          saldo: entradas - saidas,
          entradas,
          saidas,
        });

        setProximosEventos(
          eventosSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );

        setUltimosPosts(
          postsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );

        // Cache dos dados (válido por 5 minutos)
        const cacheData = {
          kpiData: { totalLeads, saldo: entradas - saidas, entradas, saidas },
          timestamp: Date.now(),
        };
        sessionStorage.setItem('dashboard_cache', JSON.stringify(cacheData));

      } catch (error) {
        handleError(error, showError);
      } finally {
        setLoading(false);
      }
    };

    // Verificar cache antes de buscar
    const cachedData = sessionStorage.getItem('dashboard_cache');
    if (cachedData) {
      try {
        const { kpiData: cached, timestamp } = JSON.parse(cachedData);
        const cacheAge = Date.now() - timestamp;

        // Se cache tem menos de 5 minutos, usar
        if (cacheAge < 5 * 60 * 1000) {
          setKpiData(cached);
          setLoading(false);
          return;
        }
      } catch (e) {
        // Cache inválido, continuar com fetch
      }
    }

    fetchDashboardData();
  }, [showError]);

  return {
    kpiData,
    proximosEventos,
    ultimosPosts,
    loading,
  };
};
