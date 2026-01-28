// src/components/EventModal.js

import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { FiSave, FiXCircle, FiTrash2 } from 'react-icons/fi';
import { useModal } from '../../contexts/ModalContext';

// Recebe a lista de categorias como uma nova propriedade
const EventModal = ({ eventInfo, categories, onClose, onSave, onDelete }) => {
    const { showModal } = useModal();
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState(''); // <-- Estado para a categoria selecionada

    useEffect(() => {
        if (eventInfo?.event) {
            setTitle(eventInfo.event.title);
            // Pega o categoryId das propriedades extendidas do evento
            setCategoryId(eventInfo.event.extendedProps.categoryId || '');
        } else {
            setTitle('');
            // Define uma categoria padrão ou a primeira da lista
            setCategoryId(categories.length > 0 ? categories[0].id : '');
        }
    }, [eventInfo, categories]);

    if (!eventInfo) return null;

    const handleSave = () => {
        if (title.trim()) {
            onSave(title, categoryId); // <-- Envia o categoryId ao salvar
        } else {
            showModal({
                title: 'Campo Obrigatório',
                message: 'O nome do evento não pode ser vazio.',
                type: 'info'
            });
        }
    };

    const handleDelete = () => {
        showModal({
            title: 'Confirmar Exclusão',
            message: `Tem certeza que deseja excluir o evento "${eventInfo.event.title}"?`,
            type: 'danger',
            onConfirm: () => {
                onDelete();
            }
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{eventInfo.isEditing ? 'Editar Evento' : 'Novo Evento'}</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    {/* Campo para o nome do evento */}
                    <label htmlFor="eventTitle">Nome do Evento</label>
                    <input
                        id="eventTitle"
                        type="text"
                        className="input-field"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                    />
                    
                    {/* NOVO CAMPO: Seletor de Categoria */}
                    <label htmlFor="eventCategory" style={{marginTop: 'var(--spacing-md)'}}>Categoria</label>
                    <select
                        id="eventCategory"
                        className="input-field"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                    >
                        <option value="">Sem Categoria</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    {eventInfo.isEditing && (
                        <p className="modal-date-info">
                            Data: {eventInfo.event.start.toLocaleDateString('pt-BR')}
                        </p>
                    )}
                </div>
                <div className="modal-footer">
                    <Button onClick={handleSave} className="btn-primary">
                        <FiSave /> Salvar
                    </Button>
                    {eventInfo.isEditing && (
                        <Button onClick={handleDelete} className="btn-danger">
                            <FiTrash2 /> Excluir
                        </Button>
                    )}
                    <Button onClick={onClose} className="btn-secondary">
                        <FiXCircle /> Cancelar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
