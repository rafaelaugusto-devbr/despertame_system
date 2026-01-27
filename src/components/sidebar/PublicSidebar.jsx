import { NavLink, useNavigate } from 'react-router-dom';
import { useSidebarBase } from './useSidebarBase';
import UserAvatarIcon from '../UserAvatarIcon';
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
  const { collapsed, toggleCollapse, handleLogout, mobileOpen, closeMobile } = useSidebarBase();
  const navigate = useNavigate();

  const handleNavClick = () => {
    if (window.innerWidth <= 1024) {
      closeMobile();
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
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
        <NavLink to="/dashboard" onClick={handleNavClick}>
          <DashboardIcon />
          {!collapsed && <span>Dashboard Geral</span>}
        </NavLink>

        <NavLink to="/calendario" onClick={handleNavClick}>
          <CalendarIcon />
          {!collapsed && <span>Calendário</span>}
        </NavLink>

        <NavLink to="/links" onClick={handleNavClick}>
          <LinkIcon />
          {!collapsed && <span>Links</span>}
        </NavLink>

        <div className="sidebar-divider" />

        {/* Entradas para painéis */}
        <NavLink to="/tesouraria" onClick={handleNavClick}>
          <TreasuryIcon />
          {!collapsed && <span>Painel Tesouraria</span>}
        </NavLink>

        <NavLink to="/marketing" onClick={handleNavClick}>
          <MarketingIcon />
          {!collapsed && <span>Painel Marketing</span>}
        </NavLink>

        <NavLink to="/config" onClick={handleNavClick}>
          <ConfigIcon />
          {!collapsed && <span>Painel Config</span>}
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="profile-button" onClick={() => { navigate('/perfil'); handleNavClick(); }}>
          <UserAvatarIcon />
          {!collapsed && <span>Meu Perfil</span>}
        </button>

        <button className="logout-button" onClick={handleLogout}>
          <LogoutIcon />
          {!collapsed && <span>Sair</span>}
        </button>

        <button className="collapse-button" onClick={toggleCollapse}>
          <CollapseIcon collapsed={collapsed} />
          {!collapsed && <span>Recolher Menu</span>}
        </button>
      </div>
    </aside>
  );
};

export default PublicSidebar;