// src/components/charts/FinanceChart.js

import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinanceChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const querySnapshot = await getDocs(collection(db, 'fluxoCaixaLancamentos'));
            const lancamentos = querySnapshot.docs.map(doc => doc.data());

            // Agrupa os dados por mês/ano
            const monthlyData = lancamentos.reduce((acc, { data, valor, tipo }) => {
                const date = data.toDate();
                const monthYear = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                
                if (!acc[monthYear]) {
                    acc[monthYear] = { name: monthYear, Entradas: 0, Saídas: 0 };
                }

                if (tipo === 'entrada') {
                    acc[monthYear].Entradas += valor;
                } else {
                    acc[monthYear].Saídas += valor;
                }

                return acc;
            }, {});

            // Converte o objeto em um array e ordena
            const chartData = Object.values(monthlyData).sort((a, b) => {
                const [aMonth, aYear] = a.name.split('/');
                const [bMonth, bYear] = b.name.split('/');
                return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
            });

            setData(chartData);
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) {
        return <p>Carregando dados financeiros...</p>;
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                    <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                    <Legend />
                    <Bar dataKey="Entradas" fill="#56ab2f" />
                    <Bar dataKey="Saídas" fill="#d9534f" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default FinanceChart;
