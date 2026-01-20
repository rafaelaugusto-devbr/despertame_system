import { NavLink, useNavigate } from 'react-router-dom';
import { useSidebarBase } from './useSidebarBase';
import './Sidebar.css';

import {
  FinanceIcon,
  ListIcon,
  PlusIcon,
  TagIcon,
  ChartIcon,
  ShoppingCartIcon,
  HomeIcon,
  LogoutIcon,
  CollapseIcon,
} from '../../assets/icons/icons';

const FinanceiroSidebar = () => {
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
        <NavLink to="/financeiro/dashboard">
          <FinanceIcon />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/financeiro/fluxo">
          <ListIcon />
          <span>Fluxo de Caixa</span>
        </NavLink>

        <NavLink to="/financeiro/adicionar">
          <PlusIcon />
          <span>Novo Lançamento</span>
        </NavLink>

        <NavLink to="/financeiro/categorias">
          <TagIcon />
          <span>Categorias</span>
        </NavLink>

        <NavLink to="/financeiro/vendas">
          <ShoppingCartIcon />
          <span>Vendas</span>
        </NavLink>

        <NavLink to="/financeiro/relatorios">
          <ChartIcon />
          <span>Relatórios</span>
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

export default FinanceiroSidebar;
