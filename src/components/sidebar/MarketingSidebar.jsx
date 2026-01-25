import { NavLink, useNavigate } from 'react-router-dom';
import { useSidebarBase } from './useSidebarBase';
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
        <NavLink to="/marketing/dashboard">
          <ChartIcon />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/marketing/blog">
          <BlogIcon />
          <span>Blog</span>
        </NavLink>

        <NavLink to="/marketing/midia">
          <FiImage />
          <span>Galeria de Mídia</span>
        </NavLink>

        <NavLink to="/marketing/emails">
          <EmailIcon />
          <span>E-mails</span>
        </NavLink>

        <NavLink to="/marketing/leads">
          <LeadsIcon />
          <span>Leads</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
      <button onClick={() => navigate('/dashboard')} className="collapse-button">
  <HomeIcon />
  {!collapsed && <span>Voltar ao Painel</span>}
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

export default MarketingSidebar;
