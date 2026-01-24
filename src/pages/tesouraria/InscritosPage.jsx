import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiCheckCircle, FiXCircle, FiDollarSign, FiRefreshCw, FiSettings, FiDownload } from 'react-icons/fi';
import '../financeiro/Financeiro.css';

const InscritosPage = () => {
  const [inscritos, setInscritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    pago: false,
    valorPago: '',
    observacoes: '',
  });
  const [sheetConfig, setSheetConfig] = useState({
    spreadsheetId: '',
    range: 'Respostas!A2:F',
    ano: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchInscritos();
    loadSheetConfig();
  }, []);

  const loadSheetConfig = async () => {
    try {
      const configRef = doc(db, 'configuracoes', 'googleSheets');
      const configSnap = await getDocs(collection(db, 'configuracoes'));
      const config = configSnap.docs.find(d => d.id === 'googleSheets');
      if (config) {
        setSheetConfig(config.data());
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const saveSheetConfig = async () => {
    try {
      const configRef = doc(db, 'configuracoes', 'googleSheets');
      await setDoc(configRef, sheetConfig, { merge: true });
      alert('Configuração salva com sucesso!');
      setIsConfigOpen(false);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao salvar configuração');
    }
  };

  const syncWithGoogleSheets = async () => {
    if (!sheetConfig.spreadsheetId) {
      alert('Configure o ID da planilha primeiro!');
      setIsConfigOpen(true);
      return;
    }

    setSyncing(true);
    try {
      // IMPORTANTE: Para usar a API do Google Sheets, você precisa:
      // 1. Criar um projeto no Google Cloud Console
      // 2. Ativar a Google Sheets API
      // 3. Criar credenciais (API Key ou Service Account)
      // 4. Tornar a planilha pública OU usar Service Account

      const API_KEY = 'SUA_API_KEY_AQUI'; // Substitua pela sua API Key
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetConfig.spreadsheetId}/values/${sheetConfig.range}?key=${API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.values) {
        // Mapear dados da planilha para o formato do sistema
        // Assumindo colunas: Nome | Telefone | Email | Pago | Valor Pago | Observações
        const inscritosFromSheet = data.values.map((row, index) => ({
          nome: row[0] || '',
          telefone: row[1] || '',
          email: row[2] || '',
          pago: row[3]?.toLowerCase() === 'sim' || row[3]?.toLowerCase() === 'pago',
          valorPago: parseFloat(row[4]) || 0,
          observacoes: row[5] || '',
          fromSheet: true,
          sheetRow: index + 2, // +2 porque linha 1 é header e API começa do 0
        }));

        // Salvar no Firestore
        for (const inscrito of inscritosFromSheet) {
          await addDoc(collection(db, 'retiroInscritos'), {
            ...inscrito,
            createdAt: serverTimestamp(),
            syncedAt: serverTimestamp(),
          });
        }

        await fetchInscritos();
        alert(`${inscritosFromSheet.length} inscritos sincronizados com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      alert('Erro ao sincronizar com Google Sheets. Verifique a configuração e permissões da planilha.');
    } finally {
      setSyncing(false);
    }
  };

  const exportToGoogleSheets = async () => {
    alert('Esta funcionalidade requer autenticação OAuth2 do Google. Configure um Service Account para habilitar a escrita na planilha.');
    // Para implementar a escrita, você precisará:
    // 1. Service Account no Google Cloud
    // 2. Compartilhar a planilha com o email do Service Account
    // 3. Usar biblioteca google-auth-library no backend
  };

  const fetchInscritos = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'retiroInscritos'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInscritos(data);
    } catch (error) {
      console.error('Erro ao buscar inscritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (inscrito = null) => {
    if (inscrito) {
      setEditingId(inscrito.id);
      setFormData({
        nome: inscrito.nome,
        telefone: inscrito.telefone || '',
        email: inscrito.email || '',
        pago: inscrito.pago || false,
        valorPago: inscrito.valorPago || '',
        observacoes: inscrito.observacoes || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        pago: false,
        valorPago: '',
        observacoes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    try {
      const dataToSave = {
        nome: formData.nome.trim(),
        telefone: formData.telefone.trim(),
        email: formData.email.trim(),
        pago: formData.pago,
        valorPago: formData.valorPago ? Number(formData.valorPago) : 0,
        observacoes: formData.observacoes.trim(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'retiroInscritos', editingId), dataToSave);
      } else {
        await addDoc(collection(db, 'retiroInscritos'), {
          ...dataToSave,
          createdAt: serverTimestamp(),
        });
      }

      handleCloseModal();
      await fetchInscritos();
    } catch (error) {
      console.error('Erro ao salvar inscrito:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este inscrito?')) return;

    try {
      await deleteDoc(doc(db, 'retiroInscritos', id));
      await fetchInscritos();
    } catch (error) {
      console.error('Erro ao excluir inscrito:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const totalInscritos = inscritos.length;
  const totalPagos = inscritos.filter(i => i.pago).length;
  const totalPendentes = totalInscritos - totalPagos;
  const totalArrecadado = inscritos.reduce((sum, i) => sum + (Number(i.valorPago) || 0), 0);

  return (
    <>
      <Header
        title="Gestão de Inscritos do Retiro"
        subtitle="Gerencie os inscritos e sincronize com Google Sheets"
      />

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card stat-card--blue">
          <div className="stat-card__icon">
            <FiUsers size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Total de Inscritos</h4>
            <p className="stat-card__value">{totalInscritos}</p>
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__icon">
            <FiCheckCircle size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Pagamentos Confirmados</h4>
            <p className="stat-card__value">{totalPagos}</p>
          </div>
        </div>

        <div className="stat-card stat-card--red">
          <div className="stat-card__icon">
            <FiXCircle size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Pagamentos Pendentes</h4>
            <p className="stat-card__value">{totalPendentes}</p>
          </div>
        </div>

        <div className="stat-card stat-card--orange">
          <div className="stat-card__icon">
            <FiDollarSign size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Total Arrecadado</h4>
            <p className="stat-card__value">{formatCurrency(totalArrecadado)}</p>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2 className="link-title">Lista de Inscritos</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button
            className="btn-secondary"
            onClick={() => setIsConfigOpen(true)}
          >
            <FiSettings /> Configurar Planilha
          </Button>
          <Button
            className="btn-secondary"
            onClick={syncWithGoogleSheets}
            disabled={syncing}
          >
            <FiRefreshCw className={syncing ? 'spinning' : ''} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Sheets'}
          </Button>
          <Button className="btn-primary" onClick={() => handleOpenModal()}>
            <FiPlus /> Novo Inscrito
          </Button>
        </div>
      </div>

      {/* Instrução para Google Sheets */}
      {!sheetConfig.spreadsheetId && (
        <div className="link-card" style={{ marginBottom: '1.5rem', background: '#FFF9F0', border: '2px solid #FFD700' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b', fontSize: '1rem', fontWeight: 700 }}>
            📊 Configure a integração com Google Sheets
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9375rem' }}>
            Clique em "Configurar Planilha" para conectar sua planilha do Google Forms e sincronizar automaticamente os inscritos.
          </p>
        </div>
      )}

      {loading ? (
        <p>Carregando inscritos...</p>
      ) : (
        <div className="link-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="lancamentos-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Email</th>
                  <th>Status Pagamento</th>
                  <th>Valor Pago</th>
                  <th>Observações</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {inscritos.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      Nenhum inscrito cadastrado ainda.
                    </td>
                  </tr>
                ) : (
                  inscritos.map((inscrito) => (
                    <tr key={inscrito.id}>
                      <td data-label="Nome">
                        {inscrito.nome}
                        {inscrito.fromSheet && (
                          <span style={{
                            marginLeft: '0.5rem',
                            padding: '0.125rem 0.5rem',
                            background: '#d1fae5',
                            color: '#065f46',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            Sheets
                          </span>
                        )}
                      </td>
                      <td data-label="Telefone">{inscrito.telefone || '-'}</td>
                      <td data-label="Email">{inscrito.email || '-'}</td>
                      <td data-label="Status Pagamento">
                        <span
                          className={`badge badge--${inscrito.pago ? 'success' : 'warning'}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            backgroundColor: inscrito.pago ? '#d1fae5' : '#fef3c7',
                            color: inscrito.pago ? '#065f46' : '#92400e',
                          }}
                        >
                          {inscrito.pago ? <FiCheckCircle size={14} /> : <FiXCircle size={14} />}
                          {inscrito.pago ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td data-label="Valor Pago">{formatCurrency(inscrito.valorPago)}</td>
                      <td data-label="Observações" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inscrito.observacoes || '-'}
                      </td>
                      <td data-label="Ações">
                        <div className="action-buttons">
                          <button
                            onClick={() => handleOpenModal(inscrito)}
                            className="icon-btn edit"
                            title="Editar"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(inscrito.id)}
                            className="icon-btn delete"
                            title="Excluir"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? 'Editar Inscrito' : 'Novo Inscrito'}</h3>
              <button type="button" onClick={handleCloseModal} className="modal-close-btn">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  <div>
                    <label htmlFor="nome">Nome Completo *</label>
                    <input
                      id="nome"
                      type="text"
                      className="input-field"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label htmlFor="telefone">Telefone</label>
                      <input
                        id="telefone"
                        type="tel"
                        className="input-field"
                        placeholder="(00) 00000-0000"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        type="email"
                        className="input-field"
                        placeholder="exemplo@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label htmlFor="valorPago">Valor Pago (R$)</label>
                      <input
                        id="valorPago"
                        type="number"
                        step="0.01"
                        min="0"
                        className="input-field"
                        placeholder="0.00"
                        value={formData.valorPago}
                        onChange={(e) => setFormData({ ...formData, valorPago: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor="pago">Status do Pagamento</label>
                      <select
                        id="pago"
                        className="input-field"
                        value={formData.pago}
                        onChange={(e) => setFormData({ ...formData, pago: e.target.value === 'true' })}
                      >
                        <option value="false">Pendente</option>
                        <option value="true">Pago</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="observacoes">Observações</label>
                    <textarea
                      id="observacoes"
                      className="input-field"
                      rows={3}
                      placeholder="Informações adicionais sobre o inscrito"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <Button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary">
                  {editingId ? 'Salvar Alterações' : 'Adicionar Inscrito'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Configuração Google Sheets */}
      {isConfigOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>Configurar Google Sheets</h3>
              <button type="button" onClick={() => setIsConfigOpen(false)} className="modal-close-btn">
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#0369A1', fontSize: '0.9375rem', fontWeight: 600 }}>
                  📋 Como configurar:
                </h4>
                <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#075985', fontSize: '0.875rem', lineHeight: '1.6' }}>
                  <li>Abra sua planilha do Google Sheets</li>
                  <li>Copie o ID da planilha da URL (parte entre /d/ e /edit)</li>
                  <li>Exemplo: docs.google.com/spreadsheets/d/<strong>ABC123XYZ</strong>/edit</li>
                  <li>Cole o ID no campo abaixo</li>
                  <li>Certifique-se que a planilha está compartilhada com "Qualquer pessoa com o link"</li>
                </ol>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label htmlFor="spreadsheetId">ID da Planilha *</label>
                  <input
                    id="spreadsheetId"
                    type="text"
                    className="input-field"
                    placeholder="Exemplo: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    value={sheetConfig.spreadsheetId}
                    onChange={(e) => setSheetConfig({ ...sheetConfig, spreadsheetId: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="range">Intervalo de Células</label>
                  <input
                    id="range"
                    type="text"
                    className="input-field"
                    placeholder="Exemplo: Respostas!A2:F"
                    value={sheetConfig.range}
                    onChange={(e) => setSheetConfig({ ...sheetConfig, range: e.target.value })}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    Nome da aba e intervalo (A2:F ignora o cabeçalho)
                  </small>
                </div>

                <div>
                  <label htmlFor="ano">Ano do Retiro</label>
                  <input
                    id="ano"
                    type="number"
                    className="input-field"
                    placeholder="2025"
                    value={sheetConfig.ano}
                    onChange={(e) => setSheetConfig({ ...sheetConfig, ano: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#FEF3C7', border: '1px solid #FDE047', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#854D0E', fontSize: '0.875rem', lineHeight: '1.6' }}>
                  <strong>⚠️ Importante:</strong> Para usar esta funcionalidade, você precisa de uma API Key do Google.
                  Substitua 'SUA_API_KEY_AQUI' no código pela sua chave real.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <Button type="button" className="btn-secondary" onClick={() => setIsConfigOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" className="btn-primary" onClick={saveSheetConfig}>
                Salvar Configuração
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default InscritosPage;
