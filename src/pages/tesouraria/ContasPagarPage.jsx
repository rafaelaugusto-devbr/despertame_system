import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiPlus
} from 'react-icons/fi';
import './Financeiro.css';

const ContasPagarPage = () => {
  const navigate = useNavigate();
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas'); // todas, vencidas, proximas

  useEffect(() => {
    fetchContas();
  }, []);

  const fetchContas = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'fluxoCaixaLancamentos'),
        where('pago', '==', false),
        orderBy('dataVencimento', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const agora = new Date();

      const categoriasSnap = await getDocs(collection(db, 'fluxoCaixaCategorias'));
      const categoriasById = {};
      categoriasSnap.forEach((doc) => {
        categoriasById[doc.id] = doc.data().name;
      });

      const contasData = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const dataVencimento = data.dataVencimento?.toDate();
        const diasAteVencimento = dataVencimento
          ? Math.ceil((dataVencimento - agora) / (1000 * 60 * 60 * 24))
          : null;

        return {
          id: docSnap.id,
          descricao: data.descricao,
          valor: Number(data.valor) || 0,
          tipo: data.tipo,
          dataVencimento,
          diasAteVencimento,
          categoria: categoriasById[data.categoriaId] || 'Sem categoria',
          observacoes: data.observacoes || '',
        };
      });

      setContas(contasData);
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarComoPago = async (id) => {
    if (!window.confirm('Marcar esta conta como paga?')) return;

    try {
      await updateDoc(doc(db, 'fluxoCaixaLancamentos', id), {
        pago: true,
      });
      await fetchContas();
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      alert('Erro ao marcar conta como paga');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getFilteredContas = () => {
    const agora = new Date();

    switch (filter) {
      case 'vencidas':
        return contas.filter(c => c.dataVencimento && c.dataVencimento < agora);
      case 'proximas':
        return contas.filter(c => c.diasAteVencimento !== null && c.diasAteVencimento >= 0 && c.diasAteVencimento <= 30);
      default:
        return contas;
    }
  };

  const contasFiltradas = getFilteredContas();
  const totalAPagar = contasFiltradas.reduce((sum, c) => sum + (c.tipo === 'saida' ? c.valor : 0), 0);
  const totalAReceber = contasFiltradas.reduce((sum, c) => sum + (c.tipo === 'entrada' ? c.valor : 0), 0);
  const contasVencidas = contas.filter(c => c.diasAteVencimento !== null && c.diasAteVencimento < 0).length;
  const contasProximas = contas.filter(c => c.diasAteVencimento !== null && c.diasAteVencimento >= 0 && c.diasAteVencimento <= 7).length;

  return (
    <>
      <Header
        title="Contas a Pagar e Receber"
        subtitle="Gerencie seus compromissos financeiros futuros"
      />

      {/* Botão de Novo Lançamento */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          className="btn-primary"
          onClick={() => navigate('/tesouraria/adicionar')}
        >
          <FiPlus /> Novo Lançamento
        </Button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card stat-card--red">
          <div className="stat-card__icon">
            <FiTrendingDown size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Total a Pagar</h4>
            <p className="stat-card__value">{formatCurrency(totalAPagar)}</p>
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__icon">
            <FiTrendingUp size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Total a Receber</h4>
            <p className="stat-card__value">{formatCurrency(totalAReceber)}</p>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}>
          <div className="stat-card__icon">
            <FiAlertCircle size={28} style={{ color: '#991b1b' }} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title" style={{ color: '#991b1b' }}>Contas Vencidas</h4>
            <p className="stat-card__value" style={{ color: '#991b1b' }}>{contasVencidas}</p>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
          <div className="stat-card__icon">
            <FiClock size={28} style={{ color: '#92400e' }} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title" style={{ color: '#92400e' }}>Vence em 7 dias</h4>
            <p className="stat-card__value" style={{ color: '#92400e' }}>{contasProximas}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="link-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('todas')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: filter === 'todas' ? 'var(--gradient-primary)' : '#f1f5f9',
              color: filter === 'todas' ? 'white' : '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Todas ({contas.length})
          </button>
          <button
            onClick={() => setFilter('vencidas')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: filter === 'vencidas' ? '#ef4444' : '#f1f5f9',
              color: filter === 'vencidas' ? 'white' : '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Vencidas ({contasVencidas})
          </button>
          <button
            onClick={() => setFilter('proximas')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: filter === 'proximas' ? '#f59e0b' : '#f1f5f9',
              color: filter === 'proximas' ? 'white' : '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Próximas 30 dias ({contas.filter(c => c.diasAteVencimento !== null && c.diasAteVencimento >= 0 && c.diasAteVencimento <= 30).length})
          </button>
        </div>
      </div>

      {/* Tabela de Contas */}
      {loading ? (
        <p>Carregando contas...</p>
      ) : (
        <div className="link-card">
          {contasFiltradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <FiCheckCircle size={48} style={{ color: '#10b981', marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.125rem', color: '#64748b' }}>
                {filter === 'vencidas'
                  ? 'Nenhuma conta vencida!'
                  : filter === 'proximas'
                  ? 'Nenhuma conta próxima do vencimento'
                  : 'Nenhuma conta pendente'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="lancamentos-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Vencimento</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Observações</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {contasFiltradas.map((conta) => {
                    const isVencida = conta.diasAteVencimento !== null && conta.diasAteVencimento < 0;
                    const isUrgente = conta.diasAteVencimento !== null && conta.diasAteVencimento >= 0 && conta.diasAteVencimento <= 7;

                    return (
                      <tr key={conta.id} style={{
                        background: isVencida ? '#fef2f2' : isUrgente ? '#fffbeb' : 'transparent'
                      }}>
                        <td data-label="Status">
                          {isVencida ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.25rem 0.75rem',
                              background: '#fee2e2',
                              color: '#991b1b',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              <FiAlertCircle size={14} /> VENCIDA
                            </span>
                          ) : isUrgente ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.25rem 0.75rem',
                              background: '#fef3c7',
                              color: '#92400e',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              <FiClock size={14} /> URGENTE
                            </span>
                          ) : (
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              background: '#dbeafe',
                              color: '#1e40af',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              OK
                            </span>
                          )}
                        </td>
                        <td data-label="Vencimento">
                          <div>
                            <div style={{ fontWeight: 600 }}>{formatDate(conta.dataVencimento)}</div>
                            {conta.diasAteVencimento !== null && (
                              <small style={{
                                color: isVencida ? '#991b1b' : isUrgente ? '#92400e' : '#64748b',
                                fontSize: '0.75rem'
                              }}>
                                {conta.diasAteVencimento === 0
                                  ? 'HOJE'
                                  : conta.diasAteVencimento < 0
                                  ? `${Math.abs(conta.diasAteVencimento)} dias atrás`
                                  : `em ${conta.diasAteVencimento} dias`}
                              </small>
                            )}
                          </div>
                        </td>
                        <td data-label="Descrição">{conta.descricao}</td>
                        <td data-label="Categoria">{conta.categoria}</td>
                        <td data-label="Tipo">
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              background: conta.tipo === 'entrada' ? '#d1fae5' : '#fee2e2',
                              color: conta.tipo === 'entrada' ? '#065f46' : '#991b1b'
                            }}
                          >
                            {conta.tipo}
                          </span>
                        </td>
                        <td
                          data-label="Valor"
                          style={{
                            fontWeight: 600,
                            color: conta.tipo === 'entrada' ? '#10b981' : '#ef4444'
                          }}
                        >
                          {formatCurrency(conta.valor)}
                        </td>
                        <td data-label="Observações">
                          {conta.observacoes || '-'}
                        </td>
                        <td data-label="Ação">
                          <Button
                            className="btn-success btn-small"
                            onClick={() => handleMarcarComoPago(conta.id)}
                          >
                            <FiCheckCircle /> Pagar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ContasPagarPage;
