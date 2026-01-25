import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import { FiPlus, FiFile, FiTrash2, FiDownload, FiAlertCircle } from 'react-icons/fi';
// import '../financeiro/Financeiro.css'; // CSS movido para mesma pasta
import './Financeiro.css';

const DocumentosPage = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [novoDoc, setNovoDoc] = useState({ titulo: '', descricao: '', url: '' });

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

  const handleAddDocumento = async (e) => {
    e.preventDefault();
    if (!novoDoc.titulo.trim()) return;

    try {
      await addDoc(collection(db, 'tesourariaDocumentos'), {
        titulo: novoDoc.titulo.trim(),
        descricao: novoDoc.descricao.trim(),
        url: novoDoc.url.trim(),
        createdAt: serverTimestamp(),
      });

      setNovoDoc({ titulo: '', descricao: '', url: '' });
      setIsAdding(false);
      await fetchDocumentos();
    } catch (error) {
      console.error('Erro ao adicionar documento:', error);
    }
  };

  const handleDeleteDocumento = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      await deleteDoc(doc(db, 'tesourariaDocumentos', id));
      await fetchDocumentos();
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
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
                <label htmlFor="url" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  URL ou Link
                </label>
                <input
                  id="url"
                  type="url"
                  className="input-field"
                  placeholder="https://..."
                  value={novoDoc.url}
                  onChange={(e) => setNovoDoc({ ...novoDoc, url: e.target.value })}
                />
              </div>

              <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                <Button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary">
                  <FiPlus /> Salvar Documento
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
                  onClick={() => handleDeleteDocumento(doc.id)}
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
