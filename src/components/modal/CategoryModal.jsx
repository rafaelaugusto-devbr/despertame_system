// src/components/CategoryModal.js

import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { FiSave, FiXCircle } from 'react-icons/fi';

const CategoryModal = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#3788d8'); // Cor padrão

    useEffect(() => {
        // Reseta os campos quando o modal abre
        if (isOpen) {
            setName('');
            setColor('#3788d8');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (name.trim()) {
            onSave(name, color);
        } else {
            alert('O nome da categoria não pode ser vazio.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Nova Categoria</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    {/* Campo para o nome da categoria */}
                    <label htmlFor="categoryName">Nome da Categoria</label>
                    <input
                        id="categoryName"
                        type="text"
                        className="input-field"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Reunião da Equipe"
                        autoFocus
                    />
                    
                    {/* Seletor de Cores Visual */}
                    <label htmlFor="categoryColor" style={{ marginTop: 'var(--spacing-md)' }}>Cor da Categoria</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <input
                            id="categoryColor"
                            type="color"
                            className="input-field"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            style={{ padding: '0.25rem', height: '48px', flexShrink: 0 }}
                        />
                        <input
                            type="text"
                            className="input-field"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            style={{ flexGrow: 1 }}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <Button onClick={handleSave} className="btn-primary">
                        <FiSave /> Salvar Categoria
                    </Button>
                    <Button onClick={onClose} className="btn-secondary">
                        <FiXCircle /> Cancelar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;
