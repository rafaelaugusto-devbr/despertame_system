// src/components/ListaFluxoManager.js (Versão Final Completa)

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../../services/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import LancamentoModal from '../../../components/modal/LancamentoModal';
import PasswordPromptModal from '../../../components/modal/PasswordPromptModal';
import { PANELS } from '../../../config-senha/panels';
import { FiEdit2, FiTrash2, FiAlertCircle, FiDownload } from 'react-icons/fi';
import Button from '../../../components/ui/Button';
import * as XLSX from 'xlsx';
import './ListaFluxoManager.css';

const ListaFluxoManager = () => {
    const [lancamentos, setLancamentos] = useState([]);
    const [categorias, setCategorias] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentLancamento, setCurrentLancamento] = useState(null);
    const [actionToConfirm, setActionToConfirm] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const catSnapshot = await getDocs(collection(db, 'fluxoCaixaCategorias'));
            const catMap = {};
            catSnapshot.forEach(doc => catMap[doc.id] = doc.data());
            setCategorias(catMap);

            const q = query(collection(db, 'fluxoCaixaLancamentos'), orderBy('data', 'desc'));
            const lancamentosSnapshot = await getDocs(q);
            setLancamentos(lancamentosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error("Erro ao buscar dados:", err);
            setError("Não foi possível carregar os dados. Verifique as permissões do Firestore.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEditClick = (lancamento) => {
        setCurrentLancamento(lancamento);
        setActionToConfirm(() => () => setIsEditModalOpen(true));
        setIsPasswordModalOpen(true);
    };

    const handleDeleteClick = (lancamentoId) => {
        setActionToConfirm(() => () => performDelete(lancamentoId));
        setIsPasswordModalOpen(true);
    };

    const performDelete = async (lancamentoId) => {
        if (window.confirm('Tem certeza que deseja excluir este lançamento permanentemente?')) {
            await deleteDoc(doc(db, 'fluxoCaixaLancamentos', lancamentoId));
            fetchData();
        }
    };

    const handleSaveEdit = async (lancamentoId, updatedData) => {
        const lancamentoDoc = doc(db, 'fluxoCaixaLancamentos', lancamentoId);
        await updateDoc(lancamentoDoc, updatedData);
        setIsEditModalOpen(false);
        fetchData();
    };

    const handlePasswordConfirm = (password) => {
        const masterPassword = PANELS.EXCLUSAO_ARQUIVOS.password;
        if (password === masterPassword) {
            setIsPasswordModalOpen(false);
            if (actionToConfirm) {
                actionToConfirm();
            }
        } else {
            alert('Senha incorreta! Verifique a senha de exclusão de arquivos no painel Config.');
        }
        setActionToConfirm(null);
    };

    const handleExport = () => {
        if (lancamentos.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }
        const dataToExport = lancamentos.map(l => ({
            'Nome': l.nome,
            'Valor': l.valor,
            'Tipo': l.tipo,
            'Categoria': categorias[l.categoriaId]?.name || 'N/A',
            'Data': l.data.toDate().toLocaleDateString('pt-BR'),
            'Lançado Por': l.createdBy?.email || l.createdBy?.telefone || 'N/A',
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Lancamentos');
        XLSX.writeFile(wb, 'relatorio_financeiro.xlsx');
    };

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const formatDate = (timestamp) => timestamp ? timestamp.toDate().toLocaleDateString('pt-BR') : 'N/A';

    const totalEntradas = lancamentos.reduce((acc, l) => l.tipo === 'entrada' ? acc + l.valor : acc, 0);
    const totalSaidas = lancamentos.reduce((acc, l) => l.tipo === 'saida' ? acc + l.valor : acc, 0);
    const saldoFinal = totalEntradas - totalSaidas;

    if (error) {
        return (
            <div className="link-card" style={{ borderColor: '#d9534f', background: 'rgba(217, 83, 79, 0.05)' }}>
                <h2 className="link-title" style={{ color: '#d9534f' }}><FiAlertCircle /> Erro ao Carregar</h2>
                <p style={{ color: '#d9534f' }}>{error}</p>
                <button onClick={fetchData} className="btn btn-primary" style={{ marginTop: '1rem' }}>Tentar Novamente</button>
            </div>
        );
    }

    if (loading) {
        return <p>Carregando lançamentos...</p>;
    }

    return (
        <>
            <div className="summary-cards">
                <div className="summary-card card-entrada"><h3>Total de Entradas</h3><p className="amount">{formatCurrency(totalEntradas)}</p></div>
                <div className="summary-card card-saida"><h3>Total de Saídas</h3><p className="amount">{formatCurrency(totalSaidas)}</p></div>
                <div className="summary-card card-saldo"><h3>Saldo Final</h3><p className="amount">{formatCurrency(saldoFinal)}</p></div>
            </div>
            
            <div className="link-card user-table-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                    <h2 className="link-title" style={{ border: 'none', padding: 0 }}>Todos os Lançamentos</h2>
                    <Button onClick={handleExport} className="btn-primary btn-small" disabled={lancamentos.length === 0}>
                        <FiDownload /> Exportar para Excel
                    </Button>
                </div>

                {lancamentos.length === 0 ? (
                    <p className="empty-message">Nenhum lançamento encontrado.</p>
                ) : (
                    <table className="lancamentos-table">
                        <thead>
                            <tr><th>Nome</th><th>Valor</th><th>Categoria</th><th>Tipo</th><th>Data</th><th>Usuário</th><th>Ações</th></tr>
                        </thead>
                        <tbody>
                            {lancamentos.map(l => (
                                <tr key={l.id}>
                                    <td data-label="Nome">{l.nome}</td>
                                    <td data-label="Valor" className={l.tipo === 'entrada' ? 'valor-entrada' : 'valor-saida'}>{l.tipo === 'saida' && '- '}{formatCurrency(l.valor)}</td>
                                    <td data-label="Categoria">{categorias[l.categoriaId]?.name || 'N/A'}</td>
                                    <td data-label="Tipo">{l.tipo === 'entrada' ? 'Entrada' : 'Saída'}</td>
                                    <td data-label="Data">{formatDate(l.data)}</td>
                                    <td data-label="Usuário">{l.createdBy?.telefone || l.createdBy?.email || 'N/A'}</td>
                                    <td data-label="Ações">
                                        <div className="action-buttons">
                                            <button onClick={() => handleEditClick(l)} className="icon-btn edit"><FiEdit2 /></button>
                                            <button onClick={() => handleDeleteClick(l.id)} className="icon-btn delete"><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            <LancamentoModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveEdit} lancamento={currentLancamento} categorias={Object.values(categorias)} />
            <PasswordPromptModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} onConfirm={handlePasswordConfirm} />
        </>
    );
};

export default ListaFluxoManager;
