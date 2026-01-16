// src/pages/CategoriasTiposPage.js

import React from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Header from '../../../components/layout/Header';
import CategoriasManager from '../components/CategoriasManager'; // <-- MUDANÇA: Importa o novo componente

const CategoriasTiposPage = () => {
  return (
    <AdminLayout>
      <Header 
        title="Gerenciar Categorias do Fluxo de Caixa" 
        subtitle="Adicione, edite ou exclua as categorias dos seus lançamentos." 
      />
      
      {/* Apenas o gerenciador de categorias será renderizado aqui */}
      <CategoriasManager />

      {/* NOVO: Card informativo sobre os Tipos */}
      <div className="link-card" style={{ marginTop: 'var(--spacing-lg)' }}>
        <h2 className="link-title">Tipos de Lançamento</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Os tipos de lançamento são fixos e não podem ser alterados.
        </p>
        <div className="options-list" style={{ marginTop: 'var(--spacing-md)' }}>
          <div className="option-item">
            <span className="option-name">
              <span className="color-indicator" style={{ backgroundColor: '#16a34a' }}></span>
              Entrada
            </span>
          </div>
          <div className="option-item">
            <span className="option-name">
              <span className="color-indicator" style={{ backgroundColor: '#dc2626' }}></span>
              Saída
            </span>
          </div>
        </div>
      </div>

    </AdminLayout>
  );
};

export default CategoriasTiposPage;
