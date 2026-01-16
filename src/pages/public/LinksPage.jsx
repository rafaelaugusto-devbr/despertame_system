import React from 'react';
import Header from '../../components/layout/Header';

/**
 * Página pública de Links (repositório)
 *
 * Esta tela é um placeholder enquanto você cria o repositório de links.
 */
export default function LinksPage() {
  return (
    <>
      <Header
        title="Links"
        subtitle="Repositório de links... (em construção)"
      />
      <div className="link-card">
        <h2 className="link-title">Em breve</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Aqui vai ficar a página de repositório/curadoria de links.
        </p>
      </div>
    </>
  );
}
