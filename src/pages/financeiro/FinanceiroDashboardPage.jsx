import React from 'react';
import Header from '../../components/layout/Header';

const FinanceiroDashboardPage = () => {
  return (
    <>
      <Header
        title="Tesouraria"
        subtitle="Visão geral financeira e movimentações"
      />

      <div className="link-card">
        <h2 className="link-title">Dashboard Financeiro</h2>

        {/* Cards Resumo */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--spacing-md)',
            marginTop: 'var(--spacing-md)'
          }}
        >
          <div className="card">
            <h4>Entradas</h4>
            <strong style={{ color: 'var(--color-success)', fontSize: '1.4rem' }}>
              R$ 12.500,00
            </strong>
            <p className="text-secondary">Últimos 30 dias</p>
          </div>

          <div className="card">
            <h4>Saídas</h4>
            <strong style={{ color: 'var(--color-danger)', fontSize: '1.4rem' }}>
              R$ 8.320,00
            </strong>
            <p className="text-secondary">Últimos 30 dias</p>
          </div>

          <div className="card">
            <h4>Saldo Atual</h4>
            <strong style={{ color: 'var(--color-primary)', fontSize: '1.4rem' }}>
              R$ 4.180,00
            </strong>
            <p className="text-secondary">Em caixa</p>
          </div>
        </div>

        {/* Movimentações Recentes */}
        <div
          style={{
            marginTop: 'var(--spacing-lg)',
            padding: '1.5rem',
            border: '1px solid var(--color-border)',
            borderRadius: '8px'
          }}
        >
          <h3 style={{ marginBottom: '1rem' }}>Movimentações Recentes</h3>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                <th>Data</th>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>20/12/2025</td>
                <td>Doação PIX</td>
                <td style={{ color: 'var(--color-success)' }}>Entrada</td>
                <td>R$ 1.000,00</td>
              </tr>
              <tr>
                <td>18/12/2025</td>
                <td>Pagamento de fornecedor</td>
                <td style={{ color: 'var(--color-danger)' }}>Saída</td>
                <td>R$ 450,00</td>
              </tr>
              <tr>
                <td>15/12/2025</td>
                <td>Oferta culto</td>
                <td style={{ color: 'var(--color-success)' }}>Entrada</td>
                <td>R$ 780,00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Placeholder Gráficos */}
        <div
          style={{
            marginTop: 'var(--spacing-lg)',
            padding: '2rem',
            border: '1px dashed var(--color-border)',
            borderRadius: '8px',
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}
        >
          📊 Gráficos financeiros (entradas x saídas) aparecerão aqui
        </div>
      </div>
    </>
  );
};

export default FinanceiroDashboardPage;
