import { NavLink, useNavigate } from 'react-router-dom';
import { useSidebarBase } from './useSidebarBase';
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
} from '../../assets/icons/icons';

const TesourariaSidebar = () => {
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
        <NavLink to="/tesouraria/dashboard">
          <FinanceIcon />
          <span>Dashboard Financeiro</span>
        </NavLink>

        <NavLink to="/tesouraria/adicionar">
          <PlusIcon />
          <span>Novo Lançamento</span>
        </NavLink>

        <NavLink to="/tesouraria/categorias">
          <TagIcon />
          <span>Categorias</span>
        </NavLink>

        <NavLink to="/tesouraria/vendas">
          <ShoppingCartIcon />
          <span>Vendas</span>
        </NavLink>

        <NavLink to="/tesouraria/rifas">
          <TicketIcon />
          <span>Rifas</span>
        </NavLink>

        <NavLink to="/tesouraria/relatorios">
          <ChartIcon />
          <span>Relatórios</span>
        </NavLink>

        <div className="sidebar-divider" />

        <NavLink to="/tesouraria/inscritos">
          <UsersIcon />
          <span>Inscritos do Retiro</span>
        </NavLink>

        <NavLink to="/tesouraria/calendario">
          <CalendarIcon />
          <span>Calendário</span>
        </NavLink>

        <NavLink to="/tesouraria/documentos">
          <FileIcon />
          <span>Documentos</span>
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

export default TesourariaSidebar;
