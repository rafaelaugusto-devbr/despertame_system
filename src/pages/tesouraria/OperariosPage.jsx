// src/pages/tesouraria/OperariosPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import OperarioPhotoUpload from '../../components/OperarioPhotoUpload';
import { useModal } from '../../contexts/ModalContext';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiSearch,
  FiDownload,
} from 'react-icons/fi';
import {
  listarOperarios,
  criarOperario,
  atualizarOperario,
  excluirOperario,
  obterEstatisticasOperarios,
} from '../../services/operariosService';
import './Financeiro.css';

const OperariosPage = () => {
  const { showModal } = useModal();
  const [operarios, setOperarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    afastados: 0,
    porFuncao: {},
  });

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    telefone: '',
    email: '',
    endereco: '',
    funcao: '',
    dataAdmissao: '',
    status: 'Ativo',
    observacoes: '',
    fotoUrl: '',
  });

  useEffect(() => {
    fetchOperarios();
    fetchStats();
  }, [filterStatus]);

  const fetchOperarios = async () => {
    try {
      setLoading(true);
      const filters = filterStatus ? { status: filterStatus } : {};
      const data = await listarOperarios(filters);
      setOperarios(data);
    } catch (error) {
      console.error('Erro ao buscar operários:', error);
      showModal({
        title: 'Erro ao Carregar',
        message: 'Erro ao carregar operários',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await obterEstatisticasOperarios();
      setStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleOpenModal = (operario = null) => {
    if (operario) {
      setEditingId(operario.id);
      setFormData({
        nome: operario.nome || '',
        cpf: operario.cpf || '',
        rg: operario.rg || '',
        dataNascimento: operario.dataNascimento || '',
        telefone: operario.telefone || '',
        email: operario.email || '',
        endereco: operario.endereco || '',
        funcao: operario.funcao || '',
        dataAdmissao: operario.dataAdmissao || '',
        status: operario.status || 'Ativo',
        observacoes: operario.observacoes || '',
        fotoUrl: operario.fotoUrl || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        nome: '',
        cpf: '',
        rg: '',
        dataNascimento: '',
        telefone: '',
        email: '',
        endereco: '',
        funcao: '',
        dataAdmissao: '',
        salario: '',
        status: 'Ativo',
        observacoes: '',
        fotoUrl: '',
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
    if (!formData.nome.trim()) {
      showModal({
        title: 'Campo Obrigatório',
        message: 'Nome é obrigatório',
        type: 'danger'
      });
      return;
    }

    try {
      const dataToSave = {
        ...formData,
      };

      if (editingId) {
        await atualizarOperario(editingId, dataToSave);
      } else {
        await criarOperario(dataToSave);
      }

      handleCloseModal();
      await fetchOperarios();
      await fetchStats();
    } catch (error) {
      console.error('Erro ao salvar operário:', error);
      showModal({
        title: 'Erro ao Salvar',
        message: 'Erro ao salvar operário',
        type: 'danger'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este operário?')) return;

    try {
      await excluirOperario(id);
      await fetchOperarios();
      await fetchStats();
    } catch (error) {
      console.error('Erro ao excluir operário:', error);
      showModal({
        title: 'Erro ao Excluir',
        message: 'Erro ao excluir operário',
        type: 'danger'
      });
    }
  };

  const handleExport = () => {
    if (operarios.length === 0) {
      showModal({
        title: 'Lista Vazia',
        message: 'Nenhum operário para exportar',
        type: 'info'
      });
      return;
    }

    const headers = ['Nome', 'CPF', 'RG', 'Telefone', 'E-mail', 'Função', 'Data Admissão', 'Status'];
    const csvHeaders = headers.join(',');

    const csvRows = operarios.map(op => {
      return [
        `"${op.nome}"`,
        `"${op.cpf || ''}"`,
        `"${op.rg || ''}"`,
        `"${op.telefone || ''}"`,
        `"${op.email || ''}"`,
        `"${op.funcao || ''}"`,
        `"${op.dataAdmissao || ''}"`,
        `"${op.status || ''}"`,
      ].join(',');
    });

    const csv = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `operarios_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  // Filtra operários por termo de busca
  const filteredOperarios = operarios.filter(op =>
    op.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (op.funcao && op.funcao.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (op.cpf && op.cpf.includes(searchTerm))
  );

  return (
    <>
      <Header
        title="Gestão de Operários"
        subtitle="Cadastro e gerenciamento de colaboradores"
      />

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card stat-card--blue">
          <div className="stat-card__icon">
            <FiUsers size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Total de Operários</h4>
            <p className="stat-card__value">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__icon">
            <FiUserCheck size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Ativos</h4>
            <p className="stat-card__value">{stats.ativos}</p>
          </div>
        </div>

        <div className="stat-card stat-card--red">
          <div className="stat-card__icon">
            <FiUserX size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Inativos</h4>
            <p className="stat-card__value">{stats.inativos}</p>
          </div>
        </div>

        <div className="stat-card stat-card--orange">
          <div className="stat-card__icon">
            <FiUserX size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Afastados</h4>
            <p className="stat-card__value">{stats.afastados}</p>
          </div>
        </div>
      </div>

      {/* Filtros e Ações */}
      <div className="link-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Lista de Operários</h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button className="btn-success" onClick={handleExport} disabled={operarios.length === 0}>
                <FiDownload /> Exportar CSV
              </Button>
              <Button className="btn-primary" onClick={() => handleOpenModal()}>
                <FiPlus /> Novo Operário
              </Button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <input
                type="text"
                className="input-field"
                placeholder="Buscar por nome, CPF ou função..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <select
                className="input-field"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Todos os Status</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Afastado">Afastado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Operários */}
      {loading ? (
        <p>Carregando operários...</p>
      ) : (
        <div className="link-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="lancamentos-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>Função</th>
                  <th>Data Admissão</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredOperarios.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                      {searchTerm || filterStatus
                        ? 'Nenhum operário encontrado com os filtros aplicados.'
                        : 'Nenhum operário cadastrado ainda.'}
                    </td>
                  </tr>
                ) : (
                  filteredOperarios.map((operario) => (
                    <tr key={operario.id}>
                      <td data-label="Foto">
                        {operario.fotoUrl ? (
                          <img
                            src={operario.fotoUrl}
                            alt={operario.nome}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '2px solid #e2e8f0',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '8px',
                              backgroundColor: '#f1f5f9',
                              border: '2px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#94a3b8',
                            }}
                          >
                            <FiUsers size={20} />
                          </div>
                        )}
                      </td>
                      <td data-label="Nome">{operario.nome}</td>
                      <td data-label="CPF">{operario.cpf || '-'}</td>
                      <td data-label="Telefone">{operario.telefone || '-'}</td>
                      <td data-label="Função">{operario.funcao || '-'}</td>
                      <td data-label="Data Admissão">{formatDate(operario.dataAdmissao)}</td>
                      <td data-label="Status">
                        <span
                          className={`badge badge--${
                            operario.status === 'Ativo' ? 'success' : operario.status === 'Inativo' ? 'danger' : 'warning'
                          }`}
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            backgroundColor:
                              operario.status === 'Ativo' ? '#d1fae5' : operario.status === 'Inativo' ? '#fee2e2' : '#fef3c7',
                            color: operario.status === 'Ativo' ? '#065f46' : operario.status === 'Inativo' ? '#991b1b' : '#92400e',
                          }}
                        >
                          {operario.status}
                        </span>
                      </td>
                      <td data-label="Ações">
                        <div className="action-buttons">
                          <button onClick={() => handleOpenModal(operario)} className="icon-btn edit" title="Editar">
                            <FiEdit2 />
                          </button>
                          <button onClick={() => handleDelete(operario.id)} className="icon-btn delete" title="Excluir">
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
          <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Editar Operário' : 'Novo Operário'}</h3>
              <button type="button" onClick={handleCloseModal} className="modal-close-btn">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {/* Upload de Foto */}
                  <OperarioPhotoUpload
                    currentPhotoUrl={formData.fotoUrl}
                    onPhotoChange={(url) => setFormData({ ...formData, fotoUrl: url })}
                    operarioId={editingId}
                  />

                  {/* Dados Pessoais */}
                  <div>
                    <h4 style={{ marginBottom: '1rem', color: '#1e293b', fontSize: '1rem', fontWeight: 600 }}>
                      Dados Pessoais
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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

                      <div>
                        <label htmlFor="cpf">CPF</label>
                        <input
                          id="cpf"
                          type="text"
                          className="input-field"
                          placeholder="000.000.000-00"
                          value={formData.cpf}
                          onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="rg">RG</label>
                        <input
                          id="rg"
                          type="text"
                          className="input-field"
                          value={formData.rg}
                          onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="dataNascimento">Data de Nascimento</label>
                        <input
                          id="dataNascimento"
                          type="date"
                          className="input-field"
                          value={formData.dataNascimento}
                          onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contato */}
                  <div>
                    <h4 style={{ marginBottom: '1rem', color: '#1e293b', fontSize: '1rem', fontWeight: 600 }}>Contato</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
                        <label htmlFor="email">E-mail</label>
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

                    <div style={{ marginTop: '1rem' }}>
                      <label htmlFor="endereco">Endereço Completo</label>
                      <input
                        id="endereco"
                        type="text"
                        className="input-field"
                        value={formData.endereco}
                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Dados Profissionais */}
                  <div>
                    <h4 style={{ marginBottom: '1rem', color: '#1e293b', fontSize: '1rem', fontWeight: 600 }}>
                      Dados Profissionais
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label htmlFor="funcao">Função</label>
                        <input
                          id="funcao"
                          type="text"
                          className="input-field"
                          placeholder="Ex: Pedreiro, Carpinteiro..."
                          value={formData.funcao}
                          onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="dataAdmissao">Data de Admissão</label>
                        <input
                          id="dataAdmissao"
                          type="date"
                          className="input-field"
                          value={formData.dataAdmissao}
                          onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="status">Status</label>
                        <select
                          id="status"
                          className="input-field"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="Ativo">Ativo</option>
                          <option value="Inativo">Inativo</option>
                          <option value="Afastado">Afastado</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <label htmlFor="observacoes">Observações</label>
                    <textarea
                      id="observacoes"
                      className="input-field"
                      rows={3}
                      placeholder="Informações adicionais sobre o operário"
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
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Operário'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default OperariosPage;
