import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNotification } from '../../hooks/useNotification';
import { handleError } from '../../utils/errorHandler';
import Header from '../../components/layout/Header';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiPieChart, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import './Financeiro.css';

const FinanceiroDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    saldoGeral: 0,
    totalEntradas: 0,
    totalSaidas: 0,
    lucroVendas: 0,
    totalCampanhas: 0,
  });
  const [categorias, setCategorias] = useState({ entradas: [], saidas: [] });
  const [campanhas, setCampanhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Buscar todos os dados necessários
      const [lancamentosSnap, categoriasSnap, campanhasSnap] = await Promise.all([
        getDocs(collection(db, 'fluxoCaixaLancamentos')),
        getDocs(collection(db, 'fluxoCaixaCategorias')),
        getDocs(query(collection(db, 'vendasCampanhas'), orderBy('createdAt', 'desc'), limit(5))),
      ]);

      // Criar mapa de categorias por ID
      const categoriasById = {};
      categoriasSnap.forEach((doc) => {
        categoriasById[doc.id] = doc.data().name;
      });

      let totalEntradas = 0;
      let totalSaidas = 0;
      const categoriasMap = { entradas: {}, saidas: {} };

      // Processar lançamentos
      lancamentosSnap.forEach((doc) => {
        const data = doc.data();
        const valor = Number(data.valor) || 0;

        // Buscar nome da categoria usando categoriaId
        const categoriaNome = categoriasById[data.categoriaId] || 'Outros';

        if (data.tipo === 'entrada') {
          totalEntradas += valor;
          categoriasMap.entradas[categoriaNome] = (categoriasMap.entradas[categoriaNome] || 0) + valor;
        } else if (data.tipo === 'saida') {
          totalSaidas += valor;
          categoriasMap.saidas[categoriaNome] = (categoriasMap.saidas[categoriaNome] || 0) + valor;
        }
      });

      // Calcular lucro total de vendas (arrecadado - custo)
      let lucroVendas = 0;
      campanhasSnap.forEach((doc) => {
        const data = doc.data();
        const arrecadado = Number(data.arrecadado) || 0;
        const custoTotal = Number(data.custoTotal) || 0;
        lucroVendas += (arrecadado - custoTotal);
      });

      // Preparar lista de campanhas
      const campanhasList = campanhasSnap.docs.map((doc) => {
        const data = doc.data();
        const vendidos = Number(data.vendidos) || 0;
        const estoqueInicial = Number(data.estoqueInicial) || 1;
        const arrecadado = Number(data.arrecadado) || 0;
        const metaVendas = Number(data.estoqueInicial) * Number(data.precoVenda) || 0;

        return {
          id: doc.id,
          nome: data.nome,
          metaVendas,
          vendasAtuais: arrecadado,
          progresso: (vendidos / estoqueInicial) * 100,
        };
      });

      setDashboardData({
        saldoGeral: totalEntradas - totalSaidas,
        totalEntradas,
        totalSaidas,
        lucroVendas,
        totalCampanhas: campanhasSnap.size,
      });

      setCategorias({
        entradas: Object.entries(categoriasMap.entradas)
          .map(([nome, valor]) => ({ nome, valor }))
          .sort((a, b) => b.valor - a.valor)
          .slice(0, 5),
        saidas: Object.entries(categoriasMap.saidas)
          .map(([nome, valor]) => ({ nome, valor }))
          .sort((a, b) => b.valor - a.valor)
          .slice(0, 5),
      });

      setCampanhas(campanhasList);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      handleError(error, showError);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const StatCard = ({ title, value, icon: Icon, color, loading, link }) => {
    const CardContent = () => (
      <div className={`stat-card stat-card--${color}`}>
        <div className="stat-card__icon">
          <Icon size={28} />
        </div>
        <div className="stat-card__content">
          <h4 className="stat-card__title">{title}</h4>
          <p className="stat-card__value">{loading ? <span className="skeleton skeleton--text"></span> : value}</p>
        </div>
      </div>
    );

    return link ? (
      <Link to={link} className="stat-card-link">
        <CardContent />
      </Link>
    ) : (
      <CardContent />
    );
  };

  return (
    <div className="financeiro-dashboard">
      <Header title="Dashboard Financeiro" subtitle="Visão estratégica unificada de todas as finanças." />

      {/* KPI Cards */}
      <section className="dashboard-section">
        <div className="kpi-grid">
          <StatCard title="Saldo Geral" value={formatCurrency(dashboardData.saldoGeral)} icon={FiDollarSign} color="blue" loading={loading} />
          <StatCard title="Total de Entradas" value={formatCurrency(dashboardData.totalEntradas)} icon={FiTrendingUp} color="green" loading={loading} />
          <StatCard title="Total de Saídas" value={formatCurrency(dashboardData.totalSaidas)} icon={FiTrendingDown} color="red" loading={loading} />
          <StatCard title="Lucro de Vendas" value={formatCurrency(dashboardData.lucroVendas)} icon={FiShoppingCart} color="orange" loading={loading} link="/financeiro/vendas" />
        </div>
      </section>

      {/* Categories & Campaigns Grid */}
      <section className="dashboard-section">
        <div className="charts-grid">
          {/* Top Categorias Entradas */}
          <div className="category-card">
            <div className="category-card__header">
              <h3>Top 5 Categorias - Entradas</h3>
              <Link to="/financeiro/categorias" className="category-card__link">
                Ver todas <FiArrowRight />
              </Link>
            </div>
            <div className="category-card__body">
              {loading ? (
                <div className="category-list">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="category-item">
                      <div className="skeleton skeleton--text" style={{ width: '60%' }}></div>
                      <div className="skeleton skeleton--text" style={{ width: '30%' }}></div>
                    </div>
                  ))}
                </div>
              ) : categorias.entradas.length > 0 ? (
                <div className="category-list">
                  {categorias.entradas.map((cat, idx) => (
                    <div key={idx} className="category-item">
                      <div className="category-item__info">
                        <span className="category-item__name">{cat.nome}</span>
                        <div className="category-item__bar">
                          <div className="category-item__bar-fill category-item__bar-fill--green" style={{ width: `${(cat.valor / categorias.entradas[0].valor) * 100}%` }}></div>
                        </div>
                      </div>
                      <span className="category-item__value">{formatCurrency(cat.valor)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FiPieChart size={48} />
                  <p>Nenhuma entrada registrada</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Categorias Saídas */}
          <div className="category-card">
            <div className="category-card__header">
              <h3>Top 5 Categorias - Saídas</h3>
              <Link to="/financeiro/categorias" className="category-card__link">
                Ver todas <FiArrowRight />
              </Link>
            </div>
            <div className="category-card__body">
              {loading ? (
                <div className="category-list">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="category-item">
                      <div className="skeleton skeleton--text" style={{ width: '60%' }}></div>
                      <div className="skeleton skeleton--text" style={{ width: '30%' }}></div>
                    </div>
                  ))}
                </div>
              ) : categorias.saidas.length > 0 ? (
                <div className="category-list">
                  {categorias.saidas.map((cat, idx) => (
                    <div key={idx} className="category-item">
                      <div className="category-item__info">
                        <span className="category-item__name">{cat.nome}</span>
                        <div className="category-item__bar">
                          <div className="category-item__bar-fill category-item__bar-fill--red" style={{ width: `${(cat.valor / categorias.saidas[0].valor) * 100}%` }}></div>
                        </div>
                      </div>
                      <span className="category-item__value">{formatCurrency(cat.valor)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FiPieChart size={48} />
                  <p>Nenhuma saída registrada</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Campanhas */}
      <section className="dashboard-section">
        <div className="campaigns-card">
          <div className="campaigns-card__header">
            <h3>Campanhas Ativas</h3>
            <Link to="/financeiro/vendas" className="campaigns-card__link">
              Ver todas <FiArrowRight />
            </Link>
          </div>
          <div className="campaigns-card__body">
            {loading ? (
              <div className="campaigns-list">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="campaign-item">
                    <div className="skeleton skeleton--text" style={{ width: '70%' }}></div>
                    <div className="skeleton skeleton--text" style={{ width: '100%', height: '8px', marginTop: '0.5rem' }}></div>
                  </div>
                ))}
              </div>
            ) : campanhas.length > 0 ? (
              <div className="campaigns-list">
                {campanhas.map((camp) => (
                  <Link key={camp.id} to={`/financeiro/vendas/${camp.id}`} className="campaign-item">
                    <div className="campaign-item__info">
                      <span className="campaign-item__name">{camp.nome}</span>
                      <span className="campaign-item__stats">
                        {formatCurrency(camp.vendasAtuais)} de {formatCurrency(camp.metaVendas)}
                      </span>
                    </div>
                    <div className="campaign-item__progress">
                      <div className="campaign-item__progress-bar">
                        <div className="campaign-item__progress-fill" style={{ width: `${Math.min(camp.progresso, 100)}%` }}></div>
                      </div>
                      <span className="campaign-item__progress-text">{camp.progresso.toFixed(0)}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiShoppingCart size={48} />
                <p>Nenhuma campanha ativa</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FinanceiroDashboardPage;
