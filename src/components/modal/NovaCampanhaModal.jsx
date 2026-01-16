// src/components/NovaVendaModal.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import Button from '../ui/Button';
import { FiSave, FiXCircle } from 'react-icons/fi';

const NovaVendaModal = ({ isOpen, onClose, onSave, campanha }) => {
    const [formData, setFormData] = useState({
        quantidade: 1,
        formaPagamento: 'PIX',
        observacao: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Reseta o formulário quando o modal é aberto
        if (isOpen) {
            setFormData({ quantidade: 1, formaPagamento: 'PIX', observacao: '' });
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const quantidadeNum = Number(formData.quantidade);
        if (quantidadeNum <= 0) {
            setError("A quantidade deve ser maior que zero.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const campanhaRef = doc(db, 'vendasCampanhas', campanha.id);
            
            // Usamos uma transação para garantir que os dados da campanha sejam atualizados atomicamente
            await runTransaction(db, async (transaction) => {
                const campanhaDoc = await transaction.get(campanhaRef);
                if (!campanhaDoc.exists()) {
                    throw "Campanha não encontrada!";
                }

                const campanhaData = campanhaDoc.data();
                const novosVendidos = campanhaData.vendidos + quantidadeNum;
                const novoArrecadado = campanhaData.arrecadado + (quantidadeNum * campanhaData.precoVenda);

                // 1. Atualiza os totais na campanha
                transaction.update(campanhaRef, {
                    vendidos: novosVendidos,
                    arrecadado: novoArrecadado,
                });

                // 2. Cria o registro da nova transação
                const transacaoRef = collection(db, 'vendasTransacoes');
                transaction.set(doc(transacaoRef), {
                    campanhaId: campanha.id,
                    quantidade: quantidadeNum,
                    valorUnitario: campanhaData.precoVenda,
                    valorTotal: quantidadeNum * campanhaData.precoVenda,
                    formaPagamento: formData.formaPagamento,
                    observacao: formData.observacao,
                    dataVenda: serverTimestamp(),
                });
            });

            onSave(); // Recarrega os dados na página de detalhes
            onClose(); // Fecha o modal

        } catch (err) {
            console.error("Erro ao registrar venda:", err);
            setError("Falha ao registrar a venda. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const valorTotal = (formData.quantidade * campanha.precoVenda).toFixed(2);

    return (
        <div className="modal-overlay">
            <form onSubmit={handleSubmit} className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3>Registrar Venda - {campanha.nome}</h3>
                    <button type="button" onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label htmlFor="quantidade">Quantidade</label>
                            <input id="quantidade" name="quantidade" type="number" min="1" className="input-field" value={formData.quantidade} onChange={handleChange} required />
                        </div>
                        <div>
                            <label htmlFor="formaPagamento">Forma de Pagamento</label>
                            <select id="formaPagamento" name="formaPagamento" className="input-field" value={formData.formaPagamento} onChange={handleChange}>
                                <option>PIX</option>
                                <option>Dinheiro</option>
                                <option>Cartão de Débito</option>
                                <option>Cartão de Crédito</option>
                                <option>Outro</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="observacao">Observação (Opcional)</label>
                        <input id="observacao" name="observacao" type="text" className="input-field" placeholder="Ex: Vendido para Maria" value={formData.observacao} onChange={handleChange} />
                    </div>
                    <div className="link-card" style={{ textAlign: 'center', background: 'var(--color-background-light)', padding: '1rem' }}>
                        <h4 style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Valor Total da Venda</h4>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                            R$ {valorTotal.replace('.', ',')}
                        </p>
                    </div>
                </div>
                {error && <p id="erro" style={{ textAlign: 'center', margin: '1rem 0 -0.5rem 0' }}>{error}</p>}
                <div className="modal-footer">
                    <Button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
                        <FiXCircle /> Cancelar
                    </Button>
                    <Button type="submit" className="btn-primary" loading={loading} loadingText="Salvando...">
                        <FiSave /> Registrar Venda
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default NovaVendaModal;
