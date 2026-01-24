// src/components/DashboardResumo.js

import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCalendar, FiFileText, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';

const DashboardResumo = () => {
    const [stats, setStats] = useState({
        entradas: 0,
        saidas: 0,
        saldo: 0,
    });
    const [proximosEventos, setProximosEventos] = useState([]);
    const [ultimosPosts, setUltimosPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Buscar dados do Fluxo de Caixa
                const lancamentosSnapshot = await getDocs(collection(db, 'fluxoCaixaLancamentos'));
                let entradas = 0;
                let saidas = 0;
                lancamentosSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.tipo === 'entrada') {
                        entradas += data.valor;
                    } else {
                        saidas += data.valor;
                    }
                });
                setStats({ entradas, saidas, saldo: entradas - saidas });

                // 2. Buscar Próximos Eventos do Calendário
                const hoje = Timestamp.now();
                const eventosQuery = query(
                    collection(db, 'calendarioEventos'), 
                    where('start', '>=', hoje), 
                    orderBy('start', 'asc'), 
                    limit(3)
                );
                const eventosSnapshot = await getDocs(eventosQuery);
                setProximosEventos(eventosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // 3. Buscar Últimos Posts do Blog
                const postsQuery = query(collection(db, 'posts'), orderBy('data', 'desc'), limit(3));
                const postsSnapshot = await getDocs(postsQuery);
                setUltimosPosts(postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (error) {
                console.error("Erro ao buscar dados para o dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const formatDate = (timestamp) => timestamp ? timestamp.toDate().toLocaleDateString('pt-BR') : 'N/A';

    if (loading) {
        return <p>Carregando resumo...</p>;
    }

    return (
        <div className="dashboard-grid">
            {/* Resumo Financeiro */}
            <div className="summary-card-dash green">
                <FiTrendingUp size={24} />
                <div>
                    <h4>Total de Entradas</h4>
                    <span>{formatCurrency(stats.entradas)}</span>
                </div>
            </div>
            <div className="summary-card-dash red">
                <FiTrendingDown size={24} />
                <div>
                    <h4>Total de Saídas</h4>
                    <span>{formatCurrency(stats.saidas)}</span>
                </div>
            </div>
            <div className="summary-card-dash blue">
                <FiDollarSign size={24} />
                <div>
                    <h4>Saldo Atual</h4>
                    <span>{formatCurrency(stats.saldo)}</span>
                </div>
            </div>

            {/* Próximos Eventos */}
            <div className="list-card">
                <div className="list-card-header">
                    <h3><FiCalendar /> Próximos Eventos</h3>
                    <Link to="/calendario" className="see-all-link">Ver todos <FiArrowRight /></Link>
                </div>
                <ul>
                    {proximosEventos.length > 0 ? proximosEventos.map(evento => (
                        <li key={evento.id}>
                            <span>{evento.title}</span>
                            <span className="date">{formatDate(evento.start)}</span>
                        </li>
                    )) : <p className="empty-message">Nenhum evento futuro.</p>}
                </ul>
            </div>

            {/* Últimos Posts */}
            <div className="list-card">
                <div className="list-card-header">
                    <h3><FiFileText /> Últimos Posts do Blog</h3>
                    <Link to="/blog-manager" className="see-all-link">Ver todos <FiArrowRight /></Link>
                </div>
                <ul>
                    {ultimosPosts.length > 0 ? ultimosPosts.map(post => (
                        <li key={post.id}>
                            <span>{post.titulo}</span>
                            <span className="date">{formatDate(post.data)}</span>
                        </li>
                    )) : <p className="empty-message">Nenhum post no blog.</p>}
                </ul>
            </div>
        </div>
    );
};

export default DashboardResumo;
