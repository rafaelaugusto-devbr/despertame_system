// src/components/FluxoCaixaForm.js

import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../services/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import Button from '../../../components/ui/Button';

const FluxoCaixaForm = () => {
    const [categorias, setCategorias] = useState([]);
    const tiposFixos = [{ id: 'entrada', name: 'Entrada' }, { id: 'saida', name: 'Saída' }];
    const [formData, setFormData] = useState({
        nome: '', valor: '', categoriaId: '', tipo: 'entrada', data: new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchCategorias = async () => {
            const catQuery = query(collection(db, 'fluxoCaixaCategorias'), orderBy('name'));
            const catSnapshot = await getDocs(catQuery);
            const catList = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategorias(catList);
            if (catList.length > 0) {
                setFormData(prev => ({ ...prev, categoriaId: catList[0].id }));
            }
        };
        fetchCategorias();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage({ type: '', text: '' });

        try {
            const user = auth.currentUser;
            await addDoc(collection(db, 'fluxoCaixaLancamentos'), {
                ...formData,
                valor: parseFloat(formData.valor),
                data: new Date(formData.data),
                createdAt: serverTimestamp(),
                // --- CAPTURA DE DADOS DO USUÁRIO ---
                createdBy: {
                    email: user.email,
                    telefone: user.phoneNumber, // Captura o telefone
                    uid: user.uid
                }
            });

            setStatusMessage({ type: 'success', text: 'Lançamento adicionado com sucesso!' });
            setFormData({
                nome: '', valor: '', categoriaId: categorias.length > 0 ? categorias[0].id : '', tipo: 'entrada', data: new Date().toISOString().split('T')[0],
            });
        } catch (error) {
            console.error('Erro ao adicionar lançamento:', error);
            setStatusMessage({ type: 'error', text: 'Falha ao adicionar lançamento.' });
        } finally {
            setLoading(false);
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 5000);
        }
    };

    return (
        <div className="link-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <form onSubmit={handleSubmit} className="fluxo-caixa-form">
                <input type="text" name="nome" className="input-field" placeholder="Nome do Lançamento" value={formData.nome} onChange={handleChange} required />
                <input type="number" name="valor" className="input-field" placeholder="Valor em R$" value={formData.valor} onChange={handleChange} required step="0.01" />
                <select name="categoriaId" className="input-field" value={formData.categoriaId} onChange={handleChange} required>
                    <option value="" disabled>Selecione uma categoria</option>
                    {categorias.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
                <select name="tipo" className="input-field" value={formData.tipo} onChange={handleChange} required>
                    {tiposFixos.map(tipo => (<option key={tipo.id} value={tipo.id}>{tipo.name}</option>))}
                </select>
                <input type="date" name="data" className="input-field" value={formData.data} onChange={handleChange} required />
                <Button type="submit" className="btn-primary" loading={loading} loadingText="Enviando...">
                    Adicionar Lançamento
                </Button>
                {statusMessage.text && (<p className={`status-message ${statusMessage.type}`}>{statusMessage.text}</p>)}
            </form>
        </div>
    );
};

export default FluxoCaixaForm;
