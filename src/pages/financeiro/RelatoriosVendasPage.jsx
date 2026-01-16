// src/pages/financeiro/RelatoriosVendasPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import { FiFilter, FiDownload, FiBarChart2, FiPieChart } from 'react-icons/fi';
import { LineChart, Line, AreaChart, Area, Pie, PieChart as RePieChart, Cell, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

const KpiCard = ({ title, value }) => (
    <div className="summary-card-dash" style={{ background: 'var(--color-background-light)', border: '1px solid var(--color-border)' }}>
        <div style={{ color: 'var(--color-text-primary)' }}>
            <h4 style={{ color: 'var(--color-text-secondary)' }}>{title}</h4>
            <span>{value}</span>
        </div>
    </div>
);

const RelatoriosVendasPage = () => {
    // Estados para filtros
    const [filtroCampanha, setFiltroCampanha] = useState('todas');
    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');

    // Estados para dados
    const [campanhas, setCampanhas] = useState([]);
    const [transacoes, setTransacoes] = useState([]);
    const [dadosFiltrados, setDadosFiltrados] = useState([]);
    const [loading, setLoading] = useState(false);

    // Carrega campanhas para o seletor de filtro
    useEffect(() => {
        const fetchCampanhas = async () => {
            const q = query(collection(db, 'vendasCampanhas'), orderBy('nome', 'asc'));
            const snapshot = await getDocs(q);
            setCampanhas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchCampanhas();
    }, []);

    const handleApplyFilter = useCallback(async () => {
        setLoading(true);
        
        let transacoesQuery = collection(db, 'vendasTransacoes');
        let constraints = [];

        if (filtroCampanha !== 'todas') {
            constraints.push(where('campanhaId', '==', filtroCampanha));
        }
        if (filtroDataInicio) {
            constraints.push(where('dataVenda', '>=', Timestamp.fromDate(new Date(filtroDataInicio))));
        }
        if (filtroDataFim) {
            const dataFim = new Date(filtroDataFim);
            dataFim.setHours(23, 59, 59, 999); // Inclui o dia todo
            constraints.push(where('dataVenda', '<=', Timestamp.fromDate(dataFim)));
        }
        
        // O Firestore exige que a primeira ordenação seja no campo da desigualdade
        const finalQuery = query(transacoesQuery, ...constraints, orderBy('dataVenda', 'desc'));

        try {
            const snapshot = await getDocs(finalQuery);
            const transacoesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransacoes(transacoesData);
            setDadosFiltrados(transacoesData);
        } catch (error) {
            console.error("Erro ao aplicar filtro:", error);
            alert("Erro ao buscar dados. Verifique se o índice necessário foi criado no Firestore. O console pode ter mais detalhes.");
        } finally {
            setLoading(false);
        }
    }, [filtroCampanha, filtroDataInicio, filtroDataFim]);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // Cálculos para os KPIs e gráficos
    const totalArrecadado = dadosFiltrados.reduce((acc, t) => acc + t.valorTotal, 0);
    const totalItens = dadosFiltrados.reduce((acc, t) => acc + t.quantidade, 0);
    
    const dadosGraficoPagamento = Object.entries(
        dadosFiltrados.reduce((acc, t) => {
            acc[t.formaPagamento] = (acc[t.formaPagamento] || 0) + t.valorTotal;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    const handleExport = () => {
        if (dadosFiltrados.length === 0) {
            alert("Não há dados filtrados para exportar.");
            return;
        }
        const dataToExport = dadosFiltrados.map(t => {
            const campanhaNome = campanhas.find(c => c.id === t.campanhaId)?.nome || 'N/A';
            return {
                'Campanha': campanhaNome,
                'Data da Venda': t.dataVenda.toDate().toLocaleString('pt-BR'),
                'Quantidade': t.quantidade,
                'Valor Unitário': t.valorUnitario,
                'Valor Total': t.valorTotal,
                'Forma de Pagamento': t.formaPagamento,
                'Observação': t.observacao,
            };
        });
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'RelatorioVendas');
        XLSX.writeFile(wb, 'relatorio_de_vendas.xlsx');
    };

    return (
        <>
            <Header title="Relatórios de Vendas" subtitle="Analise o desempenho das suas campanhas com filtros avançados." />

            {/* Seção de Filtros */}
            <div className="link-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                <div>
                    <label>Campanha</label>
                    <select className="input-field" value={filtroCampanha} onChange={e => setFiltroCampanha(e.target.value)}>
                        <option value="todas">Todas as Campanhas</option>
                        {campanhas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>
                <div>
                    <label>Data de Início</label>
                    <input type="date" className="input-field" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} />
                </div>
                <div>
                    <label>Data de Fim</label>
                    <input type="date" className="input-field" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} />
                </div>
                <Button className="btn-primary" onClick={handleApplyFilter} loading={loading} loadingText="Buscando...">
                    <FiFilter /> Aplicar Filtro
                </Button>
            </div>

            {/* Seção de KPIs */}
            <div className="dashboard-grid kpi-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 'var(--spacing-lg)' }}>
                <KpiCard title="Total Arrecadado no Período" value={formatCurrency(totalArrecadado)} />
                <KpiCard title="Total de Itens Vendidos" value={totalItens.toLocaleString('pt-BR')} />
            </div>

            {/* Seção de Gráficos */}
            <div className="dashboard-grid chart-grid" style={{ marginTop: 'var(--spacing-lg)' }}>
                <div className="link-card">
                    <h2 className="link-title"><FiPieChart /> Vendas por Forma de Pagamento</h2>
                    {dadosFiltrados.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <RePieChart>
                                <Pie data={dadosGraficoPagamento} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {dadosGraficoPagamento.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                            </RePieChart>
                        </ResponsiveContainer>
                    ) : <p className="empty-message">Sem dados para exibir.</p>}
                </div>
                {/* Futuramente podemos adicionar mais gráficos aqui */}
            </div>

            {/* Tabela de Resultados */}
            <div className="link-card user-table-container" style={{ marginTop: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="link-title">Transações Filtradas</h2>
                    <Button onClick={handleExport} className="btn-primary btn-small" disabled={dadosFiltrados.length === 0}>
                        <FiDownload /> Exportar para Excel
                    </Button>
                </div>
                {loading ? <p>Carregando...</p> : (
                    <table className="lancamentos-table">
                        <thead>
                            <tr><th>Campanha</th><th>Data</th><th>Quantidade</th><th>Valor Total</th><th>Pagamento</th></tr>
                        </thead>
                        <tbody>
                            {dadosFiltrados.length > 0 ? dadosFiltrados.map(t => (
                                <tr key={t.id}>
                                    <td data-label="Campanha">{campanhas.find(c => c.id === t.campanhaId)?.nome || 'N/A'}</td>
                                    <td data-label="Data">{t.dataVenda.toDate().toLocaleDateString('pt-BR')}</td>
                                    <td data-label="Quantidade">{t.quantidade}</td>
                                    <td data-label="Valor Total">{formatCurrency(t.valorTotal)}</td>
                                    <td data-label="Pagamento">{t.formaPagamento}</td>
                                </tr>
                            )) : <tr><td colSpan="5" style={{ textAlign: 'center' }}>Nenhuma transação encontrada para os filtros aplicados.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
};

export default RelatoriosVendasPage;
