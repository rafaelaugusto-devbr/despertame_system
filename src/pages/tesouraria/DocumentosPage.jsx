// src/pages/tesouraria/DocumentosPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import { FiUpload, FiFile, FiTrash2, FiExternalLink, FiFolder, FiImage, FiRefreshCw } from 'react-icons/fi';
import { useModal } from '../../contexts/ModalContext';
import {
  listFiles,
  uploadFile,
  deleteFile,
  formatFileSize,
  isImageFile,
  BUCKETS,
} from '../../services/storageApi';
import './Financeiro.css';

const DocumentosPage = () => {
  const { showModal } = useModal();
  const [financeiroFiles, setFinanceiroFiles] = useState([]);
  const [tesourariaFiles, setTesourariaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);

      // Load financeiro
      const financeiroData = await listFiles(BUCKETS.FINANCEIRO);
      setFinanceiroFiles(financeiroData.files || []);

      // Load tesouraria
      const tesourariaData = await listFiles(BUCKETS.TESOURARIA);
      setTesourariaFiles(tesourariaData.files || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      showModal({
        title: 'Erro ao Carregar',
        message: 'Erro ao carregar documentos: ' + error.message,
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
        message: 'Documento enviado com sucesso!',
        type: 'info'
      });
      setShowUploadModal(false);
      setFileToUpload(null);
      setSelectedBucket('');
      setUploadProgress(0);
      await loadDocuments();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      showModal({
        title: 'Erro no Upload',
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
            message: 'Documento excluído com sucesso!',
            type: 'info'
          });
          await loadDocuments();
        } catch (error) {
          console.error('Erro ao deletar documento:', error);
          showModal({
            title: 'Erro ao Excluir',
            message: 'Erro ao deletar documento: ' + error.message,
            type: 'danger'
          });
        }
      }
    });
  };

  const getFileIcon = (filename) => {
    if (isImageFile(filename)) {
      return <FiImage size={20} style={{ color: '#3b82f6' }} />;
    }
    return <FiFile size={20} style={{ color: '#3b82f6' }} />;
  };

  const renderFilesList = (files, bucketName) => {
    if (files.length === 0) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          <FiFolder size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>Nenhum documento nesta pasta</p>
        </div>
      );
    }

    return (
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
                      title="Abrir documento"
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
    );
  };

  return (
    <>
      <Header
        title="Documentos da Tesouraria"
        subtitle="Gerencie documentos financeiros e administrativos"
      />

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card stat-card--blue">
          <div className="stat-card__icon">
            <FiFolder size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Financeiro</h4>
            <p className="stat-card__value">{financeiroFiles.length}</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.5rem 0 0' }}>
              documentos
            </p>
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__icon">
            <FiFolder size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Tesouraria</h4>
            <p className="stat-card__value">{tesourariaFiles.length}</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.5rem 0 0' }}>
              documentos
            </p>
          </div>
        </div>

        <div className="stat-card stat-card--orange">
          <div className="stat-card__icon">
            <FiFile size={28} />
          </div>
          <div className="stat-card__content">
            <h4 className="stat-card__title">Total</h4>
            <p className="stat-card__value">{financeiroFiles.length + tesourariaFiles.length}</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.5rem 0 0' }}>
              documentos
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="link-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Documentos por Pasta</h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn-secondary"
              onClick={loadDocuments}
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
              Upload Documento
            </button>
          </div>
        </div>
      </div>

      {/* Financeiro Folder */}
      <div className="link-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiFolder style={{ color: '#3b82f6' }} />
            Financeiro
          </h3>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {financeiroFiles.length} documento{financeiroFiles.length !== 1 ? 's' : ''}
          </span>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <FiRefreshCw className="spinning" size={32} style={{ color: '#3b82f6' }} />
            <p style={{ marginTop: '1rem', color: '#64748b' }}>Carregando...</p>
          </div>
        ) : (
          renderFilesList(financeiroFiles, BUCKETS.FINANCEIRO)
        )}
      </div>

      {/* Tesouraria Folder */}
      <div className="link-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiFolder style={{ color: '#10b981' }} />
            Tesouraria
          </h3>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {tesourariaFiles.length} documento{tesourariaFiles.length !== 1 ? 's' : ''}
          </span>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <FiRefreshCw className="spinning" size={32} style={{ color: '#10b981' }} />
            <p style={{ marginTop: '1rem', color: '#64748b' }}>Carregando...</p>
          </div>
        ) : (
          renderFilesList(tesourariaFiles, BUCKETS.TESOURARIA)
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => !uploading && setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload de Documento</h3>
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
                <option value={BUCKETS.FINANCEIRO}>Financeiro</option>
                <option value={BUCKETS.TESOURARIA}>Tesouraria</option>
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
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip"
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
                {uploading ? 'Enviando...' : 'Enviar Documento'}
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

export default DocumentosPage;
