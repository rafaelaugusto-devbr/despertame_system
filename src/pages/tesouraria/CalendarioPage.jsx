// src/pages/CalendarioPage.jsx (Versão Corrigida)

import React from 'react';
import Header from '../../components/layout/Header';
import CalendarioManager from './components/CalendarioManager';

const CalendarioPage = () => {
  // A página agora só retorna o seu conteúdo, sem o AdminLayout
  return (
    <>
      <Header 
        title="Calendário de Eventos" 
        subtitle="Gerencie os eventos e atividades do grupo." 
      />
      <CalendarioManager />
    </>
  );
};

export default CalendarioPage;
