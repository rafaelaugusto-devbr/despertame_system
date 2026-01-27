import { NavLink, useNavigate } from 'react-router-dom';
import { useSidebarBase } from './useSidebarBase';
import UserAvatarIcon from '../UserAvatarIcon';
import './Sidebar.css';

import {
  CalendarIcon,
  HomeIcon,
  LogoutIcon,
  CollapseIcon,
  FileIcon,
  UsersIcon,
  FinanceIcon,
  PlusIcon,
  TagIcon,
  ChartIcon,
  ShoppingCartIcon,
  TicketIcon,
  ClockIcon,
} from '../../assets/icons/icons';

const TesourariaSidebar = () => {
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
        <NavLink to="/tesouraria/dashboard" onClick={handleNavClick}>
          <FinanceIcon />
          <span>Dashboard Financeiro</span>
        </NavLink>

        <NavLink to="/tesouraria/adicionar" onClick={handleNavClick}>
          <PlusIcon />
          <span>Novo Lançamento</span>
        </NavLink>

        <NavLink to="/tesouraria/contas-pagar" onClick={handleNavClick}>
          <ClockIcon />
          <span>Contas a Pagar</span>
        </NavLink>

        <NavLink to="/tesouraria/categorias" onClick={handleNavClick}>
          <TagIcon />
          <span>Categorias</span>
        </NavLink>

        <NavLink to="/tesouraria/vendas" onClick={handleNavClick}>
          <ShoppingCartIcon />
          <span>Vendas</span>
        </NavLink>

        <NavLink to="/tesouraria/rifas" onClick={handleNavClick}>
          <TicketIcon />
          <span>Rifas</span>
        </NavLink>

        <NavLink to="/tesouraria/relatorios" onClick={handleNavClick}>
          <ChartIcon />
          <span>Relatórios</span>
        </NavLink>

        <div className="sidebar-divider" />

        <NavLink to="/tesouraria/inscritos" onClick={handleNavClick}>
          <UsersIcon />
          <span>Inscritos do Retiro</span>
        </NavLink>

        <NavLink to="/tesouraria/operarios" onClick={handleNavClick}>
          <UsersIcon />
          <span>Operários</span>
        </NavLink>

        <NavLink to="/tesouraria/calendario" onClick={handleNavClick}>
          <CalendarIcon />
          <span>Calendário</span>
        </NavLink>

        <NavLink to="/tesouraria/documentos" onClick={handleNavClick}>
          <FileIcon />
          <span>Documentos</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={() => navigate('/dashboard')} className="collapse-button">
          <HomeIcon />
          <span>Voltar ao Painel</span>
        </button>

        <button onClick={() => { navigate('/perfil'); handleNavClick(); }} className="profile-button">
          <UserAvatarIcon />
          <span>Meu Perfil</span>
        </button>

        <button onClick={handleLogout} className="logout-button">
          <LogoutIcon />
          <span>Sair</span>
        </button>

        <button onClick={toggleCollapse} className="collapse-button">
          <CollapseIcon collapsed={collapsed} />
          <span>{collapsed ? 'Expandir Menu' : 'Recolher Menu'}</span>
        </button>
      </div>
    </aside>
  );
};

export default TesourariaSidebar;
