import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Header from '../../components/layout/Header';
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiShoppingCart,
  FiArrowRight,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';
import './Financeiro.css';

const FinanceiroDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    // Saldo e totais gerais
    saldoAtual: 0,
    totalEntradas: 0,
    totalSaidas: 0,

    // Futuro (próximos 30 dias)
    recebimentosFuturos: 0,
    despesasFuturas: 0,
    saldoProjetado: 0,

    // Vendas e Rifas
    lucroVendas: 0,
    arrecadacaoRifas: 0,

    // Retiros
    arrecadacaoRetiros: 0,
  });

  const [categorias, setCategorias] = useState({ entradas: [], saidas: [] });
  const [proximosVencimentos, setProximosVencimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const agora = new Date();
      const inicio30Dias = Timestamp.fromDate(agora);
      const fim30Dias = Timestamp.fromDate(new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000));

      // Buscar todas as coleções
      const [
        lancamentosSnap,
        categoriasSnap,
        campanhasSnap,
        rifasSnap,
        inscritosSnap
      ] = await Promise.all([
        getDocs(collection(db, 'fluxoCaixaLancamentos')),
        getDocs(collection(db, 'fluxoCaixaCategorias')),
        getDocs(collection(db, 'vendasCampanhas')),
        getDocs(collection(db, 'rifas')),
        getDocs(collection(db, 'retiroInscritos'))
      ]);

      // ===== CATEGORIAS =====
      const categoriasById = {};
      categoriasSnap.forEach((doc) => {
        categoriasById[doc.id] = doc.data().name;
      });

      // ===== LANÇAMENTOS FINANCEIROS =====
      let totalEntradas = 0;
      let totalSaidas = 0;
      let recebimentosFuturos = 0;
      let despesasFuturas = 0;
      const categoriasMap = { entradas: {}, saidas: {} };
      const vencimentosList = [];

      lancamentosSnap.forEach((doc) => {
        const data = doc.data();
        const valor = Number(data.valor) || 0;
        const categoriaNome = categoriasById[data.categoriaId] || 'Outros';
        const dataVencimento = data.dataVencimento?.toDate();
        const pago = data.pago || false;

        // Totais gerais (apenas itens pagos)
        if (pago) {
          if (data.tipo === 'entrada') {
            totalEntradas += valor;
            categoriasMap.entradas[categoriaNome] = (categoriasMap.entradas[categoriaNome] || 0) + valor;
          } else if (data.tipo === 'saida') {
            totalSaidas += valor;
            categoriasMap.saidas[categoriaNome] = (categoriasMap.saidas[categoriaNome] || 0) + valor;
          }
        }

        // Contas futuras (não pagas)
        if (!pago && dataVencimento) {
          const diasAteVencimento = Math.ceil((dataVencimento - agora) / (1000 * 60 * 60 * 24));

          if (diasAteVencimento >= 0 && diasAteVencimento <= 30) {
            if (data.tipo === 'entrada') {
              recebimentosFuturos += valor;
            } else if (data.tipo === 'saida') {
              despesasFuturas += valor;
            }

            vencimentosList.push({
              id: doc.id,
              descricao: data.descricao,
              valor,
              tipo: data.tipo,
              dataVencimento,
              diasAteVencimento,
              categoriaNome
            });
          }
        }
      });

      // Ordenar vencimentos por data
      vencimentosList.sort((a, b) => a.dataVencimento - b.dataVencimento);

      // ===== VENDAS (Campanhas) =====
      let lucroVendas = 0;
      campanhasSnap.forEach((doc) => {
        const data = doc.data();
        const arrecadado = Number(data.arrecadado) || 0;
        const custoTotal = Number(data.custoTotal) || 0;
        lucroVendas += (arrecadado - custoTotal);
      });

      // ===== RIFAS =====
      let arrecadacaoRifas = 0;
      for (const rifaDoc of rifasSnap.docs) {
        const vendasSnap = await getDocs(collection(db, 'rifas', rifaDoc.id, 'vendas'));
        vendasSnap.forEach((vendaDoc) => {
          const venda = vendaDoc.data();
          arrecadacaoRifas += Number(venda.valorPago) || 0;
        });
      }

      // ===== RETIROS (Inscritos) =====
      let arrecadacaoRetiros = 0;
      inscritosSnap.forEach((doc) => {
        const data = doc.data();
        if (data.pago) {
          arrecadacaoRetiros += Number(data.valorPago) || 0;
        }
      });

      // ===== CÁLCULOS FINAIS =====
      const saldoAtual = totalEntradas - totalSaidas + lucroVendas + arrecadacaoRifas + arrecadacaoRetiros;
      const saldoProjetado = saldoAtual + recebimentosFuturos - despesasFuturas;

      // Top 5 categorias
      const topEntradas = Object.entries(categoriasMap.entradas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([nome, valor]) => ({ nome, valor }));

      const topSaidas = Object.entries(categoriasMap.saidas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([nome, valor]) => ({ nome, valor }));

      setDashboardData({
        saldoAtual,
        totalEntradas,
        totalSaidas,
        recebimentosFuturos,
        despesasFuturas,
        saldoProjetado,
        lucroVendas,
        arrecadacaoRifas,
        arrecadacaoRetiros,
      });

      setCategorias({
        entradas: topEntradas,
        saidas: topSaidas,
      });

      setProximosVencimentos(vencimentosList.slice(0, 10));

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <>
        <Header title="Dashboard Financeiro" subtitle="Visão geral de controladoria" />
        <p>Carregando dados financeiros...</p>
      </>
    );
  }

  return (
    <>
      <Header
        title="Dashboard Financeiro"
        subtitle="Visão completa de controladoria e fluxo de caixa"
      />

      {/* KPIs Principais */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
          Posição Atual do Caixa
        </h3>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="stat-card stat-card--blue">
            <div className="stat-card__icon">
              <FiDollarSign size={28} />
            </div>
            <div className="stat-card__content">
              <h4 className="stat-card__title">Saldo em Caixa</h4>
              <p className="stat-card__value">{formatCurrency(dashboardData.saldoAtual)}</p>
            </div>
          </div>

          <div className="stat-card stat-card--green">
            <div className="stat-card__icon">
              <FiTrendingUp size={28} />
            </div>
            <div className="stat-card__content">
              <h4 className="stat-card__title">Total Entradas</h4>
              <p className="stat-card__value">{formatCurrency(dashboardData.totalEntradas)}</p>
            </div>
          </div>

          <div className="stat-card stat-card--red">
            <div className="stat-card__icon">
              <FiTrendingDown size={28} />
            </div>
            <div className="stat-card__content">
              <h4 className="stat-card__title">Total Saídas</h4>
              <p className="stat-card__value">{formatCurrency(dashboardData.totalSaidas)}</p>
            </div>
          </div>

          <div className="stat-card stat-card--orange">
            <div className="stat-card__icon">
              <FiPieChart size={28} />
            </div>
            <div className="stat-card__content">
              <h4 className="stat-card__title">Lucro Vendas</h4>
              <p className="stat-card__value">{formatCurrency(dashboardData.lucroVendas)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Projeção Futura */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
          Projeção dos Próximos 30 Dias
        </h3>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' }}>
            <div className="stat-card__icon">
              <FiCheckCircle size={28} style={{ color: '#065f46' }} />
            </div>
            <div className="stat-card__content">
              <h4 className="stat-card__title" style={{ color: '#065f46' }}>Recebimentos Futuros</h4>
              <p className="stat-card__value" style={{ color: '#065f46' }}>
                {formatCurrency(dashboardData.recebimentosFuturos)}
              </p>
            </div>
          </div>

          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
            <div className="stat-card__icon">
              <FiAlertCircle size={28} style={{ color: '#92400e' }} />
            </div>
            <div className="stat-card__content">
              <h4 className="stat-card__title" style={{ color: '#92400e' }}>Despesas Futuras</h4>
              <p className="stat-card__value" style={{ color: '#92400e' }}>
                {formatCurrency(dashboardData.despesasFuturas)}
              </p>
            </div>
          </div>

          <div className="stat-card stat-card--blue">
            <div className="stat-card__icon">
              <FiCalendar size={28} />
            </div>
            <div className="stat-card__content">
              <h4 className="stat-card__title">Saldo Projetado</h4>
              <p className="stat-card__value">{formatCurrency(dashboardData.saldoProjetado)}</p>
              <small style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Após recebimentos e despesas
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* Receitas por Módulo */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
          Arrecadação por Módulo
        </h3>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="stat-card stat-card--purple">
            <div className="stat-card__icon">
              <FiShoppingCart size={24} />
            </div>
            <div className="stat-card__content">
              <h4 className="stat-card__title">Vendas</h4>
              <p className="stat-card__value">{formatCurrency(dashboardData.lucroVendas)}</p>
            </div>
          </div>

          <div className="stat-card stat-card--orange">
            <div className="stat-card__icon">
              <FiPieChart size={24} />
            </div>
            <div className="stat-card__content">
              <h4 className="stat-card__title">Rifas</h4>
              <p className="stat-card__value">{formatCurrency(dashboardData.arrecadacaoRifas)}</p>
            </div>
          </div>

          <div className="stat-card stat-card--green">
            <div className="stat-card__icon">
              <FiDollarSign size={24} />
            </div>
            <div className="stat-card__content">
              <h4 className="stat-card__title">Retiros</h4>
              <p className="stat-card__value">{formatCurrency(dashboardData.arrecadacaoRetiros)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid: Categorias + Próximos Vencimentos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Top Categorias Entradas */}
        <div className="link-card">
          <div className="category-card__header">
            <h3>Top 5 Categorias - Entradas</h3>
            <Link to="/tesouraria/categorias" className="category-card__link">
              Ver todas <FiArrowRight />
            </Link>
          </div>
          <div className="category-list">
            {categorias.entradas.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>
                Nenhuma entrada registrada
              </p>
            ) : (
              categorias.entradas.map((cat, idx) => (
                <div key={idx} className="category-item">
                  <div className="category-item__info">
                    <span className="category-item__name">{cat.nome}</span>
                  </div>
                  <span className="category-item__value" style={{ color: '#10b981', fontWeight: 600 }}>
                    {formatCurrency(cat.valor)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Categorias Saídas */}
        <div className="link-card">
          <div className="category-card__header">
            <h3>Top 5 Categorias - Saídas</h3>
            <Link to="/tesouraria/categorias" className="category-card__link">
              Ver todas <FiArrowRight />
            </Link>
          </div>
          <div className="category-list">
            {categorias.saidas.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>
                Nenhuma saída registrada
              </p>
            ) : (
              categorias.saidas.map((cat, idx) => (
                <div key={idx} className="category-item">
                  <div className="category-item__info">
                    <span className="category-item__name">{cat.nome}</span>
                  </div>
                  <span className="category-item__value" style={{ color: '#ef4444', fontWeight: 600 }}>
                    {formatCurrency(cat.valor)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Próximos Vencimentos */}
      <section>
        <div className="link-card">
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b' }}>
              <FiCalendar style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Próximos Vencimentos (30 dias)
            </h3>
            <Link to="/tesouraria/adicionar" className="btn btn-primary btn-small">
              <FiTrendingUp /> Novo Lançamento
            </Link>
          </div>

          {proximosVencimentos.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
              Nenhum vencimento programado para os próximos 30 dias
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="lancamentos-table">
                <thead>
                  <tr>
                    <th>Vencimento</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Dias</th>
                  </tr>
                </thead>
                <tbody>
                  {proximosVencimentos.map((venc) => (
                    <tr key={venc.id}>
                      <td data-label="Vencimento">{formatDate(venc.dataVencimento)}</td>
                      <td data-label="Descrição">{venc.descricao}</td>
                      <td data-label="Categoria">{venc.categoriaNome}</td>
                      <td data-label="Tipo">
                        <span
                          className={`badge badge--${venc.tipo === 'entrada' ? 'success' : 'danger'}`}
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}
                        >
                          {venc.tipo}
                        </span>
                      </td>
                      <td
                        data-label="Valor"
                        style={{
                          fontWeight: 600,
                          color: venc.tipo === 'entrada' ? '#10b981' : '#ef4444'
                        }}
                      >
                        {formatCurrency(venc.valor)}
                      </td>
                      <td data-label="Dias">
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: venc.diasAteVencimento <= 7 ? '#fee2e2' : '#dbeafe',
                            color: venc.diasAteVencimento <= 7 ? '#991b1b' : '#1e40af',
                          }}
                        >
                          {venc.diasAteVencimento === 0 ? 'HOJE' : `${venc.diasAteVencimento}d`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .category-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .category-card__header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .category-card__link {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .category-card__link:hover {
          color: #2563eb;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .category-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .category-item:hover {
          background: #f1f5f9;
        }

        .category-item__name {
          font-size: 0.9375rem;
          color: #475569;
          font-weight: 500;
        }

        .category-item__value {
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};

export default FinanceiroDashboardPage;
