// src/pages/marketing/components/BlogManager.jsx

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

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './BlogManager.css';

import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiImage,
  FiSearch,
  FiFileText
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
    conteudo: '',
    status: 'rascunho' // publicado ou rascunho
  });

  const postsCollectionRef = collection(db, 'posts');

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  // Fetch posts
  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter posts
  useEffect(() => {
    let filtered = [...posts];

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(post =>
        post.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.resumo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
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
      conteudo: '',
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
      conteudo: post.conteudo || '',
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
    e.preventDefault();
    setLoading(true);

    const postData = {
      titulo: currentPost.titulo,
      resumo: currentPost.resumo,
      imagemUrl: currentPost.imagemUrl,
      videoUrl: currentPost.videoUrl,
      conteudo: currentPost.conteudo,
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

  const getExcerpt = (html, maxLength = 100) => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="blog-manager">
      {/* Header */}
      <div className="blog-manager__header">
        <h1 className="blog-manager__title">Posts do Blog</h1>
        <div className="blog-manager__actions">
          <button
            className="btn btn-primary"
            onClick={() => setIsEditorOpen(true)}
          >
            <FiPlus /> Novo Post
          </button>
        </div>
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

      {/* Post Editor (Slide Panel) */}
      {isEditorOpen && (
        <>
          <div className="post-editor-overlay" onClick={resetForm}></div>
          <div className="post-editor">
            <div className="post-editor__header">
              <h2 className="post-editor__title">
                {currentPost.id ? 'Editar Post' : 'Novo Post'}
              </h2>
              <button className="post-editor__close" onClick={resetForm}>
                <FiX size={24} />
              </button>
            </div>

            <div className="post-editor__body">
              <form onSubmit={handleSubmit} className="post-editor__form">
                <div className="post-editor__field">
                  <label className="post-editor__label post-editor__label--required">
                    <FiFileText size={16} />
                    Título do Post
                  </label>
                  <input
                    type="text"
                    className="post-editor__input"
                    placeholder="Digite o título do post"
                    value={currentPost.titulo}
                    onChange={(e) => setCurrentPost({...currentPost, titulo: e.target.value})}
                    required
                  />
                </div>

                <div className="post-editor__field">
                  <label className="post-editor__label">
                    Resumo / Excerto
                  </label>
                  <textarea
                    className="post-editor__textarea"
                    placeholder="Breve descrição do post (aparece nas listagens)"
                    value={currentPost.resumo}
                    onChange={(e) => setCurrentPost({...currentPost, resumo: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="post-editor__field">
                  <label className="post-editor__label">
                    <FiImage size={16} />
                    URL da Imagem Destacada
                  </label>
                  <input
                    type="url"
                    className="post-editor__input"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={currentPost.imagemUrl}
                    onChange={(e) => setCurrentPost({...currentPost, imagemUrl: e.target.value})}
                  />
                  {currentPost.imagemUrl && (
                    <img
                      src={currentPost.imagemUrl}
                      alt="Preview"
                      style={{
                        maxWidth: '200px',
                        height: 'auto',
                        borderRadius: '8px',
                        marginTop: '0.5rem'
                      }}
                    />
                  )}
                </div>

                <div className="post-editor__field">
                  <label className="post-editor__label">
                    URL do Vídeo (opcional)
                  </label>
                  <input
                    type="url"
                    className="post-editor__input"
                    placeholder="https://youtube.com/..."
                    value={currentPost.videoUrl}
                    onChange={(e) => setCurrentPost({...currentPost, videoUrl: e.target.value})}
                  />
                </div>

                <div className="post-editor__field">
                  <label className="post-editor__label post-editor__label--required">
                    Conteúdo do Post
                  </label>
                  <div className="post-editor__quill">
                    <ReactQuill
                      theme="snow"
                      value={currentPost.conteudo}
                      onChange={(content) => setCurrentPost({...currentPost, conteudo: content})}
                      modules={quillModules}
                      placeholder="Escreva o conteúdo do seu post aqui..."
                    />
                  </div>
                </div>

                <div className="post-editor__field">
                  <label className="post-editor__label">
                    Status
                  </label>
                  <select
                    className="post-editor__input"
                    value={currentPost.status}
                    onChange={(e) => setCurrentPost({...currentPost, status: e.target.value})}
                  >
                    <option value="rascunho">Salvar como Rascunho</option>
                    <option value="publicado">Publicar</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="post-editor__footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Salvando...' : (currentPost.id ? 'Atualizar Post' : 'Criar Post')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BlogManager;
