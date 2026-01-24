import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ModalProvider } from './contexts/ModalContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { useAuth } from './hooks/useAuth';

import PageGuard from './components/guards/PageGuard';
import AdminRoute from './components/guards/AdminRoute';

import { PANELS } from './config-senha/panels';

/* Layout universal */
import UniversalLayout from './components/layout/UniversalLayout';

/* Sidebars */
import PublicSidebar from './components/sidebar/PublicSidebar';
import TesourariaSidebar from './components/sidebar/TesourariaSidebar';
import MarketingSidebar from './components/sidebar/MarketingSidebar';
import ConfigSidebar from './components/sidebar/ConfigSidebar';

/* Páginas públicas */
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/public/SuperDashboardPage';
import CalendarioVisualizacao from './pages/public/CalendarioVisualizacao';
import LinksPage from './pages/public/LinksPage';

/* Tesouraria */
import InscritosPage from './pages/tesouraria/InscritosPage';
import CalendarioPage from './pages/tesouraria/CalendarioPage';
import DocumentosPage from './pages/tesouraria/DocumentosPage';

/* Financeiro (agora em Tesouraria) */
import FinanceiroDashboardPage from './pages/tesouraria/FinanceiroDashboardPage';
import RelatoriosVendasPage from './pages/tesouraria/RelatoriosVendasPage';
import FluxoCaixaPage from './pages/tesouraria/FluxoCaixaPage';
import CategoriasTiposPage from './pages/tesouraria/CategoriasTiposPage';
import CampanhasListPage from './pages/tesouraria/CampanhasListPage';
import CampanhaDetalhesPage from './pages/tesouraria/CampanhaDetalhesPage';

/* Marketing */
import AdminDashboard from './pages/marketing/AdminDashboard';
import BlogManagerPage from './pages/marketing/BlogManagerPage';
import EmailDashboardPage from './pages/marketing/EmailDashboardPage';
import LeadsPage from './pages/marketing/LeadsPage';

/* Config */
import UserManagementPage from './pages/config/UserManagementPage';
import SenhasPage from './pages/config/SenhasPage';

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
      <SidebarProvider>
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
            <Route path="inscritos" element={<InscritosPage />} />
            <Route path="calendario" element={<CalendarioPage />} />
            <Route path="documentos" element={<DocumentosPage />} />
            <Route path="dashboard" element={<FinanceiroDashboardPage />} />
            <Route path="adicionar" element={<FluxoCaixaPage />} />
            <Route path="categorias" element={<CategoriasTiposPage />} />
            <Route path="vendas" element={<CampanhasListPage />} />
            <Route path="vendas/:campanhaId" element={<CampanhaDetalhesPage />} />
            <Route path="relatorios" element={<RelatoriosVendasPage />} />
            <Route index element={<Navigate to="inscritos" replace />} />
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
            <Route path="senhas" element={<SenhasPage />} />
            <Route index element={<Navigate to="usuarios" replace />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

          </Routes>
        </Router>
      </SidebarProvider>
    </ModalProvider>
  );
}

export default App;
