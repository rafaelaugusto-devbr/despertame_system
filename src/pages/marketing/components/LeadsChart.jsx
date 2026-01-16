// src/components/charts/LeadsChart.js

import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LeadsChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const querySnapshot = await getDocs(collection(db, 'leads'));
            const leads = querySnapshot.docs.map(doc => doc.data());

            // Agrupa leads por data de criação
            const dailyData = leads.reduce((acc, { createdAt }) => {
                if (createdAt) {
                    const date = createdAt.toDate();
                    const dayMonth = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
                    
                    if (!acc[dayMonth]) {
                        acc[dayMonth] = { name: dayMonth, Leads: 0 };
                    }
                    acc[dayMonth].Leads += 1;
                }
                return acc;
            }, {});

            const chartData = Object.values(dailyData).sort((a, b) => {
                const [aDay, aMonth] = a.name.split('/');
                const [bDay, bMonth] = b.name.split('/');
                return new Date(2025, aMonth - 1, aDay) - new Date(2025, bMonth - 1, bDay); // Ano fixo para ordenação
            });

            setData(chartData);
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) {
        return <p>Carregando dados de leads...</p>;
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Leads" stroke="#ff8c00" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LeadsChart;
