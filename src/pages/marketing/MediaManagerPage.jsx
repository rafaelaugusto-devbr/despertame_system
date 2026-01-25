import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { deleteDocument as deleteDocumentApi } from '../../services/documentApi';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import { FiImage, FiTrash2, FiCopy, FiExternalLink, FiAlertCircle, FiFolder } from 'react-icons/fi';
import '../tesouraria/Financeiro.css';

const MediaManagerPage = () => {
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas'); // 'todas', 'blog-images', 'tesouraria'

  useEffect(() => {
    fetchMedias();
  }, []);

  const fetchMedias = async () => {
    setLoading(true);
    try {
      // Fetch from both collections that might have uploaded files
      const [tesourariaSnap, blogImagesSnap] = await Promise.all([
        getDocs(collection(db, 'tesourariaDocumentos')),
        // You might want to create a dedicated 'mediaLibrary' collection
        // For now, we'll get blog images from tesourariaDocumentos with pasta filter
        getDocs(query(
          collection(db, 'tesourariaDocumentos'),
          where('pasta', '==', 'blog-images'),
          orderBy('createdAt', 'desc')
        ))
      ]);

      const allMedias = [];

      // Process tesouraria documents (filter only images)
      tesourariaSnap.forEach(docSnap => {
        const data = docSnap.data();
        if (data.fileType?.startsWith('image/') || data.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          allMedias.push({
            id: docSnap.id,
            ...data,
            source: data.pasta || 'tesouraria'
          });
        }
      });

      setMedias(allMedias.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      }));
    } catch (error) {
      console.error('Erro ao buscar mídias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (media) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${media.titulo || media.fileName}"?`)) {
      return;
    }

    try {
      // Delete from Cloudflare if cloudflareId exists
      if (media.cloudflareId) {
        try {
          await deleteDocumentApi(media.cloudflareId);
        } catch (apiError) {
          console.error('Erro ao deletar do Cloudflare:', apiError);
        }
      }

      // Delete from Firebase
      await deleteDoc(doc(db, 'tesourariaDocumentos', media.id));
      await fetchMedias();
    } catch (error) {
      console.error('Erro ao excluir mídia:', error);
      alert(`Erro ao excluir mídia: ${error.message}`);
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('URL copiada para a área de transferência!');
    }).catch(err => {
      console.error('Erro ao copiar URL:', err);
      alert('Erro ao copiar URL. Tente novamente.');
    });
  };

  const getFilteredMedias = () => {
    if (filter === 'todas') return medias;
    return medias.filter(m => m.source === filter || m.pasta === filter);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return timestamp.toDate().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const filteredMedias = getFilteredMedias();

  return (
    <>
      <Header
        title="Galeria de Mídia"
        subtitle="Gerencie todas as imagens e arquivos enviados para o sistema"
      />

      {/* Filters */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button
          className={filter === 'todas' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setFilter('todas')}
        >
          Todas ({medias.length})
        </Button>
        <Button
          className={filter === 'blog-images' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setFilter('blog-images')}
        >
          <FiImage /> Blog ({medias.filter(m => m.pasta === 'blog-images').length})
        </Button>
        <Button
          className={filter === 'tesouraria' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setFilter('tesouraria')}
        >
          <FiFolder /> Tesouraria ({medias.filter(m => m.pasta === 'tesouraria' || m.source === 'tesouraria').length})
        </Button>
      </div>

      {loading ? (
        <p>Carregando mídias...</p>
      ) : filteredMedias.length === 0 ? (
        <div className="link-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <FiAlertCircle size={48} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
          <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>
            {filter === 'todas'
              ? 'Nenhuma mídia encontrada'
              : `Nenhuma mídia encontrada na pasta "${filter}"`}
          </h3>
          <p style={{ color: '#94a3b8' }}>
            As imagens enviadas aparecerão aqui.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {filteredMedias.map((media) => (
            <div
              key={media.id}
              className="link-card"
              style={{ padding: '0', overflow: 'hidden', position: 'relative' }}
            >
              {/* Image */}
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {media.url ? (
                  <img
                    src={media.url}
                    alt={media.titulo || media.fileName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div style="color: #94a3b8; text-align: center;"><i>Imagem não disponível</i></div>';
                    }}
                  />
                ) : (
                  <FiImage size={48} style={{ color: '#cbd5e1' }} />
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '1rem' }}>
                <h3
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={media.titulo || media.fileName}
                >
                  {media.titulo || media.fileName}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
                  {media.pasta && (
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiFolder size={12} /> {media.pasta}
                    </p>
                  )}
                  {media.fileSize && (
                    <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                      {(media.fileSize / 1024).toFixed(2)} KB
                    </p>
                  )}
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                    {formatDate(media.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleCopyUrl(media.url)}
                    className="icon-btn"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      background: '#3b82f6',
                      color: '#fff',
                      fontSize: '0.875rem',
                      borderRadius: '6px'
                    }}
                    title="Copiar URL"
                  >
                    <FiCopy size={14} /> Copiar URL
                  </button>
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="icon-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.5rem',
                      background: '#64748b',
                      color: '#fff',
                      borderRadius: '6px',
                      textDecoration: 'none'
                    }}
                    title="Abrir em nova aba"
                  >
                    <FiExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => handleDelete(media)}
                    className="icon-btn delete"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px'
                    }}
                    title="Excluir"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MediaManagerPage;
