import React from 'react';
import Header from '../../components/layout/Header';

const TesourariaDashboardPage = () => {
  return (
    <>
      <Header
        title="Tesouraria"
        subtitle="Visão geral financeira e movimentações"
      />

      <div className="link-card">
        <h2 className="link-title">Dashboard da Tesouraria</h2>

        <p style={{ color: 'var(--color-text-secondary)' }}>
          Página em construção. Este painel será responsável por exibir
          entradas, saídas, saldo atual e relatórios financeiros.
        </p>

        <div
          style={{
            marginTop: 'var(--spacing-md)',
            padding: '1.5rem',
            border: '1px dashed var(--color-border)',
            borderRadius: '8px',
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}
        >
          📊 Componentes financeiros aparecerão aqui
        </div>
      </div>
    </>
  );
};

export default TesourariaDashboardPage;
