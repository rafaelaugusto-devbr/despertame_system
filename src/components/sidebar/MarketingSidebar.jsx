import { NavLink, useNavigate } from 'react-router-dom';
import { useSidebarBase } from './useSidebarBase';
import { useSidebar } from '../../contexts/SidebarContext';
import UserAvatarIcon from '../UserAvatarIcon';
import { DashboardIcon } from '../../assets/icons/icons';
import './Sidebar.css';

import {
  ChartIcon,
  BlogIcon,
  EmailIcon,
  LeadsIcon,
  HomeIcon,
  LogoutIcon,
  CollapseIcon,
} from '../../assets/icons/icons';
import { FiImage } from 'react-icons/fi';

const MarketingSidebar = () => {
  const { collapsed, toggleCollapse, handleLogout, mobileOpen, closeMobile } = useSidebarBase();
  const { openProfileModal } = useSidebar();
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
        <NavLink to="/marketing/dashboard" onClick={handleNavClick}>
          <ChartIcon />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/marketing/blog" onClick={handleNavClick}>
          <BlogIcon />
          <span>Blog</span>
        </NavLink>

        <NavLink to="/marketing/midia" onClick={handleNavClick}>
          <FiImage />
          <span>Galeria de Mídia</span>
        </NavLink>

        <NavLink to="/marketing/emails" onClick={handleNavClick}>
          <EmailIcon />
          <span>E-mails</span>
        </NavLink>

        <NavLink to="/marketing/leads" onClick={handleNavClick}>
          <LeadsIcon />
          <span>Leads</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="profile-button" onClick={openProfileModal}>
          <UserAvatarIcon />
          {!collapsed && <span>Meu Perfil</span>}
        </button>

        <button onClick={() => navigate('/dashboard')} className="collapse-button">
          <HomeIcon />
          {!collapsed && <span>Voltar ao Painel</span>}
        </button>

        <button onClick={handleLogout} className="logout-button">
          <LogoutIcon />
          {!collapsed && <span>Sair</span>}
        </button>

        <button onClick={toggleCollapse} className="collapse-button">
          <CollapseIcon collapsed={collapsed} />
          {!collapsed && <span>{collapsed ? 'Expandir Menu' : 'Recolher Menu'}</span>}
        </button>
      </div>
    </aside>
  );
};

export default MarketingSidebar;
