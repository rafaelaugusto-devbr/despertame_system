import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ModalProvider } from './contexts/ModalContext';
import { useAuth } from './hooks/useAuth';

import PageGuard from './components/guards/PageGuard';
import AdminRoute from './components/guards/AdminRoute';

import { PANELS } from './config-senha/panels';

/* Layout universal */
import UniversalLayout from './components/layout/UniversalLayout';

/* Sidebars */
import PublicSidebar from './components/sidebar/PublicSidebar';
import TesourariaSidebar from './components/sidebar/TesourariaSidebar';
import FinanceiroSidebar from './components/sidebar/FinanceiroSidebar';
import MarketingSidebar from './components/sidebar/MarketingSidebar';
import ConfigSidebar from './components/sidebar/ConfigSidebar';

/* Páginas públicas */
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/public/SuperDashboardPage';
import CalendarioVisualizacao from './pages/public/CalendarioVisualizacao';
import LinksPage from './pages/public/LinksPage';

/* Tesouraria */
import TesourariaDashboardPage from './pages/tesouraria/TesourariaDashboardPage';
import CalendarioPage from './pages/tesouraria/CalendarioPage';

/* Financeiro */
import FinanceiroDashboardPage from './pages/financeiro/FinanceiroDashboardPage';
import RelatoriosVendasPage from './pages/financeiro/RelatoriosVendasPage';
import ListaFluxoPage from './pages/financeiro/ListaFluxoPage';
import FluxoCaixaPage from './pages/financeiro/FluxoCaixaPage';
import CategoriasTiposPage from './pages/financeiro/CategoriasTiposPage';
import CampanhasListPage from './pages/financeiro/CampanhasListPage';
import CampanhaDetalhesPage from './pages/financeiro/CampanhaDetalhesPage';

/* Marketing */
import AdminDashboard from './pages/marketing/AdminDashboard';
import BlogManagerPage from './pages/marketing/BlogManagerPage';
import EmailDashboardPage from './pages/marketing/EmailDashboardPage';
import LeadsPage from './pages/marketing/LeadsPage';

/* Config */
import UserManagementPage from './pages/config/UserManagementPage';

/* Guarda simples de login */
const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Carregando...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  return (
    <ModalProvider>
      <Router>
        <Routes>

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Painel Público */}
          <Route
            element={
              <AuthGuard>
                <UniversalLayout Sidebar={PublicSidebar} />
              </AuthGuard>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/calendario" element={<CalendarioVisualizacao />} />
            <Route path="/links" element={<LinksPage />} />
          </Route>

          {/* Painel Tesouraria */}
          <Route
            path="/tesouraria"
            element={
              <AdminRoute>
                <PageGuard
                  pageKey={PANELS.TESOURARIA.key}
                  correctPassword={PANELS.TESOURARIA.password}
                  pageName={PANELS.TESOURARIA.label}
                >
                  <UniversalLayout Sidebar={TesourariaSidebar} />
                </PageGuard>
              </AdminRoute>
            }
          >
            <Route path="dashboard" element={<TesourariaDashboardPage />} />
            <Route path="calendario" element={<CalendarioPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Painel Financeiro */}
          <Route
            path="/financeiro"
            element={
              <AdminRoute>
                <PageGuard
                  pageKey={PANELS.FINANCEIRO.key}
                  correctPassword={PANELS.FINANCEIRO.password}
                  pageName={PANELS.FINANCEIRO.label}
                >
                  <UniversalLayout Sidebar={FinanceiroSidebar} />
                </PageGuard>
              </AdminRoute>
            }
          >
            <Route path="dashboard" element={<FinanceiroDashboardPage />} />
            <Route path="fluxo" element={<ListaFluxoPage />} />
            <Route path="adicionar" element={<FluxoCaixaPage />} />
            <Route path="categorias" element={<CategoriasTiposPage />} />
            <Route path="vendas" element={<CampanhasListPage />} />
            <Route path="vendas/:campanhaId" element={<CampanhaDetalhesPage />} />
            <Route path="relatorios" element={<RelatoriosVendasPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Painel Marketing */}
          <Route
            path="/marketing"
            element={
              <AdminRoute>
                <PageGuard
                  pageKey={PANELS.MARKETING.key}
                  correctPassword={PANELS.MARKETING.password}
                  pageName={PANELS.MARKETING.label}
                >
                  <UniversalLayout Sidebar={MarketingSidebar} />
                </PageGuard>
              </AdminRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="blog" element={<BlogManagerPage />} />
            <Route path="emails" element={<EmailDashboardPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Painel Config */}
          <Route
            path="/config"
            element={
              <AdminRoute>
                <PageGuard
                  pageKey={PANELS.CONFIG.key}
                  correctPassword={PANELS.CONFIG.password}
                  pageName={PANELS.CONFIG.label}
                >
                  <UniversalLayout Sidebar={ConfigSidebar} />
                </PageGuard>
              </AdminRoute>
            }
          >
            <Route path="usuarios" element={<UserManagementPage />} />
            <Route index element={<Navigate to="usuarios" replace />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </Router>
    </ModalProvider>
  );
}

export default App;
