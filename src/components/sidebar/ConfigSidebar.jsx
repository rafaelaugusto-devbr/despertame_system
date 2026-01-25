import { NavLink, useNavigate } from 'react-router-dom';
import { useSidebarBase } from './useSidebarBase';
import './Sidebar.css';

import {
  SettingsIcon,
  UsersIcon,
  HomeIcon,
  LogoutIcon,
  CollapseIcon,
  LockIcon,
} from '../../assets/icons/icons';

const ConfigSidebar = () => {
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
        <NavLink to="/config/usuarios" onClick={handleNavClick}>
          <UsersIcon />
          <span>Usuários</span>
        </NavLink>

        <NavLink to="/config/senhas" onClick={handleNavClick}>
          <LockIcon />
          <span>Senhas</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={() => navigate('/dashboard')} className="collapse-button">
          <HomeIcon />
          <span>Voltar ao Painel</span>
        </button>

        <button onClick={handleLogout} className="logout-button">
          <LogoutIcon />
          <span>Sair</span>
        </button>

        <button onClick={toggleCollapse} className="collapse-button">
          <CollapseIcon />
          <span>{collapsed ? 'Expandir Menu' : 'Recolher Menu'}</span>
        </button>
      </div>
    </aside>
  );
};

export default ConfigSidebar;
