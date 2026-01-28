// src/components/CategoriasManager.js (Versão Final Corrigida)

import React, { useState, useEffect, useCallback } from 'react'; // 1. Importe useCallback
import { db } from '../../../services/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, getCountFromServer } from 'firebase/firestore';
import Button from '../../../components/ui/Button';
import { FiEdit2, FiTrash2, FiPlus, FiCheck, FiX } from 'react-icons/fi';
import { useModal } from '../../../contexts/ModalContext';

const CategoriasManager = () => {
    const { showModal } = useModal();
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [newItemName, setNewItemName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const categoriasCollectionRef = collection(db, 'fluxoCaixaCategorias');
    const lancamentosCollectionRef = collection(db, 'fluxoCaixaLancamentos');

    // 2. Estabilize a função fetchData com useCallback para evitar loops
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(categoriasCollectionRef, orderBy('name'));
            const data = await getDocs(q);
            setCategorias(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
        } finally {
            setLoading(false);
        }
    }, []); // O array de dependências vazio é intencional

    // 3. O useEffect agora depende de `fetchData` de forma segura
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddItem = async () => {
        if (!newItemName.trim()) return;
        const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        await addDoc(categoriasCollectionRef, { name: newItemName, color });
        setNewItemName('');
        setIsAdding(false);
        fetchData(); // Recarrega os dados
    };

    const handleEditItem = async (id) => {
        if (!editingItem || !editingItem.name.trim()) return;
        const itemDoc = doc(db, 'fluxoCaixaCategorias', id);
        await updateDoc(itemDoc, { name: editingItem.name });
        setEditingItem(null);
        fetchData(); // Recarrega os dados
    };

    const handleDeleteItem = async (id) => {
        const q = query(lancamentosCollectionRef, where("categoriaId", "==", id));
        const snapshot = await getCountFromServer(q);

        if (snapshot.data().count > 0) {
            showModal({
                title: 'Categoria em Uso',
                message: 'Não é possível excluir esta categoria, pois ela está sendo usada em um ou mais lançamentos.',
                type: 'danger'
            });
            return;
        }

        if (window.confirm(`Tem certeza que deseja excluir esta categoria?`)) {
            const itemDoc = doc(db, 'fluxoCaixaCategorias', id);
            await deleteDoc(itemDoc);
            fetchData(); // Recarrega os dados
        }
    };

    // O resto do JSX permanece o mesmo
    return (
        <div className="link-card">
            <div className="section-header">
                <h2 className="link-title">Gerenciar Categorias</h2>
                <Button onClick={() => setIsAdding(true)} className="btn-primary btn-small" disabled={isAdding || loading}>
                    <FiPlus /> Nova Categoria
                </Button>
            </div>
            {isAdding && (
                <div className="add-form">
                    <input type="text" className="input-field" placeholder="Nome da nova categoria" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} autoFocus />
                    <div className="action-buttons">
                        <button onClick={handleAddItem} className="icon-btn success" disabled={loading}><FiCheck /></button>
                        <button onClick={() => { setIsAdding(false); setNewItemName(''); }} className="icon-btn cancel"><FiX /></button>
                    </div>
                </div>
            )}
            <div className="options-list">
                {loading ? <p>Carregando...</p> : categorias.length === 0 ? (
                    <p className="empty-message">Nenhuma categoria cadastrada.</p>
                ) : (
                    categorias.map(item => (
                        <div key={item.id} className="option-item">
                            {editingItem?.id === item.id ? (
                                <>
                                    <input type="text" className="input-field inline-edit" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} autoFocus />
                                    <div className="action-buttons">
                                        <button onClick={() => handleEditItem(item.id)} className="icon-btn success" disabled={loading}><FiCheck /></button>
                                        <button onClick={() => setEditingItem(null)} className="icon-btn cancel"><FiX /></button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span className="option-name">
                                        <span className="color-indicator" style={{ backgroundColor: item.color || '#ccc' }}></span>
                                        {item.name}
                                    </span>
                                    <div className="action-buttons">
                                        <button onClick={() => setEditingItem({ id: item.id, name: item.name })} className="icon-btn edit" disabled={loading}><FiEdit2 /></button>
                                        <button onClick={() => handleDeleteItem(item.id)} className="icon-btn delete" disabled={loading}><FiTrash2 /></button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CategoriasManager;
