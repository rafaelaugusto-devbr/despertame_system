// src/pages/SuperDashboardPage.js (Versão Corrigida - Sem AdminLayout)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, getDocs, query, orderBy, limit, where, Timestamp, getCountFromServer } from 'firebase/firestore';

// Layout e Componentes
// A importação do AdminLayout foi removida daqui
import Header from '../../components/layout/Header';
import FinanceChart from '../financeiro/components/FinanceChart';
import LeadsChart from '../marketing/components/LeadsChart';

// Ícones para os KPIs
import { FiUsers, FiDollarSign, FiTrendingUp, FiTrendingDown, FiArrowRight, FiCalendar, FiFileText } from 'react-icons/fi';

// Componente reutilizável para os cartões de KPI
const StatCard = ({ title, value, icon, color, loading }) => (
    <div className="summary-card-dash" style={{ background: color }}>
        {icon}
        <div>
            <h4>{title}</h4>
            <span>{loading ? '...' : value}</span>
        </div>
    </div>
);

const SuperDashboardPage = () => {
    // Estado para os KPIs
    const [kpiData, setKpiData] = useState({
        totalLeads: 0,
        saldo: 0,
        entradas: 0,
        saidas: 0,
    });
    const [proximosEventos, setProximosEventos] = useState([]);
    const [ultimosPosts, setUltimosPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Buscar KPIs Financeiros
                const lancamentosSnapshot = await getDocs(collection(db, 'fluxoCaixaLancamentos'));
                let entradas = 0;
                let saidas = 0;
                lancamentosSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.tipo === 'entrada') entradas += data.valor;
                    else saidas += data.valor;
                });

                // 2. Buscar Total de Leads
                const leadsSnapshot = await getCountFromServer(collection(db, 'leads'));
                const totalLeads = leadsSnapshot.data().count;

                // 3. Buscar Próximos Eventos
                const hoje = Timestamp.now();
                const eventosQuery = query(collection(db, 'calendarioEventos'), where('start', '>=', hoje), orderBy('start', 'asc'), limit(3));
                const eventosSnapshot = await getDocs(eventosQuery);
                setProximosEventos(eventosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // 4. Buscar Últimos Posts
                const postsQuery = query(collection(db, 'posts'), orderBy('data', 'desc'), limit(3));
                const postsSnapshot = await getDocs(postsQuery);
                setUltimosPosts(postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Atualiza o estado de uma só vez
                setKpiData({ totalLeads, saldo: entradas - saidas, entradas, saidas });

            } catch (error) {
                console.error("Erro ao carregar dados do dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const formatDate = (timestamp) => timestamp ? timestamp.toDate().toLocaleDateString('pt-BR') : 'N/A';

    return (
        // A tag <AdminLayout> foi removida. Usamos um Fragment <> em seu lugar.
        <>
            <Header 
                title="Dashboard Geral" 
                subtitle="Visão completa e em tempo real das atividades do sistema." 
            />

            {/* --- Seção de KPIs --- */}
            <div className="dashboard-grid kpi-grid">
                <StatCard title="Saldo Financeiro" value={formatCurrency(kpiData.saldo)} icon={<FiDollarSign size={24} />} color="linear-gradient(135deg, #3b82f6, #60a5fa)" loading={loading} />
                <StatCard title="Total de Entradas" value={formatCurrency(kpiData.entradas)} icon={<FiTrendingUp size={24} />} color="linear-gradient(135deg, #56ab2f, #a8e063)" loading={loading} />
                <StatCard title="Total de Saídas" value={formatCurrency(kpiData.saidas)} icon={<FiTrendingDown size={24} />} color="linear-gradient(135deg, #ff6b6b, #d9534f)" loading={loading} />
                <StatCard title="Total de Leads" value={kpiData.totalLeads} icon={<FiUsers size={24} />} color="linear-gradient(135deg, #ff8c00, #ff4500)" loading={loading} />
            </div>

            {/* --- Seção de Gráficos --- */}
            <div className="dashboard-grid chart-grid">
                <div className="link-card">
                    <h2 className="link-title">Resumo Financeiro Mensal</h2>
                    <FinanceChart />
                </div>
                <div className="link-card">
                    <h2 className="link-title">Aquisição de Leads por Dia</h2>
                    <LeadsChart />
                </div>
            </div>

            {/* --- Seção de Informações Adicionais --- */}
            <div className="dashboard-grid info-grid">
                <div className="list-card">
                    <div className="list-card-header">
                        <h3><FiCalendar /> Próximos Eventos</h3>
                        <Link to="/calendario" className="see-all-link">Ver todos <FiArrowRight /></Link>
                    </div>
                    <ul>
                        {loading ? <li>Carregando...</li> : proximosEventos.length > 0 ? proximosEventos.map(evento => (
                            <li key={evento.id}>
                                <span>{evento.title}</span>
                                <span className="date">{formatDate(evento.start)}</span>
                            </li>
                        )) : <p className="empty-message" style={{padding: '1rem 0'}}>Nenhum evento futuro.</p>}
                    </ul>
                </div>
                <div className="list-card">
                    <div className="list-card-header">
                        <h3><FiFileText /> Últimos Posts do Blog</h3>
                        <Link to="/blog-manager" className="see-all-link">Ver todos <FiArrowRight /></Link>
                    </div>
                    <ul>
                        {loading ? <li>Carregando...</li> : ultimosPosts.length > 0 ? ultimosPosts.map(post => (
                            <li key={post.id}>
                                <span>{post.titulo}</span>
                                <span className="date">{formatDate(post.data)}</span>
                            </li>
                        )) : <p className="empty-message" style={{padding: '1rem 0'}}>Nenhum post no blog.</p>}
                    </ul>
                </div>
            </div>
        </> // A tag de fechamento </AdminLayout> foi substituída por um Fragment.
    );
};

export default SuperDashboardPage;
