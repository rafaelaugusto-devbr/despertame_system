import { NavLink, useNavigate } from 'react-router-dom';
import { useSidebarBase } from './useSidebarBase';
import './Sidebar.css';

/* SVGs – mantém seu padrão */
import {
  DashboardIcon,
  CalendarIcon,
  LinkIcon,
  TreasuryIcon,
  FinanceIcon,
  MarketingIcon,
  ConfigIcon,
  LogoutIcon,
  CollapseIcon,
} from '../../assets/icons/icons';

const PublicSidebar = () => {
  const { collapsed, toggleCollapse, handleLogout } = useSidebarBase();
  const navigate = useNavigate();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
  <img
    src="/src/assets/logo_despertame.jpg"
    alt="Despertame"
    className="sidebar-logo"
  />
  {!collapsed && <h3>Painel</h3>}
</div>

      <nav className="sidebar-nav">
        {/* Público */}
        <NavLink to="/dashboard">
          <DashboardIcon />
          {!collapsed && <span>Dashboard Geral</span>}
        </NavLink>

        <NavLink to="/calendario">
          <CalendarIcon />
          {!collapsed && <span>Calendário</span>}
        </NavLink>

        <NavLink to="/links">
          <LinkIcon />
          {!collapsed && <span>Links</span>}
        </NavLink>

        <div className="sidebar-divider" />

        {/* Entradas para painéis */}
        <NavLink to="/tesouraria">
          <TreasuryIcon />
          {!collapsed && <span>Painel Tesouraria</span>}
        </NavLink>

        <NavLink to="/financeiro">
          <FinanceIcon />
          {!collapsed && <span>Painel Financeiro</span>}
        </NavLink>

        <NavLink to="/marketing">
          <MarketingIcon />
          {!collapsed && <span>Painel Marketing</span>}
        </NavLink>

        <NavLink to="/config">
          <ConfigIcon />
          {!collapsed && <span>Painel Config</span>}
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <LogoutIcon />
          {!collapsed && <span>Sair</span>}
        </button>

        <button className="collapse-button" onClick={toggleCollapse}>
          <CollapseIcon />
          {!collapsed && <span>Recolher Menu</span>}
        </button>
      </div>
    </aside>
  );
};

export default PublicSidebar;