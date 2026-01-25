import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNotification } from '../../hooks/useNotification';
import { handleError } from '../../utils/errorHandler';
import Header from '../../components/layout/Header';
import {
  FiExternalLink,
  FiFolder,
  FiSearch,
  FiBookmark,
  FiTrendingUp,
  FiUsers,
  FiSettings,
  FiBook,
  FiMail,
  FiVideo,
  FiAlertCircle,
  FiCheckCircle,
  FiCalendar,
} from 'react-icons/fi';
import './LinksPage.css';

// Ícones para categorias
const CATEGORY_ICONS = {
  ajuda: FiBookmark,
  retiro: FiUsers,
  financeiro: FiTrendingUp,
  marketing: FiMail,
  config: FiSettings,
  recursos: FiBook,
  videos: FiVideo,
  default: FiFolder,
};

const LinksPage = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [stats, setStats] = useState({
    inscricoesAtivas: 0,
    proximosRetiros: [],
    linksAjuda: []
  });
  const { showError } = useNotification();

  useEffect(() => {
    fetchLinks();
    fetchStats();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const linksQuery = query(
        collection(db, 'links'),
        orderBy('categoria'),
        orderBy('titulo')
      );
      const snapshot = await getDocs(linksQuery);

      const linksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLinks(linksData);
    } catch (error) {
      handleError(error, showError);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Buscar inscritos não pagos (inscrições ativas)
      const inscritosSnap = await getDocs(
        query(collection(db, 'retiroInscritos'), where('pago', '==', false))
      );
      const inscricoesAtivas = inscritosSnap.size;

      // Buscar próximos eventos
      const agora = new Date();
      const eventosSnap = await getDocs(
        query(
          collection(db, 'calendarioEventos'),
          orderBy('data', 'asc')
        )
      );

      const proximosRetiros = eventosSnap.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          data: doc.data().data?.toDate()
        }))
        .filter(evento => {
          return evento.data && evento.data >= agora &&
                 evento.titulo?.toLowerCase().includes('retiro');
        })
        .slice(0, 3);

      // Filtrar links de ajuda
      const linksAjuda = links.filter(link =>
        link.categoria === 'ajuda' ||
        link.titulo?.toLowerCase().includes('ajuda') ||
        link.titulo?.toLowerCase().includes('suporte')
      ).slice(0, 4);

      setStats({
        inscricoesAtivas,
        proximosRetiros,
        linksAjuda
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  // Agrupar links por categoria
  const linksByCategory = links.reduce((acc, link) => {
    const cat = link.categoria || 'outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(link);
    return acc;
  }, {});

  // Filtrar por categoria e busca
  const filteredCategories = Object.entries(linksByCategory).filter(([cat]) => {
    if (selectedCategory !== 'todos' && cat !== selectedCategory) return false;
    return true;
  });

  const filteredLinks = filteredCategories.map(([cat, catLinks]) => {
    const filtered = catLinks.filter((link) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        link.titulo?.toLowerCase().includes(searchLower) ||
        link.descricao?.toLowerCase().includes(searchLower) ||
        link.url?.toLowerCase().includes(searchLower)
      );
    });
    return [cat, filtered];
  }).filter(([, catLinks]) => catLinks.length > 0);

  const categories = ['todos', ...Object.keys(linksByCategory)];

  const getCategoryIcon = (category) => {
    const Icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.default;
    return Icon;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      todos: 'Todos',
      ajuda: 'Ajuda',
      retiro: 'Retiro',
      financeiro: 'Financeiro',
      marketing: 'Marketing',
      config: 'Configuração',
      recursos: 'Recursos',
      videos: 'Vídeos',
      outros: 'Outros',
    };
    return labels[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="links-page">
      <Header
        title="Links Rápidos"
        subtitle="Acesso rápido a recursos, ferramentas e páginas importantes."
      />

      {/* Cards de Informação Rápida */}
      <div className="links-quick-info">
        <div className="quick-info-card quick-info-card--primary">
          <div className="quick-info-card__icon">
            <FiUsers size={28} />
          </div>
          <div className="quick-info-card__content">
            <h3 className="quick-info-card__title">Inscrições Ativas</h3>
            <p className="quick-info-card__value">{stats.inscricoesAtivas}</p>
            <p className="quick-info-card__subtitle">Aguardando confirmação</p>
          </div>
        </div>

        <div className="quick-info-card quick-info-card--success">
          <div className="quick-info-card__icon">
            <FiCalendar size={28} />
          </div>
          <div className="quick-info-card__content">
            <h3 className="quick-info-card__title">Próximos Retiros</h3>
            <p className="quick-info-card__value">{stats.proximosRetiros.length}</p>
            <p className="quick-info-card__subtitle">
              {stats.proximosRetiros[0]?.titulo || 'Nenhum programado'}
            </p>
          </div>
        </div>

        <div className="quick-info-card quick-info-card--warning">
          <div className="quick-info-card__icon">
            <FiAlertCircle size={28} />
          </div>
          <div className="quick-info-card__content">
            <h3 className="quick-info-card__title">Links de Ajuda</h3>
            <p className="quick-info-card__value">{stats.linksAjuda.length}</p>
            <p className="quick-info-card__subtitle">Recursos disponíveis</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="links-toolbar">
        <div className="links-search">
          <FiSearch className="links-search__icon" />
          <input
            type="text"
            className="links-search__input"
            placeholder="Buscar links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="links-categories">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat);
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                className={`category-btn ${isActive ? 'category-btn--active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <Icon size={16} />
                {getCategoryLabel(cat)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Links Grid */}
      <div className="links-content">
        {loading ? (
          <div className="links-loading">
            <div className="spinner"></div>
            <p>Carregando links...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="links-empty">
            <FiBookmark size={64} />
            <h3>Nenhum link encontrado</h3>
            <p>
              {searchTerm
                ? 'Tente ajustar sua busca'
                : 'Nenhum link cadastrado nesta categoria'}
            </p>
          </div>
        ) : (
          filteredLinks.map(([category, categoryLinks]) => (
            <div key={category} className="links-category-section">
              <div className="links-category-header">
                {React.createElement(getCategoryIcon(category), {
                  size: 20,
                  className: 'links-category-icon',
                })}
                <h2 className="links-category-title">{getCategoryLabel(category)}</h2>
                <span className="links-category-count">{categoryLinks.length}</span>
              </div>

              <div className="links-grid">
                {categoryLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-card-item"
                  >
                    <div className="link-card-item__icon">
                      <FiExternalLink size={20} />
                    </div>
                    <div className="link-card-item__content">
                      <h3 className="link-card-item__title">{link.titulo}</h3>
                      {link.descricao && (
                        <p className="link-card-item__description">{link.descricao}</p>
                      )}
                      <span className="link-card-item__url">{link.url}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LinksPage;
