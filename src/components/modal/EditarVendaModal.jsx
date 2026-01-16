// src/components/EditarVendaModal.jsx

import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { FiSave, FiXCircle } from 'react-icons/fi';

const EditarVendaModal = ({ isOpen, onClose, onSave, transacao, campanha }) => {
    const [formData, setFormData] = useState({
        quantidade: 1,
        formaPagamento: 'PIX',
        observacao: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Preenche o formulário com os dados da transação quando o modal abre
    useEffect(() => {
        if (transacao) {
            setFormData({
                quantidade: transacao.quantidade,
                formaPagamento: transacao.formaPagamento,
                observacao: transacao.observacao || '',
            });
        }
    }, [transacao, isOpen]);

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
            // A lógica de salvamento será passada pela prop onSave
            await onSave(transacao.id, formData);
            onClose(); // Fecha o modal em caso de sucesso
        } catch (err) {
            console.error("Erro ao salvar edição:", err);
            setError("Falha ao salvar as alterações. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const valorTotal = (formData.quantidade * campanha.precoVenda).toFixed(2);

    return (
        <div className="modal-overlay">
            <form onSubmit={handleSubmit} className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3>Editar Venda - {campanha.nome}</h3>
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
                        <h4 style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Novo Valor Total da Venda</h4>
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
                        <FiSave /> Salvar Alterações
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditarVendaModal;
