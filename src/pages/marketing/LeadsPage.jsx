// src/pages/LeadsPage.jsx (Versão Corrigida)

import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import LeadsManager from './components/LeadsManager';
import Button from '../../components/ui/Button';
import { FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';

const LeadsPage = () => {
    const [leadsData, setLeadsData] = useState([]);

    const handleExport = () => {
        if (leadsData.length === 0) return;

        const dataToExport = leadsData.map(lead => ({
            'Nome Completo': lead.nome,
            'E-mail': lead.email,
            'WhatsApp': lead.telefone,
            'Data de Cadastro': lead.createdAt?.toDate().toLocaleString('pt-BR') || 'N/A'
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Leads');
        XLSX.writeFile(wb, 'leads_despertame.xlsx');
    };

    // A página agora retorna seu conteúdo dentro de um Fragment (<>), sem o AdminLayout
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <Header 
                    title="Gerenciamento de Leads" 
                    subtitle="Visualize todas as pessoas que se cadastraram para receber novidades." 
                />
                <Button 
                    onClick={handleExport}
                    className="btn-primary btn-small"
                    disabled={leadsData.length === 0}
                >
                    <FiDownload /> Exportar
                </Button>
            </div>

            <div className="summary-cards" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="summary-card-dash blue">
                    <div>
                        <h4>Total de Leads</h4>
                        <span>{leadsData.length}</span>
                    </div>
                </div>
            </div>
            
            <LeadsManager onDataLoaded={setLeadsData} />
        </>
    );
};

export default LeadsPage;
