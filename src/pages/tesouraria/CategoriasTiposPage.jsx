// src/pages/financeiro/CategoriasTiposPage.jsx (Versão Final Corrigida)
import React from 'react';
import Header from '../../components/layout/Header';
import CategoriasManager from './components/CategoriasManager';
import './Financeiro.css';

const CategoriasTiposPage = () => {
  return (
    // A página retorna apenas seu conteúdo.
    <>
      <Header 
        title="Gerenciar Categorias do Fluxo de Caixa" 
        subtitle="Adicione, edite ou exclua as categorias dos seus lançamentos." 
      />
      <CategoriasManager />
      <div className="link-card" style={{ marginTop: 'var(--spacing-lg)' }}>
        <h2 className="link-title">Tipos de Lançamento</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Os tipos de lançamento são fixos (Entrada e Saída) e não podem ser alterados.
        </p>
      </div>
    </>
  );
};

export default CategoriasTiposPage;
