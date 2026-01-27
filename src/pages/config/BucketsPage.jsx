// src/pages/config/BucketsPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import {
  listAllBuckets,
  uploadFile,
  deleteFile,
  formatFileSize,
  isImageFile,
  BUCKETS,
} from '../../services/storageApi';
import { FiRefreshCw, FiUpload, FiTrash2, FiExternalLink, FiFolder, FiFile, FiImage } from 'react-icons/fi';
import '../tesouraria/Financeiro.css';

const BucketsPage = () => {
  const [bucketsData, setBucketsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);

  useEffect(() => {
    loadAllBuckets();
  }, []);

  const loadAllBuckets = async () => {
    try {
      setLoading(true);
      const data = await listAllBuckets();
      setBucketsData(data);
    } catch (error) {
      console.error('Erro ao carregar buckets:', error);
      alert('Erro ao carregar arquivos: ' + error.message);
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

      alert('✓ Arquivo enviado com sucesso!');
      setShowUploadModal(false);
      setFileToUpload(null);
      setSelectedBucket('');
      setUploadProgress(0);
      await loadAllBuckets();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('✗ Erro ao fazer upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (bucketName, filename) => {
    if (!confirm(`Tem certeza que deseja excluir "${filename}"?`)) return;

    try {
      await deleteFile(bucketName, filename);
      alert('✓ Arquivo excluído com sucesso!');
      await loadAllBuckets();
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      alert('✗ Erro ao deletar arquivo: ' + error.message);
    }
  };

  const getTotalFiles = () => {
    return Object.values(bucketsData).reduce((acc, files) => acc + files.length, 0);
  };

  const getTotalSize = () => {
    let totalBytes = 0;
    Object.values(bucketsData).forEach((files) => {
      files.forEach((file) => {
        totalBytes += file.size || 0;
      });
    });
    return formatFileSize(totalBytes);
  };

  const getFileIcon = (filename) => {
    if (isImageFile(filename)) {
      return <FiImage size={20} />;
    }
    return <FiFile size={20} />;
  };

  return (
    <>
      <Header
        title="Gerenciamento de Arquivos (R2)"
        subtitle="Visualize e gerencie todos os arquivos nos buckets do Cloudflare R2"
      />

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card stat-card--blue">
          <div className="stat-card__icon">
            <FiFolder size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Total de Buckets</h4>
            <p className="stat-card__value">{Object.keys(BUCKETS).length}</p>
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__icon">
            <FiFile size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Total de Arquivos</h4>
            <p className="stat-card__value">{getTotalFiles()}</p>
          </div>
        </div>

        <div className="stat-card stat-card--orange">
          <div className="stat-card__icon">
            <FiFolder size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Espaço Utilizado</h4>
            <p className="stat-card__value" style={{ fontSize: '1.5rem' }}>
              {getTotalSize()}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="link-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Arquivos por Bucket</h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn-secondary"
              onClick={loadAllBuckets}
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
              Upload Arquivo
            </button>
          </div>
        </div>
      </div>

      {/* Buckets List */}
      {loading ? (
        <div className="link-card">
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <FiRefreshCw className="spinning" size={32} style={{ color: '#3b82f6' }} />
            <p style={{ marginTop: '1rem', color: '#64748b' }}>Carregando arquivos...</p>
          </div>
        </div>
      ) : (
        Object.entries(bucketsData).map(([bucketName, files]) => (
          <div key={bucketName} className="link-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiFolder style={{ color: '#3b82f6' }} />
                {bucketName}
              </h3>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                {files.length} arquivo{files.length !== 1 ? 's' : ''}
              </span>
            </div>

            {files.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                <FiFolder size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p>Nenhum arquivo neste bucket</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="lancamentos-table">
                  <thead>
                    <tr>
                      <th>Arquivo</th>
                      <th>Tamanho</th>
                      <th>Data de Upload</th>
                      <th style={{ textAlign: 'center' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => (
                      <tr key={file.key}>
                        <td data-label="Arquivo">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {getFileIcon(file.key)}
                            <span style={{ wordBreak: 'break-all' }}>{file.key}</span>
                          </div>
                        </td>
                        <td data-label="Tamanho">{formatFileSize(file.size)}</td>
                        <td data-label="Data de Upload">
                          {file.uploaded
                            ? new Date(file.uploaded).toLocaleString('pt-BR')
                            : '-'}
                        </td>
                        <td data-label="Ações">
                          <div className="action-buttons" style={{ justifyContent: 'center' }}>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-icon"
                              title="Abrir arquivo"
                              style={{ color: '#3b82f6', textDecoration: 'none' }}
                            >
                              <FiExternalLink />
                            </a>
                            <button
                              className="btn-icon delete"
                              title="Excluir"
                              onClick={() => handleDelete(bucketName, file.key)}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => !uploading && setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload de Arquivo</h3>
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
                Selecione o Bucket
              </label>
              <select
                className="input-field"
                value={selectedBucket}
                onChange={(e) => setSelectedBucket(e.target.value)}
                disabled={uploading}
                style={{ marginBottom: '1rem' }}
              >
                <option value="">Escolha um bucket...</option>
                {Object.values(BUCKETS).map((bucket) => (
                  <option key={bucket} value={bucket}>
                    {bucket}
                  </option>
                ))}
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
                {uploading ? 'Enviando...' : 'Enviar Arquivo'}
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

        .btn-icon {
          padding: 0.5rem;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-icon:hover {
          background: rgba(59, 130, 246, 0.1);
          color: #2563eb;
        }

        .btn-icon.delete {
          color: #ef4444;
        }

        .btn-icon.delete:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }
      `}</style>
    </>
  );
};

export default BucketsPage;
