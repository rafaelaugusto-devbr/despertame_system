import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { uploadDocument, deleteDocument as deleteDocumentApi } from '../../services/documentApi';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import { FiPlus, FiFile, FiTrash2, FiDownload, FiAlertCircle, FiUpload, FiFolder } from 'react-icons/fi';
import './Financeiro.css';

const DocumentosPage = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [novoDoc, setNovoDoc] = useState({ titulo: '', descricao: '', pasta: 'tesouraria' });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const fetchDocumentos = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'tesourariaDocumentos'));
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDocumentos(docs.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis() || 0));
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill titulo with filename if empty
      if (!novoDoc.titulo.trim()) {
        setNovoDoc({ ...novoDoc, titulo: file.name });
      }
    }
  };

  const handleAddDocumento = async (e) => {
    e.preventDefault();
    if (!novoDoc.titulo.trim() || !selectedFile) {
      alert('Por favor, preencha o título e selecione um arquivo.');
      return;
    }

    setUploading(true);

    try {
      // Upload to Cloudflare via API
      const uploadResponse = await uploadDocument(selectedFile, {
        titulo: novoDoc.titulo.trim(),
        descricao: novoDoc.descricao.trim(),
        pasta: novoDoc.pasta || 'tesouraria'
      });

      // Save metadata to Firebase
      await addDoc(collection(db, 'tesourariaDocumentos'), {
        titulo: novoDoc.titulo.trim(),
        descricao: novoDoc.descricao.trim(),
        pasta: novoDoc.pasta || 'tesouraria',
        url: uploadResponse.url || uploadResponse.fileUrl, // URL returned from Cloudflare
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        cloudflareId: uploadResponse.id || uploadResponse.documentId,
        createdAt: serverTimestamp(),
      });

      setNovoDoc({ titulo: '', descricao: '', pasta: 'tesouraria' });
      setSelectedFile(null);
      setIsAdding(false);
      await fetchDocumentos();
    } catch (error) {
      console.error('Erro ao adicionar documento:', error);
      alert(`Erro ao fazer upload: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocumento = async (id, cloudflareId) => {
    if (!window.confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      // Delete from Cloudflare if cloudflareId exists
      if (cloudflareId) {
        try {
          await deleteDocumentApi(cloudflareId);
        } catch (apiError) {
          console.error('Erro ao deletar do Cloudflare:', apiError);
          // Continue to delete from Firebase even if Cloudflare deletion fails
        }
      }

      // Delete from Firebase
      await deleteDoc(doc(db, 'tesourariaDocumentos', id));
      await fetchDocumentos();
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      alert(`Erro ao excluir documento: ${error.message}`);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return timestamp.toDate().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <>
      <Header
        title="Documentos"
        subtitle="Gerencie documentos importantes da tesouraria"
      />

      <div className="section-header">
        <h2 className="link-title">Documentos Cadastrados</h2>
        <Button className="btn-primary" onClick={() => setIsAdding(!isAdding)}>
          <FiPlus /> Novo Documento
        </Button>
      </div>

      {isAdding && (
        <div className="link-card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="link-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            Adicionar Documento
          </h3>
          <form onSubmit={handleAddDocumento}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="titulo" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Título *
                </label>
                <input
                  id="titulo"
                  type="text"
                  className="input-field"
                  placeholder="Ex: Relatório Mensal Dezembro 2024"
                  value={novoDoc.titulo}
                  onChange={(e) => setNovoDoc({ ...novoDoc, titulo: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="descricao" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  className="input-field"
                  placeholder="Breve descrição do documento"
                  value={novoDoc.descricao}
                  onChange={(e) => setNovoDoc({ ...novoDoc, descricao: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="pasta" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  <FiFolder style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Pasta
                </label>
                <input
                  id="pasta"
                  type="text"
                  className="input-field"
                  placeholder="tesouraria"
                  value={novoDoc.pasta}
                  onChange={(e) => setNovoDoc({ ...novoDoc, pasta: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="arquivo" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  <FiUpload style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Arquivo *
                </label>
                <input
                  id="arquivo"
                  type="file"
                  className="input-field"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip"
                  required
                />
                {selectedFile && (
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                    Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                <Button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? (
                    <>Fazendo upload...</>
                  ) : (
                    <>
                      <FiUpload /> Fazer Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Carregando documentos...</p>
      ) : documentos.length === 0 ? (
        <div className="link-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <FiAlertCircle size={48} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
          <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>Nenhum documento cadastrado</h3>
          <p style={{ color: '#94a3b8' }}>Clique em "Novo Documento" para adicionar o primeiro documento.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {documentos.map((doc) => (
            <div key={doc.id} className="link-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <FiFile size={20} style={{ color: '#3b82f6' }} />
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>{doc.titulo}</h3>
                  </div>

                  {doc.descricao && (
                    <p style={{ color: '#64748b', margin: '0.5rem 0', fontSize: '0.9375rem' }}>
                      {doc.descricao}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    {doc.pasta && (
                      <span style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FiFolder size={14} /> {doc.pasta}
                      </span>
                    )}
                    {doc.fileName && (
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {doc.fileName}
                      </span>
                    )}
                    {doc.fileSize && (
                      <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                        {(doc.fileSize / 1024).toFixed(2)} KB
                      </span>
                    )}
                    <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      Adicionado em {formatDate(doc.createdAt)}
                    </span>
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#3b82f6',
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        <FiDownload size={16} />
                        Abrir Documento
                      </a>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteDocumento(doc.id, doc.cloudflareId)}
                  className="icon-btn delete"
                  title="Excluir documento"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default DocumentosPage;
