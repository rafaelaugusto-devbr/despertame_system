// src/pages/tesouraria/CampanhaDetalhesPage.jsx (Com Edição Funcional)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs, runTransaction } from 'firebase/firestore';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import NovaVendaModal from '../../components/modal/NovaCampanhaModal';
import EditarVendaModal from '../../components/modal/EditarVendaModal'; // 1. Importar o novo modal
import PasswordPromptModal from '../../components/modal/PasswordPromptModal';
import { PANELS } from '../../config-senha/panels';
import { FiPlus, FiArrowLeft, FiDollarSign, FiBox, FiTrendingUp, FiAlertCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';

const KpiCard = ({ title, value, icon, color }) => (
    <div className="summary-card" style={{ background: color, padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'white' }}>
            {icon}
            <div><h3 style={{ margin: 0, fontSize: '1rem' }}>{title}</h3><p className="amount" style={{ margin: 0, fontSize: '1.75rem' }}>{value}</p></div>
        </div>
    </div>
);

const CampanhaDetalhesPage = () => {
    const { campanhaId } = useParams();
    const [campanha, setCampanha] = useState(null);
    const [transacoes, setTransacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para os modais
    const [isVendaModalOpen, setIsVendaModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // 2. Estado para o modal de edição
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    // Estados para ações
    const [transacaoParaEditar, setTransacaoParaEditar] = useState(null); // 3. Guarda a transação a ser editada
    const [actionToConfirm, setActionToConfirm] = useState(null);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const formatDate = (timestamp) => timestamp ? timestamp.toDate().toLocaleString('pt-BR') : 'N/A';

    const fetchData = useCallback(async () => {
        // ... (fetchData continua o mesmo)
        setLoading(true);
        setError(null);
        try {
            const campanhaDoc = await getDoc(doc(db, 'vendasCampanhas', campanhaId));
            if (!campanhaDoc.exists()) throw new Error("Campanha não encontrada.");
            setCampanha({ id: campanhaDoc.id, ...campanhaDoc.data() });

            const transacoesQuery = query(collection(db, 'vendasTransacoes'), where('campanhaId', '==', campanhaId), orderBy('dataVenda', 'desc'));
            const transacoesSnapshot = await getDocs(transacoesQuery);
            setTransacoes(transacoesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error("Erro ao buscar detalhes:", err);
            setError(err.message || "Não foi possível carregar os dados.");
        } finally {
            setLoading(false);
        }
    }, [campanhaId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- LÓGICA DE EDIÇÃO ---
    const handleEditClick = (transacao) => {
        setTransacaoParaEditar(transacao); // Guarda a transação
        setIsEditModalOpen(true); // Abre o modal de edição
    };

    const handleSaveEdit = async (transacaoId, updatedData) => {
        try {
            await runTransaction(db, async (transaction) => {
                const campanhaRef = doc(db, 'vendasCampanhas', campanha.id);
                const transacaoRef = doc(db, 'vendasTransacoes', transacaoId);

                const [campanhaDoc, transacaoDoc] = await Promise.all([
                    transaction.get(campanhaRef),
                    transaction.get(transacaoRef)
                ]);

                if (!campanhaDoc.exists() || !transacaoDoc.exists()) throw "Campanha ou Transação não encontrada!";
                
                const campanhaData = campanhaDoc.data();
                const transacaoAntiga = transacaoDoc.data();
                
                // Calcula a diferença
                const diffQuantidade = updatedData.quantidade - transacaoAntiga.quantidade;
                const novoValorTotalTransacao = updatedData.quantidade * campanhaData.precoVenda;
                const diffValor = novoValorTotalTransacao - transacaoAntiga.valorTotal;

                // Aplica a diferença na campanha
                transaction.update(campanhaRef, {
                    vendidos: campanhaData.vendidos + diffQuantidade,
                    arrecadado: campanhaData.arrecadado + diffValor,
                });

                // Atualiza a transação
                transaction.update(transacaoRef, {
                    ...updatedData,
                    valorTotal: novoValorTotalTransacao,
                });
            });
            fetchData(); // Recarrega tudo
        } catch (error) {
            console.error("Erro na transação de edição:", error);
            // Re-throw para que o modal de edição possa pegar o erro e exibi-lo
            throw error;
        }
    };

    // --- LÓGICA DE EXCLUSÃO (sem alterações) ---
    const handleDeleteClick = (transacao) => {
        setActionToConfirm(() => () => performDelete(transacao));
        setIsPasswordModalOpen(true);
    };

    const performDelete = async (transacao) => {
        // ... (código de exclusão continua o mesmo)
        if (!window.confirm(`Tem certeza que deseja excluir esta venda de ${formatCurrency(transacao.valorTotal)}? Esta ação é irreversível.`)) return;
        try {
            await runTransaction(db, async (transaction) => {
                const campanhaRef = doc(db, 'vendasCampanhas', campanha.id);
                const campanhaDoc = await transaction.get(campanhaRef);
                if (!campanhaDoc.exists()) throw "Campanha não encontrada!";
                const campanhaData = campanhaDoc.data();
                const novosVendidos = campanhaData.vendidos - transacao.quantidade;
                const novoArrecadado = campanhaData.arrecadado - transacao.valorTotal;
                transaction.update(campanhaRef, { vendidos: novosVendidos, arrecadado: novoArrecadado });
                const transacaoRef = doc(db, 'vendasTransacoes', transacao.id);
                transaction.delete(transacaoRef);
            });
            fetchData();
        } catch (error) {
            console.error("Erro ao excluir transação:", error);
            alert("Falha ao excluir a transação. Tente novamente.");
        }
    };

    const handlePasswordConfirm = (password) => {
        const masterPassword = PANELS.EXCLUSAO_ARQUIVOS.password;
        if (password === masterPassword) {
            setIsPasswordModalOpen(false);
            if (actionToConfirm) actionToConfirm();
        } else {
            alert('Senha incorreta! Verifique a senha de exclusão de arquivos no painel Config.');
        }
        setActionToConfirm(null);
    };
    
     // --- RENDERIZAÇÃO ---
     if (loading) return <p>Carregando detalhes da campanha...</p>;

     if (error) {
         return (
             <div className="link-card" style={{ borderColor: '#d9534f', background: 'rgba(217, 83, 79, 0.05)' }}>
                 <h2 className="link-title" style={{ color: '#d9534f' }}><FiAlertCircle /> Erro</h2>
                 <p style={{ color: '#d9534f' }}>{error}</p>
                 <Link to="/tesouraria/vendas" className="btn btn-primary" style={{ marginTop: '1rem' }}>Voltar para Campanhas</Link>
             </div>
         );
     }
 
     const lucro = campanha.arrecadado - (campanha.custoTotal || 0);
     const estoqueRestante = campanha.estoqueInicial - campanha.vendidos;
 
     return (
         <>
             <Header title={campanha.nome} subtitle={`Detalhes e transações da campanha: ${campanha.produto}`} />
             <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Link to="/tesouraria/vendas" className="btn btn-secondary"><FiArrowLeft /> Voltar</Link>
                 <Button className="btn-primary" onClick={() => setIsVendaModalOpen(true)}><FiPlus /> Registrar Venda</Button>
             </div>
 
             <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                 <KpiCard title="Total Arrecadado" value={formatCurrency(campanha.arrecadado)} icon={<FiDollarSign size={32} />} color="var(--gradient-success)" />
                 <KpiCard title="Lucro Líquido" value={formatCurrency(lucro)} icon={<FiTrendingUp size={32} />} color="var(--gradient-primary)" />
                 <KpiCard title="Itens Vendidos" value={`${campanha.vendidos} / ${campanha.estoqueInicial}`} icon={<FiBox size={32} />} color="var(--gradient-warning)" />
                 <KpiCard title="Estoque Restante" value={estoqueRestante} icon={<FiBox size={32} />} color="var(--gradient-info)" />
             </div>
 
             <div className="link-card user-table-container" style={{ marginTop: 'var(--spacing-lg)' }}>
                 <h2 className="link-title">Histórico de Vendas</h2>
                 {transacoes.length === 0 ? (
                     <p className="empty-message">Nenhuma venda registrada para esta campanha ainda.</p>
                 ) : (
                     <table className="lancamentos-table">
                         <thead>
                             <tr><th>Data</th><th>Quantidade</th><th>Valor Total</th><th>Forma de Pagamento</th><th>Observação</th><th>Ações</th></tr>
                         </thead>
                         <tbody>
                             {transacoes.map(t => (
                                 <tr key={t.id}>
                                     <td data-label="Data">{formatDate(t.dataVenda)}</td>
                                     <td data-label="Quantidade">{t.quantidade}</td>
                                     <td data-label="Valor Total">{formatCurrency(t.valorTotal)}</td>
                                     <td data-label="Forma de Pagamento">{t.formaPagamento}</td>
                                     <td data-label="Observação">{t.observacao || '-'}</td>
                                     <td data-label="Ações">
                                         <div className="action-buttons">
                                             <button onClick={() => handleEditClick(t)} className="icon-btn edit"><FiEdit2 /></button>
                                             <button onClick={() => handleDeleteClick(t)} className="icon-btn delete"><FiTrash2 /></button>
                                         </div>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 )}
             </div>
 
             {/* Modais */}
             <NovaVendaModal isOpen={isVendaModalOpen} onClose={() => setIsVendaModalOpen(false)} onSave={fetchData} campanha={campanha} />
             <PasswordPromptModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} onConfirm={handlePasswordConfirm} />
             
             {transacaoParaEditar && (
                 <EditarVendaModal 
                     isOpen={isEditModalOpen}
                     onClose={() => setIsEditModalOpen(false)}
                     onSave={handleSaveEdit}
                     transacao={transacaoParaEditar}
                     campanha={campanha}
                 />
             )}
         </>
     );
 };
 
 export default CampanhaDetalhesPage;