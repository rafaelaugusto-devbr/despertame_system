// src/pages/marketing/MediaManagerPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import { FiImage, FiTrash2, FiCopy, FiExternalLink, FiFolder, FiRefreshCw, FiUpload } from 'react-icons/fi';
import {
  listFiles,
  uploadFile,
  deleteFile,
  formatFileSize,
  isImageFile,
  BUCKETS,
} from '../../services/storageApi';
import { useModal } from '../../contexts/ModalContext';
import '../tesouraria/Financeiro.css';

const MediaManagerPage = () => {
  const { showModal } = useModal();
  const [blogFiles, setBlogFiles] = useState([]);
  const [logoFiles, setLogoFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [filter, setFilter] = useState('todas'); // 'todas', 'blog', 'logo'

  useEffect(() => {
    loadMedias();
  }, []);

  const loadMedias = async () => {
    try {
      setLoading(true);

      // Load blog
      const blogData = await listFiles(BUCKETS.BLOG);
      setBlogFiles(blogData.files || []);

      // Load logo
      const logoData = await listFiles(BUCKETS.LOGO);
      setLogoFiles(logoData.files || []);
    } catch (error) {
      console.error('Erro ao carregar mídias:', error);
      showModal({
        title: 'Erro ao Carregar Mídias',
        message: 'Erro ao carregar mídias: ' + error.message,
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!fileToUpload || !selectedBucket) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      await uploadFile(selectedBucket, fileToUpload, (progress) => {
        setUploadProgress(progress);
      });

      showModal({
        title: 'Sucesso',
        message: 'Mídia enviada com sucesso!',
        type: 'info'
      });
      setShowUploadModal(false);
      setFileToUpload(null);
      setSelectedBucket('');
      setUploadProgress(0);
      await loadMedias();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      showModal({
        title: 'Erro ao Fazer Upload',
        message: 'Erro ao fazer upload: ' + error.message,
        type: 'danger'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (bucketName, filename) => {
    showModal({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir "${filename}"?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteFile(bucketName, filename);
          showModal({
            title: 'Sucesso',
            message: 'Mídia excluída com sucesso!',
            type: 'info'
          });
          await loadMedias();
        } catch (error) {
          console.error('Erro ao deletar mídia:', error);
          showModal({
            title: 'Erro ao Deletar Mídia',
            message: 'Erro ao deletar mídia: ' + error.message,
            type: 'danger'
          });
        }
      }
    });
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      showModal({
        title: 'Sucesso',
        message: 'URL copiada para a área de transferência!',
        type: 'info'
      });
    }).catch(err => {
      console.error('Erro ao copiar URL:', err);
      showModal({
        title: 'Erro',
        message: 'Erro ao copiar URL. Tente novamente.',
        type: 'danger'
      });
    });
  };

  const getFilteredFiles = () => {
    if (filter === 'blog') return blogFiles.map(f => ({ ...f, bucket: BUCKETS.BLOG }));
    if (filter === 'logo') return logoFiles.map(f => ({ ...f, bucket: BUCKETS.LOGO }));
    return [
      ...blogFiles.map(f => ({ ...f, bucket: BUCKETS.BLOG })),
      ...logoFiles.map(f => ({ ...f, bucket: BUCKETS.LOGO }))
    ];
  };

  const filteredFiles = getFilteredFiles();

  return (
    <>
      <Header
        title="Galeria de Mídia"
        subtitle="Gerencie imagens do blog e logos do sistema"
      />

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card stat-card--blue">
          <div className="stat-card__icon">
            <FiImage size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Blog</h4>
            <p className="stat-card__value">{blogFiles.length}</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.5rem 0 0' }}>
              imagens
            </p>
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__icon">
            <FiFolder size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Logo</h4>
            <p className="stat-card__value">{logoFiles.length}</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.5rem 0 0' }}>
              arquivos
            </p>
          </div>
        </div>

        <div className="stat-card stat-card--orange">
          <div className="stat-card__icon">
            <FiImage size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Total</h4>
            <p className="stat-card__value">{blogFiles.length + logoFiles.length}</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.5rem 0 0' }}>
              arquivos
            </p>
          </div>
        </div>
      </div>

      {/* Actions and Filters */}
      <div className="link-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Filtros</h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn-secondary"
              onClick={loadMedias}
              disabled={loading}
            >
              <FiRefreshCw className={loading ? 'spinning' : ''} />
              Atualizar
            </button>
            <button
              className="btn-primary"
              onClick={() => setShowUploadModal(true)}
            >
              <FiUpload />
              Upload Mídia
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className={filter === 'todas' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setFilter('todas')}
          >
            Todas ({blogFiles.length + logoFiles.length})
          </button>
          <button
            className={filter === 'blog' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setFilter('blog')}
          >
            <FiImage /> Blog ({blogFiles.length})
          </button>
          <button
            className={filter === 'logo' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setFilter('logo')}
          >
            <FiFolder /> Logo ({logoFiles.length})
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="link-card">
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <FiRefreshCw className="spinning" size={32} style={{ color: '#3b82f6' }} />
            <p style={{ marginTop: '1rem', color: '#64748b' }}>Carregando mídias...</p>
          </div>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="link-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <FiImage size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
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
          {filteredFiles.map((file) => (
            <div
              key={`${file.bucket}-${file.key}`}
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
                {isImageFile(file.key) ? (
                  <img
                    src={file.url}
                    alt={file.key}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div style="color: #94a3b8; text-align: center; padding: 1rem;"><i>Imagem não disponível</i></div>';
                    }}
                  />
                ) : (
                  <FiImage size={48} style={{ color: '#cbd5e1' }} />
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: file.bucket === BUCKETS.BLOG ? '#dbeafe' : '#dcfce7',
                      color: file.bucket === BUCKETS.BLOG ? '#1e40af' : '#166534',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '4px'
                    }}
                  >
                    {file.bucket}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={file.key}
                >
                  {file.key}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                    {formatFileSize(file.size)}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                    {file.uploaded
                      ? new Date(file.uploaded).toLocaleString('pt-BR')
                      : '-'}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleCopyUrl(file.url)}
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
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    title="Copiar URL"
                  >
                    <FiCopy size={14} /> Copiar URL
                  </button>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.5rem',
                      background: '#64748b',
                      color: '#fff',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                    title="Abrir em nova aba"
                  >
                    <FiExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => handleDelete(file.bucket, file.key)}
                    className="btn-icon delete"
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => !uploading && setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload de Mídia</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Selecione a Pasta
              </label>
              <select
                className="input-field"
                value={selectedBucket}
                onChange={(e) => setSelectedBucket(e.target.value)}
                disabled={uploading}
                style={{ marginBottom: '1rem' }}
              >
                <option value="">Escolha uma pasta...</option>
                <option value={BUCKETS.BLOG}>Blog</option>
                <option value={BUCKETS.LOGO}>Logo</option>
              </select>

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Selecione o Arquivo
              </label>
              <input
                type="file"
                className="input-field"
                onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                disabled={uploading}
                style={{ marginBottom: '1rem' }}
                accept="image/*"
              />

              {fileToUpload && (
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                    <strong>Arquivo selecionado:</strong> {fileToUpload.name}
                  </p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                    <strong>Tamanho:</strong> {formatFileSize(fileToUpload.size)}
                  </p>
                </div>
              )}

              {uploading && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Enviando...</span>
                    <span style={{ fontSize: '0.875rem', color: '#3b82f6', fontWeight: 600 }}>
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                        width: `${uploadProgress}%`,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={!fileToUpload || !selectedBucket || uploading}
              >
                <FiUpload />
                {uploading ? 'Enviando...' : 'Enviar Mídia'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .btn-icon.delete {
          color: #ef4444;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon.delete:hover {
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </>
  );
};

export default MediaManagerPage;
