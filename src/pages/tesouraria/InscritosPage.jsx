// src/pages/tesouraria/InscritosPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import {
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiCalendar,
  FiList,
} from 'react-icons/fi';
import {
  syncEvents,
  getRegistry,
  getInscritosData,
  exportToCSV,
  healthCheck,
} from '../../services/googleSheetsApi';
import InscritoDetalhesModal from './components/InscritoDetalhesModal';
import './Financeiro.css';

const InscritosPage = () => {
  // Estado dos eventos
  const [registry, setRegistry] = useState([]);
  const [loadingRegistry, setLoadingRegistry] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Filtros
  const [selectedEvento, setSelectedEvento] = useState('');
  const [selectedAno, setSelectedAno] = useState('');
  const [availableAnos, setAvailableAnos] = useState([]);

  // Dados
  const [inscritos, setInscritos] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Paginação e busca
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);

  // Modal
  const [selectedInscrito, setSelectedInscrito] = useState(null);

  // Carrega registro inicial
  useEffect(() => {
    loadRegistry();
    checkApiHealth();
  }, []);

  // Atualiza anos disponíveis quando evento muda
  useEffect(() => {
    if (selectedEvento) {
      const evento = registry.find(r => r.evento === selectedEvento);
      if (evento) {
        setAvailableAnos(evento.anos);
        if (evento.anos.length > 0 && !selectedAno) {
          setSelectedAno(evento.anos[0]);
        }
      }
    } else {
      setAvailableAnos([]);
      setSelectedAno('');
    }
  }, [selectedEvento, registry]);

  // Carrega dados quando filtros mudam
  useEffect(() => {
    if (selectedEvento && selectedAno) {
      loadInscritos();
    } else {
      setInscritos([]);
      setHeaders([]);
      setTotal(0);
    }
  }, [selectedEvento, selectedAno, offset, searchQuery]);

  const checkApiHealth = async () => {
    try {
      const result = await healthCheck();
      if (!result.success) {
        console.error('API não está saudável');
      }
    } catch (error) {
      console.error('Erro ao verificar API:', error);
    }
  };

  const loadRegistry = async () => {
    try {
      setLoadingRegistry(true);
      const result = await getRegistry();
      if (result.success && result.data) {
        setRegistry(result.data.items || []);
        // Auto-seleciona primeiro evento se houver
        if (result.data.items && result.data.items.length > 0) {
          setSelectedEvento(result.data.items[0].evento);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar registro:', error);
      alert('Erro ao carregar lista de eventos');
    } finally {
      setLoadingRegistry(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncEvents();
      if (result.success) {
        alert(`Sincronização ${result.status}!\nProcessados: ${result.processed}\nAdicionados: ${result.added}\nIgnorados: ${result.skipped}`);
        await loadRegistry();
      } else {
        alert('Erro na sincronização: ' + (result.message || 'Desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      alert('Erro ao sincronizar eventos');
    } finally {
      setSyncing(false);
    }
  };

  const loadInscritos = async () => {
    if (!selectedEvento || !selectedAno) return;

    try {
      setLoading(true);
      const result = await getInscritosData({
        evento: selectedEvento,
        ano: selectedAno,
        offset,
        limit,
        q: searchQuery,
      });

      if (result.success && result.data) {
        setInscritos(result.data.items || []);
        setHeaders(result.data.headers || []);
        setTotal(result.data.total || 0);
      } else {
        alert('Erro ao carregar dados: ' + (result.message || 'Desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao carregar inscritos:', error);
      alert('Erro ao carregar inscritos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setOffset(0); // Reset para primeira página
    loadInscritos();
  };

  const handleExport = () => {
    if (inscritos.length === 0) {
      alert('Nenhum dado para exportar');
      return;
    }

    const filename = `inscritos_${selectedEvento}_${selectedAno}_${new Date().toISOString().slice(0, 10)}.csv`;
    exportToCSV(inscritos, headers, filename);
  };

  const handleViewDetails = (inscrito) => {
    setSelectedInscrito(inscrito);
  };

  const handleCloseModal = () => {
    setSelectedInscrito(null);
  };

  const handleUpdate = () => {
    // Recarrega dados após atualização
    loadInscritos();
    setSelectedInscrito(null);
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  const handleNextPage = () => {
    if (offset + limit < total) {
      setOffset(offset + limit);
    }
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  // Calcula estatísticas
  const stats = {
    total: inscritos.length,
    statusCounts: {},
  };

  // Conta status (se houver coluna Status)
  if (headers.includes('Status')) {
    inscritos.forEach(i => {
      const status = i['Status'] || 'Sem Status';
      stats.statusCounts[status] = (stats.statusCounts[status] || 0) + 1;
    });
  }

  return (
    <>
      <Header
        title="Gestão de Inscritos do Retiro"
        subtitle="Integração completa com Google Sheets e Google Forms"
      />

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card stat-card--blue">
          <div className="stat-card__icon">
            <FiList size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Eventos Cadastrados</h4>
            <p className="stat-card__value">{registry.length}</p>
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__icon">
            <FiUsers size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Total de Inscritos</h4>
            <p className="stat-card__value">{total}</p>
          </div>
        </div>

        <div className="stat-card stat-card--orange">
          <div className="stat-card__icon">
            <FiCalendar size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Evento Selecionado</h4>
            <p className="stat-card__value" style={{ fontSize: '1.25rem' }}>
              {selectedEvento || '-'}
            </p>
          </div>
        </div>

        <div className="stat-card stat-card--purple">
          <div className="stat-card__icon">
            <FiCalendar size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Ano Selecionado</h4>
            <p className="stat-card__value">{selectedAno || '-'}</p>
          </div>
        </div>
      </div>

      {/* Filtros e Ações */}
      <div className="link-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Linha 1: Sincronizar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Filtros e Controles</h3>
            <Button
              className="btn-primary"
              onClick={handleSync}
              disabled={syncing}
            >
              <FiRefreshCw className={syncing ? 'spinning' : ''} />
              {syncing ? 'Sincronizando...' : 'Sincronizar Eventos'}
            </Button>
          </div>

          {/* Linha 2: Selects de Evento e Ano */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label htmlFor="evento" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Selecionar Evento
              </label>
              <select
                id="evento"
                className="input-field"
                value={selectedEvento}
                onChange={(e) => setSelectedEvento(e.target.value)}
                disabled={loadingRegistry}
              >
                <option value="">Selecione um evento...</option>
                {registry.map(r => (
                  <option key={r.evento} value={r.evento}>
                    {r.evento}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ano" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Selecionar Ano
              </label>
              <select
                id="ano"
                className="input-field"
                value={selectedAno}
                onChange={(e) => setSelectedAno(e.target.value)}
                disabled={!selectedEvento || availableAnos.length === 0}
              >
                <option value="">Selecione um ano...</option>
                {availableAnos.map(ano => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linha 3: Busca e Exportar */}
          {selectedEvento && selectedAno && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Buscar por qualquer campo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button type="submit" className="btn-secondary">
                  <FiSearch /> Buscar
                </Button>
              </form>

              <Button
                className="btn-success"
                onClick={handleExport}
                disabled={inscritos.length === 0}
              >
                <FiDownload /> Exportar CSV
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabela de Inscritos */}
      {selectedEvento && selectedAno && (
        <div className="link-card">
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>
              Lista de Inscritos {searchQuery && `(filtrado por: "${searchQuery}")`}
            </h3>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Mostrando {Math.min(offset + 1, total)}-{Math.min(offset + limit, total)} de {total} inscritos
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <FiRefreshCw className="spinning" size={32} style={{ color: '#3b82f6' }} />
              <p style={{ marginTop: '1rem', color: '#64748b' }}>Carregando inscritos...</p>
            </div>
          ) : inscritos.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <FiUsers size={48} style={{ color: '#cbd5e1' }} />
              <p style={{ marginTop: '1rem', color: '#64748b' }}>
                {searchQuery ? 'Nenhum inscrito encontrado com esse filtro.' : 'Nenhum inscrito neste evento/ano.'}
              </p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="lancamentos-table">
                  <thead>
                    <tr>
                      {headers.filter(h => !['rowIndex', 'evento', 'ano'].includes(h)).map(header => (
                        <th key={header}>{header}</th>
                      ))}
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inscritos.map((inscrito, idx) => (
                      <tr key={idx}>
                        {headers.filter(h => !['rowIndex', 'evento', 'ano'].includes(h)).map(header => (
                          <td key={header} data-label={header}>
                            {inscrito[header] || '-'}
                          </td>
                        ))}
                        <td data-label="Ações">
                          <Button
                            className="btn-secondary btn-small"
                            onClick={() => handleViewDetails(inscrito)}
                          >
                            <FiEye /> Ver Detalhes
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                  <Button
                    className="btn-secondary"
                    onClick={handlePrevPage}
                    disabled={offset === 0}
                  >
                    <FiChevronLeft /> Anterior
                  </Button>

                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    Página {currentPage} de {totalPages}
                  </span>

                  <Button
                    className="btn-secondary"
                    onClick={handleNextPage}
                    disabled={offset + limit >= total}
                  >
                    Próxima <FiChevronRight />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Instruções iniciais */}
      {!selectedEvento && !loadingRegistry && (
        <div className="link-card" style={{ background: '#F0F9FF', border: '2px solid #3b82f6' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#1e3a8a', fontSize: '1.125rem', fontWeight: 700 }}>
            📋 Como Usar o Sistema de Inscritos
          </h3>
          <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e40af', fontSize: '0.9375rem', lineHeight: '1.8' }}>
            <li><strong>Sincronize</strong>: Clique em "Sincronizar Eventos" para buscar planilhas do Google Drive</li>
            <li><strong>Selecione</strong>: Escolha um evento e ano nos dropdowns acima</li>
            <li><strong>Visualize</strong>: Veja todos os inscritos em formato de tabela dinâmica</li>
            <li><strong>Edite</strong>: Clique em "Ver Detalhes" para atualizar Status, Observação, Check-in, etc.</li>
            <li><strong>Exporte</strong>: Baixe os dados em CSV para análise offline</li>
          </ol>
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedInscrito && (
        <InscritoDetalhesModal
          inscrito={selectedInscrito}
          evento={selectedEvento}
          ano={selectedAno}
          headers={headers}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
        />
      )}

      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .btn-small {
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }

        .stat-card--purple {
          color: var(--color-purple);
        }
      `}</style>
    </>
  );
};

export default InscritosPage;
