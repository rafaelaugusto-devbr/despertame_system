// src/pages/financeiro/ListaFluxoPage.jsx (Versão com Cálculos Corrigidos)

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Header from '../../components/layout/Header';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiArrowRight, FiTag } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Financeiro.css';

// --- Componentes Reutilizáveis ---
const KpiCard = ({ title, value, icon, color }) => (
    <div className="summary-card-dash" style={{ background: color }}>
        {icon}
        <div>
            <h4>{title}</h4>
            <span>{value}</span>
        </div>
    </div>
);

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

// --- Componente Principal do Dashboard ---
const ListaFluxoPage = () => {
    const [stats, setStats] = useState({
        saldoGeral: 0,
        totalEntradas: 0,
        totalSaidas: 0,
        lucroVendas: 0,
    });
    const [saidasPorCategoria, setSaidasPorCategoria] = useState([]);
    const [receitasPorOrigem, setReceitasPorOrigem] = useState([]);
    const [desempenhoMensal, setDesempenhoMensal] = useState([]);
    const [ultimosLancamentos, setUltimosLancamentos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Buscar todas as coleções
            const [lancamentosSnap, categoriasSnap, campanhasSnap] = await Promise.all([
                getDocs(collection(db, 'fluxoCaixaLancamentos')),
                getDocs(collection(db, 'fluxoCaixaCategorias')),
                getDocs(collection(db, 'vendasCampanhas')),
            ]);

            const categoriasMap = Object.fromEntries(categoriasSnap.docs.map(doc => [doc.id, doc.data()]));
            const lancamentos = lancamentosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const campanhas = campanhasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // ==================================================================
            // LÓGICA DE CÁLCULO CORRIGIDA
            // ==================================================================

            // 2. Calcular totais de cada fonte separadamente
            const entradasAvulsas = lancamentos.reduce((acc, l) => l.tipo === 'entrada' ? acc + l.valor : acc, 0);
            const saidasAvulsas = lancamentos.reduce((acc, l) => l.tipo === 'saida' ? acc + l.valor : acc, 0);
            const totalArrecadadoVendas = campanhas.reduce((acc, c) => acc + c.arrecadado, 0);
            const totalCustoVendas = campanhas.reduce((acc, c) => acc + (c.custoTotal || 0), 0);

            // 3. Calcular KPIs Globais com as fórmulas corretas
            const lucroLiquidoVendas = totalArrecadadoVendas - totalCustoVendas;
            
            // Saldo Geral = (Entradas Avulsas + Total Arrecadado em Vendas) - (Saídas Avulsas + Custo das Vendas)
            // Assumimos que o custo da venda é registrado como uma "saída" no fluxo de caixa.
            // Se não for, a fórmula muda. Vamos usar a mais simples por enquanto:
            const saldoGeral = entradasAvulsas + totalArrecadadoVendas - saidasAvulsas;
            const totalEntradas = entradasAvulsas + totalArrecadadoVendas;
            const totalSaidas = saidasAvulsas;

            setStats({
                saldoGeral,
                totalEntradas,
                totalSaidas,
                lucroVendas: lucroLiquidoVendas
            });

            // 4. Processar dados para Gráfico de Saídas por Categoria (Correto)
            const saidasAgrupadas = lancamentos
                .filter(l => l.tipo === 'saida')
                .reduce((acc, l) => {
                    const catNome = categoriasMap[l.categoriaId]?.name || 'Sem Categoria';
                    acc[catNome] = (acc[catNome] || 0) + l.valor;
                    return acc;
                }, {});
            setSaidasPorCategoria(Object.entries(saidasAgrupadas).map(([name, value]) => ({ name, value })));

            // 5. Processar dados para Gráfico de Receitas por Origem (Correto)
            setReceitasPorOrigem([
                { name: 'Entradas Avulsas', value: entradasAvulsas },
                { name: 'Vendas de Campanhas', value: totalArrecadadoVendas },
            ]);

            // 6. Processar dados para Gráfico de Desempenho Mensal (Correto)
            const mensalAgrupado = lancamentos.reduce((acc, l) => {
                const mesAno = l.data.toDate().toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
                if (!acc[mesAno]) acc[mesAno] = { name: mesAno, Entradas: 0, Saídas: 0 };
                if (l.tipo === 'entrada') acc[mesAno].Entradas += l.valor;
                else acc[mesAno].Saídas += l.valor;
                return acc;
            }, {});
            // Ordena por data para garantir que o gráfico fique cronológico
            const sortedMensal = Object.values(mensalAgrupado).sort((a, b) => {
                const [aMonth, aYear] = a.name.split('. de ');
                const [bMonth, bYear] = b.name.split('. de ');
                const aDate = new Date(`01 ${aMonth} 20${aYear}`);
                const bDate = new Date(`01 ${bMonth} 20${bYear}`);
                return aDate - bDate;
            });
            setDesempenhoMensal(sortedMensal);

            // 7. Buscar Últimos Lançamentos (sem alteração)
            const q = query(collection(db, 'fluxoCaixaLancamentos'), orderBy('data', 'desc'), limit(5));
            const ultimosSnap = await getDocs(q);
            setUltimosLancamentos(ultimosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        } catch (error) {
            console.error("Erro ao montar dashboard financeiro:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <p>Montando dashboard financeiro...</p>;
    }

    return (
        <>
            <Header title="Dashboard Financeiro" subtitle="Visão estratégica unificada de todas as finanças." />

            {/* --- Seção de KPIs --- */}
            <div className="dashboard-grid kpi-grid">
                <KpiCard title="Saldo Geral" value={formatCurrency(stats.saldoGeral)} icon={<FiDollarSign size={24} />} color="linear-gradient(135deg, #3b82f6, #60a5fa)" />
                <KpiCard title="Total de Entradas" value={formatCurrency(stats.totalEntradas)} icon={<FiTrendingUp size={24} />} color="linear-gradient(135deg, #56ab2f, #a8e063)" />
                <KpiCard title="Total de Saídas" value={formatCurrency(stats.totalSaidas)} icon={<FiTrendingDown size={24} />} color="linear-gradient(135deg, #ff6b6b, #d9534f)" />
                <KpiCard title="Lucro de Vendas" value={formatCurrency(stats.lucroVendas)} icon={<FiTag size={24} />} color="linear-gradient(135deg, #ff8c00, #ff4500)" />
            </div>

            {/* --- Seção de Gráficos --- */}
            <div className="dashboard-grid chart-grid" style={{ marginTop: 'var(--spacing-lg)' }}>
                <div className="link-card">
                    <h2 className="link-title">Saídas por Categoria</h2>
                    {saidasPorCategoria.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={saidasPorCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                                    {saidasPorCategoria.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="empty-message">Nenhuma saída registrada.</p>}
                </div>
                <div className="link-card">
                    <h2 className="link-title">Origem das Receitas</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={receitasPorOrigem} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} label>
                                {receitasPorOrigem.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="link-card" style={{ marginTop: 'var(--spacing-lg)' }}>
                <h2 className="link-title">Desempenho Mensal (Entradas vs Saídas)</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={desempenhoMensal}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `R$${value/1000}k`} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="Entradas" fill="#56ab2f" />
                        <Bar dataKey="Saídas" fill="#d9534f" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* --- Seção de Acesso Rápido --- */}
            <div className="link-card user-table-container" style={{ marginTop: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="link-title">Últimos Lançamentos</h2>
                    <Link to="/financeiro/adicionar" className="btn btn-secondary btn-small">Ver Todos <FiArrowRight /></Link>
                </div>
                <table className="lancamentos-table">
                    <thead>
                        <tr><th>Nome</th><th>Valor</th><th>Tipo</th><th>Data</th></tr>
                    </thead>
                    <tbody>
                        {ultimosLancamentos.map(l => (
                            <tr key={l.id}>
                                <td data-label="Nome">{l.nome}</td>
                                <td data-label="Valor" className={l.tipo === 'entrada' ? 'valor-entrada' : 'valor-saida'}>{l.tipo === 'saida' && '- '}{formatCurrency(l.valor)}</td>
                                <td data-label="Tipo">{l.tipo}</td>
                                <td data-label="Data">{l.data.toDate().toLocaleDateString('pt-BR')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ListaFluxoPage;
