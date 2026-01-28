// src/components/LeadsManager.js

import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useModal } from '../../../contexts/ModalContext';
import './LeadsManager.css';

// A função de exportação agora é uma prop, para ser chamada pelo botão na página pai
const LeadsManager = ({ onDataLoaded }) => {
    const { showModal } = useModal();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const leadsCollectionRef = collection(db, 'leads');
                const q = query(leadsCollectionRef, orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                
                const leadsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setLeads(leadsData);
                onDataLoaded(leadsData); // Passa os dados carregados para o componente pai
            } catch (error) {
                console.error("Erro ao carregar leads:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, [onDataLoaded]);

    const formatDate = (timestamp) => {
        if (!timestamp?.toDate) return 'Data inválida';
        return timestamp.toDate().toLocaleString('pt-BR');
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => showModal({
                title: 'Sucesso',
                message: `"${text}" copiado para a área de transferência!`,
                type: 'info'
            }))
            .catch(() => showModal({
                title: 'Erro',
                message: 'Falha ao copiar.',
                type: 'danger'
            }));
    };

    if (loading) {
        return <p>Carregando leads...</p>;
    }

    return (
        <>
            {/* O card de resumo e o botão de exportar foram movidos para a página LeadsPage.js */}
            <div className="link-card user-table-container">
                <h2 className="link-title">Lista de Pessoas Interessadas</h2>
                <table className="leads-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>E-mail</th>
                            <th>WhatsApp</th>
                            <th>Data de Cadastro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.length > 0 ? (
                            leads.map(lead => (
                                <tr key={lead.id}>
                                    <td data-label="Nome">{lead.nome}</td>
                                    <td data-label="E-mail" className="copyable" onClick={() => handleCopy(lead.email)}>
                                        {lead.email}
                                    </td>
                                    <td data-label="WhatsApp" className="copyable" onClick={() => handleCopy(lead.telefone)}>
                                        {lead.telefone}
                                    </td>
                                    <td data-label="Data">{formatDate(lead.createdAt)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center' }}>Nenhum lead cadastrado ainda.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default LeadsManager;
