// src/pages/AdminDashboard.jsx (Versão Corrigida)

import React from 'react';
import Header from '../../components/layout/Header';
import LinkCard from './components/LinkCard';

const AdminDashboard = () => {
  return (
    <>
      <Header 
        title="Gerenciar Links" 
        subtitle="Gerencie os links dos botões 'Ajude' e 'Retiro' do seu site." 
      />
      
      <div className="links-grid">
        <LinkCard type="ajude" title="Link Ajude" placeholder="Digite o novo link do botão Ajude" />
        <LinkCard type="retiro" title="Link Retiro" placeholder="Digite o novo link do botão Retiro" />
      </div>
    </>
  );
};

export default AdminDashboard;
