// src/components/LancamentoModal.js
import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

const LancamentoModal = ({ isOpen, onClose, onSave, lancamento, categorias }) => {
    const [formData, setFormData] = useState({ nome: '', valor: '', categoriaId: '' });

    useEffect(() => {
        if (lancamento) {
            setFormData({
                nome: lancamento.nome,
                valor: lancamento.valor,
                categoriaId: lancamento.categoriaId,
            });
        }
    }, [lancamento]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        // Validação simples
        if (!formData.nome.trim() || !formData.valor || !formData.categoriaId) {
            alert('Todos os campos são obrigatórios.');
            return;
        }
        onSave(lancamento.id, {
            ...formData,
            valor: parseFloat(formData.valor)
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Editar Lançamento</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <label>Nome</label>
                    <input type="text" name="nome" className="input-field" value={formData.nome} onChange={handleChange} />
                    <label style={{marginTop: '1rem'}}>Valor</label>
                    <input type="number" name="valor" className="input-field" value={formData.valor} onChange={handleChange} step="0.01" />
                    <label style={{marginTop: '1rem'}}>Categoria</label>
                    <select name="categoriaId" className="input-field" value={formData.categoriaId} onChange={handleChange}>
                        {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
                <div className="modal-footer">
                    <Button onClick={handleSave} className="btn-primary">Salvar Alterações</Button>
                </div>
            </div>
        </div>
    );
};

export default LancamentoModal;
