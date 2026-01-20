// src/pages/financeiro/FluxoCaixaPage.jsx (Agora é a Gestão de Lançamentos)

import React from 'react';
import Header from '../../components/layout/Header';
import FluxoCaixaForm from './components/FluxoCaixaForm';
import ListaFluxoManager from './components/ListaFluxoManager'; // Reutilizando o componente da lista
import './Financeiro.css';

const FluxoCaixaPage = () => {
  return (
    <>
      <Header 
        title="Gestão de Lançamentos"
        subtitle="Adicione novos lançamentos e gerencie o histórico completo do fluxo de caixa."
      />
      
      {/* Formulário para adicionar novo lançamento */}
      <FluxoCaixaForm />

      {/* Lista completa de todos os lançamentos (o antigo ListaFluxoManager) */}
      <div style={{ marginTop: 'var(--spacing-lg)' }}>
        <ListaFluxoManager />
      </div>
    </>
  );
};

export default FluxoCaixaPage;
