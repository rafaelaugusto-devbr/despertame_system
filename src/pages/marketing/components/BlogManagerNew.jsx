// BlogManager - Versão Fullscreen com controles de tamanho

import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';

import BlockEditor from './BlockEditor';
import './BlogManager.css';

import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiImage,
  FiSearch,
  FiFileText,
  FiSave,
  FiEye
} from 'react-icons/fi';

const BlogManager = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const [currentPost, setCurrentPost] = useState({
    id: null,
    titulo: '',
    resumo: '',
    imagemUrl: '',
    videoUrl: '',
    blocks: [],
    status: 'rascunho'
  });

  const postsCollectionRef = collection(db, 'posts');

  // Fetch posts
  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter posts
  useEffect(() => {
    let filtered = [...posts];

    if (searchTerm.trim()) {
      filtered = filtered.filter(post =>
        post.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.resumo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(post =>
        (post.status || 'publicado') === statusFilter
      );
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, statusFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    const q = query(postsCollectionRef, orderBy('data', 'desc'));
    const data = await getDocs(q);
    const postsData = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setPosts(postsData);
    setFilteredPosts(postsData);
    setLoading(false);
  };

  const resetForm = () => {
    setCurrentPost({
      id: null,
      titulo: '',
      resumo: '',
      imagemUrl: '',
      videoUrl: '',
      blocks: [],
      status: 'rascunho'
    });
    setIsEditorOpen(false);
  };

  const handleEdit = (post) => {
    setCurrentPost({
      id: post.id,
      titulo: post.titulo || '',
      resumo: post.resumo || '',
      imagemUrl: post.imagemUrl || '',
      videoUrl: post.videoUrl || '',
      blocks: post.blocks || [],
      status: post.status || 'publicado',
      data: post.data
    });
    setIsEditorOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.')) {
      try {
        const postDoc = doc(db, 'posts', id);
        await deleteDoc(postDoc);
        setPosts(posts.filter(p => p.id !== id));
      } catch (error) {
        console.error('Erro ao excluir post:', error);
        alert('Erro ao excluir post. Tente novamente.');
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const postData = {
      titulo: currentPost.titulo,
      resumo: currentPost.resumo,
      imagemUrl: currentPost.imagemUrl,
      videoUrl: currentPost.videoUrl,
      blocks: currentPost.blocks,
      status: currentPost.status,
      data: currentPost.id ? currentPost.data : serverTimestamp()
    };

    try {
      if (currentPost.id) {
        const postDoc = doc(db, 'posts', currentPost.id);
        await updateDoc(postDoc, postData);
      } else {
        await addDoc(postsCollectionRef, postData);
      }

      await fetchPosts();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      alert('Erro ao salvar post. Tente novamente.');
    }

    setLoading(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data não disponível';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Se o editor está aberto, mostra tela cheia
  if (isEditorOpen) {
    return (
      <div className="blog-editor-fullscreen">
        {/* Header Fixo */}
        <div className="blog-editor-fullscreen__header">
          <div className="blog-editor-fullscreen__header-left">
            <button
              type="button"
              className="blog-editor-fullscreen__back-btn"
              onClick={resetForm}
            >
              <FiX size={20} /> Voltar
            </button>
            <h1 className="blog-editor-fullscreen__title">
              {currentPost.id ? 'Editar Post' : 'Novo Post'}
            </h1>
          </div>
          <div className="blog-editor-fullscreen__header-right">
            <select
              className="blog-editor-fullscreen__status-select"
              value={currentPost.status}
              onChange={(e) => setCurrentPost({...currentPost, status: e.target.value})}
            >
              <option value="rascunho">💾 Rascunho</option>
              <option value="publicado">✅ Publicado</option>
            </select>
            <button
              type="button"
              className="blog-editor-fullscreen__save-btn"
              onClick={handleSubmit}
              disabled={loading || !currentPost.titulo.trim()}
            >
              <FiSave size={18} />
              {loading ? 'Salvando...' : 'Salvar Post'}
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="blog-editor-fullscreen__content">
          <div className="blog-editor-fullscreen__sidebar">
            <h3>Informações do Post</h3>

            <div className="blog-editor-fullscreen__field">
              <label>
                <FiFileText size={16} />
                Título *
              </label>
              <input
                type="text"
                placeholder="Digite o título do post"
                value={currentPost.titulo}
                onChange={(e) => setCurrentPost({...currentPost, titulo: e.target.value})}
                required
              />
            </div>

            <div className="blog-editor-fullscreen__field">
              <label>Resumo</label>
              <textarea
                placeholder="Breve descrição (aparece nas listagens)"
                value={currentPost.resumo}
                onChange={(e) => setCurrentPost({...currentPost, resumo: e.target.value})}
                rows={3}
              />
            </div>

            <div className="blog-editor-fullscreen__field">
              <label>
                <FiImage size={16} />
                Imagem Destacada
              </label>
              <input
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                value={currentPost.imagemUrl}
                onChange={(e) => setCurrentPost({...currentPost, imagemUrl: e.target.value})}
              />
              {currentPost.imagemUrl && (
                <img
                  src={currentPost.imagemUrl}
                  alt="Preview"
                  className="blog-editor-fullscreen__image-preview"
                />
              )}
            </div>

            <div className="blog-editor-fullscreen__field">
              <label>URL do Vídeo</label>
              <input
                type="url"
                placeholder="https://youtube.com/..."
                value={currentPost.videoUrl}
                onChange={(e) => setCurrentPost({...currentPost, videoUrl: e.target.value})}
              />
            </div>
          </div>

          <div className="blog-editor-fullscreen__main">
            <BlockEditor
              initialBlocks={currentPost.blocks}
              onChange={(blocks) => setCurrentPost({...currentPost, blocks})}
            />
          </div>
        </div>
      </div>
    );
  }

  // Lista de posts
  return (
    <div className="blog-manager">
      {/* Header */}
      <div className="blog-manager__header">
        <h1 className="blog-manager__title">Posts do Blog</h1>
        <button
          className="btn btn-primary"
          onClick={() => setIsEditorOpen(true)}
        >
          <FiPlus /> Novo Post
        </button>
      </div>

      {/* Filters */}
      <div className="blog-filters">
        <div className="blog-filters__search">
          <FiSearch className="blog-filters__search-icon" size={18} />
          <input
            type="text"
            className="blog-filters__search-input"
            placeholder="Buscar posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="blog-filters__status">
          <button
            className={`blog-filters__status-btn ${statusFilter === 'todos' ? 'blog-filters__status-btn--active' : ''}`}
            onClick={() => setStatusFilter('todos')}
          >
            Todos ({posts.length})
          </button>
          <button
            className={`blog-filters__status-btn ${statusFilter === 'publicado' ? 'blog-filters__status-btn--active' : ''}`}
            onClick={() => setStatusFilter('publicado')}
          >
            Publicados ({posts.filter(p => (p.status || 'publicado') === 'publicado').length})
          </button>
          <button
            className={`blog-filters__status-btn ${statusFilter === 'rascunho' ? 'blog-filters__status-btn--active' : ''}`}
            onClick={() => setStatusFilter('rascunho')}
          >
            Rascunhos ({posts.filter(p => p.status === 'rascunho').length})
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="posts-list">
        {loading ? (
          <div className="posts-list__empty">
            <p>Carregando posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="posts-list__empty">
            <FiFileText className="posts-list__empty-icon" size={64} />
            <p className="posts-list__empty-text">
              {searchTerm || statusFilter !== 'todos'
                ? 'Nenhum post encontrado com os filtros selecionados.'
                : 'Nenhum post criado ainda. Clique em "Novo Post" para começar.'}
            </p>
          </div>
        ) : (
          <table className="posts-list__table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}></th>
                <th>Título</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ width: '140px' }}>Data</th>
                <th style={{ width: '100px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id}>
                  <td>
                    {post.imagemUrl ? (
                      <img
                        src={post.imagemUrl}
                        alt={post.titulo}
                        className="post-item__thumbnail"
                      />
                    ) : (
                      <div className="post-item__thumbnail">
                        <FiImage size={24} />
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="post-item__title-wrapper">
                      <h3 className="post-item__title">
                        <span
                          className="post-item__title-link"
                          onClick={() => handleEdit(post)}
                          style={{ cursor: 'pointer' }}
                        >
                          {post.titulo}
                        </span>
                      </h3>
                      {post.resumo && (
                        <p className="post-item__excerpt">{post.resumo}</p>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`post-item__status post-item__status--${post.status || 'publicado'}`}>
                      <span className="post-item__status-dot"></span>
                      {post.status === 'rascunho' ? 'Rascunho' : 'Publicado'}
                    </span>
                  </td>
                  <td>
                    <span className="post-item__date">{formatDate(post.data)}</span>
                  </td>
                  <td>
                    <div className="post-item__actions">
                      <button
                        className="post-item__action-btn post-item__action-btn--edit"
                        onClick={() => handleEdit(post)}
                        title="Editar"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        className="post-item__action-btn post-item__action-btn--delete"
                        onClick={() => handleDelete(post.id)}
                        title="Excluir"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BlogManager;
