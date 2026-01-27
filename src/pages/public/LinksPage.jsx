import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNotification } from '../../hooks/useNotification';
import { handleError } from '../../utils/errorHandler';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
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
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
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
  const { user } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const { showError, showSuccess } = useNotification();

  // Estados para gerenciamento
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    url: '',
    categoria: 'ajuda'
  });

  const isAdmin = user?.isAdmin || false;

  useEffect(() => {
    fetchLinks();
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

  const handleAddNew = () => {
    setEditingLink(null);
    setFormData({
      titulo: '',
      descricao: '',
      url: '',
      categoria: 'ajuda'
    });
    setShowForm(true);
  };

  const handleEdit = (link, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingLink(link);
    setFormData({
      titulo: link.titulo || '',
      descricao: link.descricao || '',
      url: link.url || '',
      categoria: link.categoria || 'ajuda'
    });
    setShowForm(true);
  };

  const handleDelete = async (linkId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Tem certeza que deseja excluir este link?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'links', linkId));
      showSuccess('Link excluído com sucesso!');
      fetchLinks();
    } catch (error) {
      handleError(error, showError);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo || !formData.url) {
      showError('Título e URL são obrigatórios');
      return;
    }

    try {
      if (editingLink) {
        await updateDoc(doc(db, 'links', editingLink.id), formData);
        showSuccess('Link atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'links'), formData);
        showSuccess('Link adicionado com sucesso!');
      }
      setShowForm(false);
      fetchLinks();
    } catch (error) {
      handleError(error, showError);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLink(null);
    setFormData({
      titulo: '',
      descricao: '',
      url: '',
      categoria: 'ajuda'
    });
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

      {/* Search and Filter Bar */}
      <div className="links-toolbar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#1e293b' }}>Filtros</h3>
          {isAdmin && (
            <Button className="btn-primary" onClick={handleAddNew}>
              <FiPlus /> Adicionar Link
            </Button>
          )}
        </div>

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

      {/* Form Modal */}
      {showForm && (
        <div className="link-form-modal-overlay" onClick={handleCancel}>
          <div className="link-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="link-form-header">
              <h3>{editingLink ? 'Editar Link' : 'Adicionar Novo Link'}</h3>
              <button className="link-form-close" onClick={handleCancel}>
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="link-form-body">
              <div className="form-group">
                <label htmlFor="titulo">Título *</label>
                <input
                  type="text"
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                  placeholder="Nome do link"
                />
              </div>

              <div className="form-group">
                <label htmlFor="url">URL *</label>
                <input
                  type="url"
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                  placeholder="https://exemplo.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="descricao">Descrição</label>
                <textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Breve descrição do link"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoria">Categoria *</label>
                <select
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  required
                >
                  <option value="ajuda">Ajuda</option>
                  <option value="retiro">Retiro</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="marketing">Marketing</option>
                  <option value="config">Configuração</option>
                  <option value="recursos">Recursos</option>
                  <option value="videos">Vídeos</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div className="form-actions">
                <Button type="button" className="btn-secondary" onClick={handleCancel}>
                  <FiX /> Cancelar
                </Button>
                <Button type="submit" className="btn-primary">
                  <FiSave /> {editingLink ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <div key={link.id} className="link-card-wrapper">
                    <a
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
                    {isAdmin && (
                      <div className="link-card-actions">
                        <button
                          className="link-action-btn link-action-btn--edit"
                          onClick={(e) => handleEdit(link, e)}
                          title="Editar"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          className="link-action-btn link-action-btn--delete"
                          onClick={(e) => handleDelete(link.id, e)}
                          title="Excluir"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
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
