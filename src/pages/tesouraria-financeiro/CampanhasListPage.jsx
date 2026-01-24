// src/pages/financeiro/CampanhasListPage.jsx (Versão Final Completa)

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import NovaCampanhaModal from '../../components/modal/NovaCampanhaModal';
import { FiPlus, FiBox, FiAlertCircle } from 'react-icons/fi';

// Componente para o card de cada campanha
const CampanhaCard = ({ campanha }) => {
    const progresso = campanha.estoqueInicial > 0 ? (campanha.vendidos / campanha.estoqueInicial) * 100 : 0;
    const lucro = campanha.arrecadado - (campanha.custoTotal || 0);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <Link to={`/financeiro/vendas/${campanha.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="link-card hover-effect">
                <h3 className="link-title" style={{ border: 'none', padding: 0, marginBottom: '0.5rem' }}>{campanha.nome}</h3>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '-0.5rem', marginBottom: '1rem' }}>Produto: {campanha.produto}</p>
                
                <div style={{ margin: '1rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                        <span>Progresso</span>
                        <span>{campanha.vendidos} / {campanha.estoqueInicial} vendidos</span>
                    </div>
                    <div style={{ background: 'var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ width: `${progresso}%`, background: 'var(--gradient-primary)', height: '8px', borderRadius: '8px' }}></div>
                    </div>
                </div>

                <div className="summary-cards" style={{ gap: '0.5rem', gridTemplateColumns: '1fr 1fr' }}>
                    <div className="summary-card" style={{ background: 'var(--gradient-success)', padding: '1rem' }}>
                        <h3>Arrecadado</h3>
                        <p className="amount" style={{ fontSize: '1.5rem' }}>{formatCurrency(campanha.arrecadado)}</p>
                    </div>
                    <div className="summary-card" style={{ background: 'var(--gradient-primary)', padding: '1rem' }}>
                        <h3>Lucro</h3>
                        <p className="amount" style={{ fontSize: '1.5rem' }}>{formatCurrency(lucro)}</p>
                    </div>
                </div>
                
                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    Ver Detalhes e Registrar Vendas →
                </div>
            </div>
        </Link>
    );
};


const CampanhasListPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [campanhas, setCampanhas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCampanhas = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const q = query(collection(db, 'vendasCampanhas'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const campanhasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCampanhas(campanhasData);
        } catch (err) {
            console.error("Erro ao buscar campanhas:", err);
            setError("Não foi possível carregar as campanhas. Verifique as permissões do Firestore.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCampanhas();
    }, [fetchCampanhas]);

    return (
        <>
            <Header 
                title="Campanhas de Vendas"
                subtitle="Crie e acompanhe o desempenho de suas campanhas de arrecadação."
            />

            <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'flex-end' }}>
                <Button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <FiPlus /> Nova Campanha
                </Button>
            </div>

            {loading && <p>Carregando campanhas...</p>}

            {error && (
                <div className="link-card" style={{ borderColor: '#d9534f', background: 'rgba(217, 83, 79, 0.05)' }}>
                    <h2 className="link-title" style={{ color: '#d9534f' }}><FiAlertCircle /> Erro</h2>
                    <p style={{ color: '#d9534f' }}>{error}</p>
                </div>
            )}

            {!loading && !error && (
                <div className="links-grid">
                    {campanhas.length > 0 ? (
                        campanhas.map(campanha => <CampanhaCard key={campanha.id} campanha={campanha} />)
                    ) : (
                        <div className="link-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                            <FiBox size={40} style={{ color: 'var(--color-text-secondary)', margin: '0 auto 1rem' }} />
                            <h3 style={{ color: 'var(--color-text-primary)' }}>Nenhuma campanha encontrada</h3>
                            <p style={{ color: 'var(--color-text-secondary)' }}>Clique em "Nova Campanha" para começar.</p>
                        </div>
                    )}
                </div>
            )}

            <NovaCampanhaModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchCampanhas}
            />
        </>
    );
};

export default CampanhasListPage;
