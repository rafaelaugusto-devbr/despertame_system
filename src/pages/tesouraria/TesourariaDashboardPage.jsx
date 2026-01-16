import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, Timestamp, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNotification } from '../../hooks/useNotification';
import { handleError } from '../../utils/errorHandler';
import Header from '../../components/layout/Header';
import FinanceChart from '../financeiro/components/FinanceChart';
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiCalendar,
  FiList,
} from 'react-icons/fi';
import '../../pages/public/SuperDashboard.css';
import './TesourariaDashboard.css';

const TesourariaDashboardPage = () => {
  const [financialData, setFinancialData] = useState({
    saldoAtual: 0,
    entradasMes: 0,
    saidasMes: 0,
    entradasHoje: 0,
    saidasHoje: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Buscar lançamentos do mês
      const monthQuery = query(
        collection(db, 'fluxoCaixaLancamentos'),
        where('data', '>=', Timestamp.fromDate(startOfMonth)),
        orderBy('data', 'desc')
      );

      const monthSnapshot = await getDocs(monthQuery);

      let entradasMes = 0;
      let saidasMes = 0;
      let entradasHoje = 0;
      let saidasHoje = 0;

      const transactions = [];

      monthSnapshot.forEach((doc) => {
        const data = doc.data();
        const valor = Number(data.valor) || 0;
        const dataDoc = data.data?.toDate?.() || new Date(data.data);

        // Totais do mês
        if (data.tipo === 'entrada') {
          entradasMes += valor;
        } else if (data.tipo === 'saida') {
          saidasMes += valor;
        }

        // Totais de hoje
        if (dataDoc >= startOfDay) {
          if (data.tipo === 'entrada') {
            entradasHoje += valor;
          } else if (data.tipo === 'saida') {
            saidasHoje += valor;
          }
        }

        // Guardar para lista de transações recentes
        if (transactions.length < 10) {
          transactions.push({
            id: doc.id,
            ...data,
            dataFormatada: dataDoc,
          });
        }
      });

      setFinancialData({
        saldoAtual: entradasMes - saidasMes,
        entradasMes,
        saidasMes,
        entradasHoje,
        saidasHoje,
      });

      setRecentTransactions(transactions.slice(0, 10));
    } catch (error) {
      handleError(error, showError);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__icon">
        <Icon size={28} />
      </div>
      <div className="stat-card__content">
        <h4 className="stat-card__title">{title}</h4>
        <p className="stat-card__value">
          {loading ? <span className="skeleton skeleton--text"></span> : value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="tesouraria-dashboard">
      <Header title="Dashboard Financeiro" subtitle="Visão geral financeira e movimentações" />

      {/* KPI Cards */}
      <section className="dashboard-section">
        <h3 className="section-subtitle">Resumo do Mês Atual</h3>
        <div className="kpi-grid">
          <StatCard
            title="Entradas"
            value={formatCurrency(financialData.entradasMes)}
            icon={FiTrendingUp}
            color="green"
            loading={loading}
          />
          <StatCard
            title="Saídas"
            value={formatCurrency(financialData.saidasMes)}
            icon={FiTrendingDown}
            color="red"
            loading={loading}
          />
          <StatCard
            title="Saldo Atual"
            value={formatCurrency(financialData.saldoAtual)}
            icon={FiDollarSign}
            color="blue"
            loading={loading}
          />
        </div>
      </section>

      <section className="dashboard-section">
        <h3 className="section-subtitle">Movimentações de Hoje</h3>
        <div className="kpi-grid">
          <StatCard
            title="Entradas (Hoje)"
            value={formatCurrency(financialData.entradasHoje)}
            icon={FiTrendingUp}
            color="green"
            loading={loading}
          />
          <StatCard
            title="Saídas (Hoje)"
            value={formatCurrency(financialData.saidasHoje)}
            icon={FiTrendingDown}
            color="red"
            loading={loading}
          />
          <StatCard
            title="Saldo do Dia"
            value={formatCurrency(financialData.entradasHoje - financialData.saidasHoje)}
            icon={FiPieChart}
            color="purple"
            loading={loading}
          />
        </div>
        <p className="kpi-period-note">
          * Últimos 30 dias
        </p>
      </section>

      {/* Chart */}
      <section className="dashboard-section">
        <div className="chart-card">
          <div className="chart-card__header">
            <h2 className="chart-card__title">Resumo Financeiro Mensal</h2>
          </div>
          <div className="chart-card__body">
            {loading ? (
              <div className="chart-skeleton">
                <div className="skeleton skeleton--chart"></div>
              </div>
            ) : (
              <FinanceChart />
            )}
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="dashboard-section">
        <div className="transactions-card">
          <div className="transactions-card__header">
            <div className="activity-card__title">
              <FiList className="activity-card__icon" />
              <h3>Movimentações Recentes</h3>
            </div>
            <span className="transactions-count">{recentTransactions.length}</span>
          </div>
          <div className="transactions-card__body">
            {loading ? (
              <div className="activity-list">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="transaction-item">
                    <div className="skeleton skeleton--text" style={{ width: '60%' }}></div>
                    <div className="skeleton skeleton--text" style={{ width: '30%' }}></div>
                  </div>
                ))}
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className="transactions-list">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className={`transaction-item transaction-item--${tx.tipo}`}>
                    <div className="transaction-item__icon">
                      {tx.tipo === 'entrada' ? <FiTrendingUp /> : <FiTrendingDown />}
                    </div>
                    <div className="transaction-item__info">
                      <span className="transaction-item__title">{tx.descricao}</span>
                      <span className="transaction-item__date">{formatDate(tx.dataFormatada)}</span>
                    </div>
                    <div className={`transaction-item__value transaction-item__value--${tx.tipo}`}>
                      {formatCurrency(tx.valor)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiCalendar size={48} />
                <p>Nenhuma movimentação registrada</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TesourariaDashboardPage;
