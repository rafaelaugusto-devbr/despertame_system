import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiCheckCircle, FiXCircle, FiDollarSign } from 'react-icons/fi';
import '../financeiro/Financeiro.css';

const InscritosPage = () => {
  const [inscritos, setInscritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    pago: false,
    valorPago: '',
    observacoes: '',
  });

  useEffect(() => {
    fetchInscritos();
  }, []);

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
        subtitle="Gerencie os inscritos e pagamentos do retiro"
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
        <Button className="btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus /> Novo Inscrito
        </Button>
      </div>

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
                      <td data-label="Nome">{inscrito.nome}</td>
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

      {/* Modal */}
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
    </>
  );
};

export default InscritosPage;
