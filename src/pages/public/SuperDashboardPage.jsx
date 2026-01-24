import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboardData } from '../../hooks/useDashboardData';
import Header from '../../components/layout/Header';
import FinanceChart from '../tesouraria/components/FinanceChart';
import LeadsChart from '../marketing/components/LeadsChart';
import {
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiArrowRight,
  FiCalendar,
  FiFileText,
} from 'react-icons/fi';
import './SuperDashboard.css';

// Componente StatCard melhorado
const StatCard = ({ title, value, icon: Icon, trend, color, loading, link }) => {
  const CardContent = () => (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__icon">
        <Icon size={28} />
      </div>
      <div className="stat-card__content">
        <h4 className="stat-card__title">{title}</h4>
        <p className="stat-card__value">
          {loading ? (
            <span className="skeleton skeleton--text"></span>
          ) : (
            value
          )}
        </p>
        {trend && (
          <span className={`stat-card__trend stat-card__trend--${trend.type}`}>
            {trend.type === 'up' ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );

  return link ? (
    <Link to={link} className="stat-card-link">
      <CardContent />
    </Link>
  ) : (
    <CardContent />
  );
};

// Skeleton Loading Component
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton--circle"></div>
    <div className="skeleton skeleton--text"></div>
    <div className="skeleton skeleton--title"></div>
  </div>
);

const SuperDashboardPage = () => {
  const { kpiData, proximosEventos, ultimosPosts, loading } = useDashboardData();

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const formatRelativeDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = date - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

      if (days === 0) return 'Hoje';
      if (days === 1) return 'Amanhã';
      if (days < 7) return `Em ${days} dias`;
      return formatDate(timestamp);
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="super-dashboard">
      <Header
        title="Dashboard Geral"
        subtitle="Visão completa e em tempo real das atividades do sistema."
      />

      {/* KPI Cards Grid */}
      <section className="dashboard-section">
        <div className="kpi-grid">
          <StatCard
            title="Saldo Financeiro"
            value={formatCurrency(kpiData.saldo)}
            icon={FiDollarSign}
            color="blue"
            loading={loading}
            link="/tesouraria/dashboard"
          />
          <StatCard
            title="Total de Entradas"
            value={formatCurrency(kpiData.entradas)}
            icon={FiTrendingUp}
            color="green"
            loading={loading}
            link="/tesouraria/fluxo"
          />
          <StatCard
            title="Total de Saídas"
            value={formatCurrency(kpiData.saidas)}
            icon={FiTrendingDown}
            color="red"
            loading={loading}
            link="/tesouraria/fluxo"
          />
          <StatCard
            title="Total de Leads"
            value={kpiData.totalLeads.toLocaleString('pt-BR')}
            icon={FiUsers}
            color="orange"
            loading={loading}
            link="/marketing/leads"
          />
        </div>
        <p className="kpi-period-note">* Dados financeiros dos últimos 30 dias</p>
      </section>

      {/* Charts Section */}
      <section className="dashboard-section">
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-card__header">
              <h2 className="chart-card__title">Resumo Financeiro Mensal</h2>
              <Link to="/tesouraria/relatorios" className="chart-card__link">
                Ver detalhes <FiArrowRight />
              </Link>
            </div>
            <div className="chart-card__body">
              {loading ? (
                <div className="chart-skeleton">
                  <div className="skeleton skeleton--chart"></div>
                </div>
              ) : (
                <FinanceChart />
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card__header">
              <h2 className="chart-card__title">Aquisição de Leads por Dia</h2>
              <Link to="/marketing/leads" className="chart-card__link">
                Ver detalhes <FiArrowRight />
              </Link>
            </div>
            <div className="chart-card__body">
              {loading ? (
                <div className="chart-skeleton">
                  <div className="skeleton skeleton--chart"></div>
                </div>
              ) : (
                <LeadsChart />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Activity Section */}
      <section className="dashboard-section">
        <div className="activity-grid">
          {/* Próximos Eventos */}
          <div className="activity-card">
            <div className="activity-card__header">
              <div className="activity-card__title">
                <FiCalendar className="activity-card__icon" />
                <h3>Próximos Eventos</h3>
              </div>
              <Link to="/calendario" className="activity-card__link">
                Ver todos <FiArrowRight size={14} />
              </Link>
            </div>
            <div className="activity-card__body">
              {loading ? (
                <div className="activity-list">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="activity-item">
                      <div className="skeleton skeleton--text" style={{ width: '60%' }}></div>
                      <div className="skeleton skeleton--text" style={{ width: '30%' }}></div>
                    </div>
                  ))}
                </div>
              ) : proximosEventos.length > 0 ? (
                <ul className="activity-list">
                  {proximosEventos.map((evento) => (
                    <li key={evento.id} className="activity-item">
                      <div className="activity-item__content">
                        <span className="activity-item__title">{evento.title}</span>
                        {evento.local && (
                          <span className="activity-item__subtitle">{evento.local}</span>
                        )}
                      </div>
                      <span className="activity-item__date">
                        {formatRelativeDate(evento.start)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <FiCalendar size={48} />
                  <p>Nenhum evento futuro</p>
                </div>
              )}
            </div>
          </div>

          {/* Últimos Posts */}
          <div className="activity-card">
            <div className="activity-card__header">
              <div className="activity-card__title">
                <FiFileText className="activity-card__icon" />
                <h3>Últimos Posts do Blog</h3>
              </div>
              <Link to="/marketing/blog" className="activity-card__link">
                Ver todos <FiArrowRight size={14} />
              </Link>
            </div>
            <div className="activity-card__body">
              {loading ? (
                <div className="activity-list">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="activity-item">
                      <div className="skeleton skeleton--text" style={{ width: '70%' }}></div>
                      <div className="skeleton skeleton--text" style={{ width: '25%' }}></div>
                    </div>
                  ))}
                </div>
              ) : ultimosPosts.length > 0 ? (
                <ul className="activity-list">
                  {ultimosPosts.map((post) => (
                    <li key={post.id} className="activity-item">
                      <div className="activity-item__content">
                        <span className="activity-item__title">{post.titulo}</span>
                        {post.status && (
                          <span className={`activity-item__badge activity-item__badge--${post.status}`}>
                            {post.status}
                          </span>
                        )}
                      </div>
                      <span className="activity-item__date">{formatDate(post.data)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <FiFileText size={48} />
                  <p>Nenhum post no blog</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuperDashboardPage;
