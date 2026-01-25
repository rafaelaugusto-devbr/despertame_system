import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiUsers, FiAward, FiGrid, FiCheckCircle } from 'react-icons/fi';
import './Financeiro.css';

const RifasPage = () => {
  const [rifas, setRifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVendaModalOpen, setIsVendaModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedRifa, setSelectedRifa] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    precoNumero: '',
    quantidadeNumeros: '',
    dataSorteio: '',
    status: 'ativa',
  });
  const [vendaData, setVendaData] = useState({
    comprador: '',
    telefone: '',
    numeros: '',
    valorPago: '',
    formaPagamento: 'pix',
  });

  useEffect(() => {
    fetchRifas();
  }, []);

  const fetchRifas = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'rifas'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = await Promise.all(
        querySnapshot.docs.map(async (rifaDoc) => {
          const rifaData = { id: rifaDoc.id, ...rifaDoc.data() };

          // Buscar vendas desta rifa
          const vendasSnapshot = await getDocs(collection(db, 'rifas', rifaDoc.id, 'vendas'));
          const vendas = vendasSnapshot.docs.map(v => ({ id: v.id, ...v.data() }));

          // Calcular números vendidos
          const numerosVendidos = vendas.flatMap(v =>
            v.numeros.split(',').map(n => parseInt(n.trim()))
          );

          const totalArrecadado = vendas.reduce((sum, v) => sum + (Number(v.valorPago) || 0), 0);

          return {
            ...rifaData,
            vendas,
            numerosVendidos,
            totalArrecadado,
          };
        })
      );
      setRifas(data);
    } catch (error) {
      console.error('Erro ao buscar rifas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (rifa = null) => {
    if (rifa) {
      setEditingId(rifa.id);
      setFormData({
        nome: rifa.nome,
        descricao: rifa.descricao || '',
        precoNumero: rifa.precoNumero,
        quantidadeNumeros: rifa.quantidadeNumeros,
        dataSorteio: rifa.dataSorteio,
        status: rifa.status || 'ativa',
      });
    } else {
      setEditingId(null);
      setFormData({
        nome: '',
        descricao: '',
        precoNumero: '',
        quantidadeNumeros: '',
        dataSorteio: '',
        status: 'ativa',
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenVendaModal = (rifa) => {
    setSelectedRifa(rifa);
    setVendaData({
      comprador: '',
      telefone: '',
      numeros: '',
      valorPago: rifa.precoNumero,
      formaPagamento: 'pix',
    });
    setIsVendaModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsVendaModalOpen(false);
    setEditingId(null);
    setSelectedRifa(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.precoNumero || !formData.quantidadeNumeros) return;

    try {
      const dataToSave = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        precoNumero: Number(formData.precoNumero),
        quantidadeNumeros: Number(formData.quantidadeNumeros),
        dataSorteio: formData.dataSorteio,
        status: formData.status,
      };

      if (editingId) {
        await updateDoc(doc(db, 'rifas', editingId), dataToSave);
      } else {
        await addDoc(collection(db, 'rifas'), {
          ...dataToSave,
          createdAt: serverTimestamp(),
        });
      }

      handleCloseModal();
      await fetchRifas();
    } catch (error) {
      console.error('Erro ao salvar rifa:', error);
      alert('Erro ao salvar rifa');
    }
  };

  const handleVendaSubmit = async (e) => {
    e.preventDefault();
    if (!vendaData.comprador.trim() || !vendaData.numeros.trim()) return;

    try {
      // Validar números
      const numerosArray = vendaData.numeros.split(',').map(n => parseInt(n.trim()));
      const numerosInvalidos = numerosArray.filter(
        n => isNaN(n) || n < 1 || n > selectedRifa.quantidadeNumeros
      );

      if (numerosInvalidos.length > 0) {
        alert('Números inválidos! Verifique se todos estão entre 1 e ' + selectedRifa.quantidadeNumeros);
        return;
      }

      // Verificar se números já foram vendidos
      const numerosJaVendidos = numerosArray.filter(n =>
        selectedRifa.numerosVendidos.includes(n)
      );

      if (numerosJaVendidos.length > 0) {
        alert('Os seguintes números já foram vendidos: ' + numerosJaVendidos.join(', '));
        return;
      }

      const dataToSave = {
        comprador: vendaData.comprador.trim(),
        telefone: vendaData.telefone.trim(),
        numeros: vendaData.numeros.trim(),
        valorPago: Number(vendaData.valorPago),
        formaPagamento: vendaData.formaPagamento,
        dataVenda: serverTimestamp(),
      };

      await addDoc(collection(db, 'rifas', selectedRifa.id, 'vendas'), dataToSave);

      handleCloseModal();
      await fetchRifas();
      alert('Venda registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      alert('Erro ao registrar venda');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta rifa? Todas as vendas associadas serão perdidas!')) return;

    try {
      await deleteDoc(doc(db, 'rifas', id));
      await fetchRifas();
    } catch (error) {
      console.error('Erro ao excluir rifa:', error);
      alert('Erro ao excluir rifa');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const totalRifasAtivas = rifas.filter(r => r.status === 'ativa').length;
  const totalArrecadadoGeral = rifas.reduce((sum, r) => sum + (r.totalArrecadado || 0), 0);

  return (
    <>
      <Header
        title="Gestão de Rifas"
        subtitle="Gerencie rifas e vendas de números"
      />

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div className="stat-card stat-card--blue">
          <div className="stat-card__icon">
            <FiGrid size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Rifas Ativas</h4>
            <p className="stat-card__value">{totalRifasAtivas}</p>
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__icon">
            <FiDollarSign size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Total Arrecadado</h4>
            <p className="stat-card__value">{formatCurrency(totalArrecadadoGeral)}</p>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2 className="link-title">Rifas Cadastradas</h2>
        <Button className="btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus /> Nova Rifa
        </Button>
      </div>

      {loading ? (
        <p>Carregando rifas...</p>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {rifas.length === 0 ? (
            <div className="link-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#64748b' }}>Nenhuma rifa cadastrada ainda.</p>
            </div>
          ) : (
            rifas.map((rifa) => {
              const numerosVendidosCount = rifa.numerosVendidos.length;
              const numerosDisponiveisCount = rifa.quantidadeNumeros - numerosVendidosCount;
              const percentualVendido = ((numerosVendidosCount / rifa.quantidadeNumeros) * 100).toFixed(1);

              return (
                <div key={rifa.id} className="link-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#1e293b' }}>
                        {rifa.nome}
                        <span
                          style={{
                            marginLeft: '0.75rem',
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: '12px',
                            background: rifa.status === 'ativa' ? '#d1fae5' : '#e5e7eb',
                            color: rifa.status === 'ativa' ? '#065f46' : '#374151',
                          }}
                        >
                          {rifa.status === 'ativa' ? 'Ativa' : 'Encerrada'}
                        </span>
                      </h3>
                      {rifa.descricao && (
                        <p style={{ margin: '0 0 0.5rem', color: '#64748b', fontSize: '0.9375rem' }}>
                          {rifa.descricao}
                        </p>
                      )}
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                        Sorteio: {formatDate(rifa.dataSorteio)}
                      </p>
                    </div>
                    <div className="action-buttons">
                      {rifa.status === 'ativa' && (
                        <Button
                          className="btn-success"
                          onClick={() => handleOpenVendaModal(rifa)}
                          style={{ marginRight: '0.5rem' }}
                        >
                          <FiPlus /> Vender Números
                        </Button>
                      )}
                      <button onClick={() => handleOpenModal(rifa)} className="icon-btn edit" title="Editar">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDelete(rifa.id)} className="icon-btn delete" title="Excluir">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Preço do Número</p>
                      <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#1e293b' }}>
                        {formatCurrency(rifa.precoNumero)}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Números Vendidos</p>
                      <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#10b981' }}>
                        {numerosVendidosCount} / {rifa.quantidadeNumeros}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Números Disponíveis</p>
                      <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#3b82f6' }}>
                        {numerosDisponiveisCount}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Total Arrecadado</p>
                      <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#10b981' }}>
                        {formatCurrency(rifa.totalArrecadado)}
                      </p>
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Progresso de Vendas</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{percentualVendido}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percentualVendido}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #10b981, #059669)',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Lista de vendas */}
                  {rifa.vendas && rifa.vendas.length > 0 && (
                    <details style={{ marginTop: '1rem' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#1e293b', fontSize: '0.9375rem' }}>
                        Ver Vendas ({rifa.vendas.length})
                      </summary>
                      <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                        <table className="lancamentos-table">
                          <thead>
                            <tr>
                              <th>Comprador</th>
                              <th>Telefone</th>
                              <th>Números</th>
                              <th>Valor Pago</th>
                              <th>Forma Pagamento</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rifa.vendas.map((venda) => (
                              <tr key={venda.id}>
                                <td data-label="Comprador">{venda.comprador}</td>
                                <td data-label="Telefone">{venda.telefone || '-'}</td>
                                <td data-label="Números">{venda.numeros}</td>
                                <td data-label="Valor Pago">{formatCurrency(venda.valorPago)}</td>
                                <td data-label="Forma Pagamento">{venda.formaPagamento.toUpperCase()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal de Criação/Edição de Rifa */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? 'Editar Rifa' : 'Nova Rifa'}</h3>
              <button type="button" onClick={handleCloseModal} className="modal-close-btn">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label htmlFor="nome">Nome da Rifa *</label>
                    <input
                      id="nome"
                      type="text"
                      className="input-field"
                      placeholder="Ex: Rifa do Retiro 2025"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="descricao">Descrição</label>
                    <textarea
                      id="descricao"
                      className="input-field"
                      rows={2}
                      placeholder="Descrição opcional da rifa"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label htmlFor="precoNumero">Preço por Número (R$) *</label>
                      <input
                        id="precoNumero"
                        type="number"
                        step="0.01"
                        min="0"
                        className="input-field"
                        placeholder="10.00"
                        value={formData.precoNumero}
                        onChange={(e) => setFormData({ ...formData, precoNumero: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="quantidadeNumeros">Quantidade de Números *</label>
                      <input
                        id="quantidadeNumeros"
                        type="number"
                        min="1"
                        className="input-field"
                        placeholder="100"
                        value={formData.quantidadeNumeros}
                        onChange={(e) => setFormData({ ...formData, quantidadeNumeros: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label htmlFor="dataSorteio">Data do Sorteio</label>
                      <input
                        id="dataSorteio"
                        type="date"
                        className="input-field"
                        value={formData.dataSorteio}
                        onChange={(e) => setFormData({ ...formData, dataSorteio: e.target.value })}
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
                        <option value="ativa">Ativa</option>
                        <option value="encerrada">Encerrada</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <Button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary">
                  {editingId ? 'Salvar Alterações' : 'Criar Rifa'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Venda de Números */}
      {isVendaModalOpen && selectedRifa && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Vender Números - {selectedRifa.nome}</h3>
              <button type="button" onClick={handleCloseModal} className="modal-close-btn">
                &times;
              </button>
            </div>

            <form onSubmit={handleVendaSubmit}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem', padding: '1rem', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px' }}>
                  <p style={{ margin: 0, color: '#075985', fontSize: '0.875rem' }}>
                    <strong>Números disponíveis:</strong> {selectedRifa.quantidadeNumeros - selectedRifa.numerosVendidos.length} de {selectedRifa.quantidadeNumeros}
                  </p>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label htmlFor="comprador">Nome do Comprador *</label>
                    <input
                      id="comprador"
                      type="text"
                      className="input-field"
                      placeholder="Nome completo"
                      value={vendaData.comprador}
                      onChange={(e) => setVendaData({ ...vendaData, comprador: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="telefone">Telefone</label>
                    <input
                      id="telefone"
                      type="tel"
                      className="input-field"
                      placeholder="(00) 00000-0000"
                      value={vendaData.telefone}
                      onChange={(e) => setVendaData({ ...vendaData, telefone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="numeros">Números (separados por vírgula) *</label>
                    <input
                      id="numeros"
                      type="text"
                      className="input-field"
                      placeholder="Ex: 1, 15, 23, 45"
                      value={vendaData.numeros}
                      onChange={(e) => {
                        setVendaData({ ...vendaData, numeros: e.target.value });
                        // Atualizar valor automaticamente
                        const count = e.target.value.split(',').filter(n => n.trim()).length;
                        setVendaData(prev => ({ ...prev, valorPago: count * selectedRifa.precoNumero }));
                      }}
                      required
                    />
                    <small style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      Digite os números separados por vírgula
                    </small>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label htmlFor="valorPago">Valor Pago (R$) *</label>
                      <input
                        id="valorPago"
                        type="number"
                        step="0.01"
                        min="0"
                        className="input-field"
                        value={vendaData.valorPago}
                        onChange={(e) => setVendaData({ ...vendaData, valorPago: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="formaPagamento">Forma de Pagamento</label>
                      <select
                        id="formaPagamento"
                        className="input-field"
                        value={vendaData.formaPagamento}
                        onChange={(e) => setVendaData({ ...vendaData, formaPagamento: e.target.value })}
                      >
                        <option value="pix">PIX</option>
                        <option value="dinheiro">Dinheiro</option>
                        <option value="cartao">Cartão</option>
                        <option value="transferencia">Transferência</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <Button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary">
                  <FiCheckCircle /> Registrar Venda
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RifasPage;
