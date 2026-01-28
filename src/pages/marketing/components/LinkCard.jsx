import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../../services/firebase';
import { useModal } from '../../../contexts/ModalContext';
import Button from '../../../components/ui/Button';

const LinkCard = ({ type, title, placeholder }) => {
  const { showModal } = useModal();
  const [data, setData] = useState({ url: '', history: [], deleted: [] });
  const [newUrl, setNewUrl] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const docRef = doc(db, type, 'config');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data());
      } else {
        const initialData = { url: '', history: [], deleted: [], createdAt: serverTimestamp(), createdBy: auth.currentUser?.email || 'system' };
        setDoc(docRef, initialData).catch(console.error);
      }
    });
    return () => unsubscribe();
  }, [type]);

  const handleUpdate = async () => {
    if (!newUrl.trim() || !newUrl.startsWith('https://' )) {
      showModal({
        title: 'URL Inválida',
        message: 'Por favor, insira uma URL válida começando com https://',
        type: 'danger'
      });
      return;
    }
    setLoadingUpdate(true);
    const docRef = doc(db, type, 'config');
    try {
      await updateDoc(docRef, {
        url: newUrl,
        lastUpdated: serverTimestamp(),
        updatedBy: auth.currentUser.email,
        history: arrayUnion({ url: data.url, timestamp: new Date(), updatedBy: auth.currentUser.email }),
      });
      setNewUrl('');
    } catch (error) {
      console.error("Erro ao atualizar link: ", error);
      showModal({
        title: 'Erro',
        message: 'Falha ao atualizar o link.',
        type: 'danger'
      });
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleDelete = async () => {
    if (!data.url) return;
    showModal({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o link ${type}?`,
      type: 'danger',
      onConfirm: async () => {
        setLoadingDelete(true);
        const docRef = doc(db, type, 'config');
        try {
          await updateDoc(docRef, {
            url: '',
            lastUpdated: serverTimestamp(),
            updatedBy: auth.currentUser.email,
            deleted: arrayUnion({ url: data.url, timestamp: new Date(), deletedBy: auth.currentUser.email }),
          });
        } catch (error) {
          console.error("Erro ao excluir link: ", error);
          showModal({
            title: 'Erro',
            message: 'Falha ao excluir o link.',
            type: 'danger'
          });
        } finally {
          setLoadingDelete(false);
        }
      }
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return 'Data inválida';
    return timestamp.toDate().toLocaleString('pt-BR');
  };

  return (
    <div className="link-card">
      <h2 className="link-title">{title}</h2>
      
      <div className={`active-link ${!data.url ? 'empty' : ''}`} onClick={() => data.url && window.open(data.url, '_blank')}>
        <span>{data.url || 'Nenhum link configurado'}</span>
      </div>

      <div className="input-group">
        <input type="url" className="input-field" placeholder={placeholder} value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
        <Button onClick={handleUpdate} className="btn-primary" loading={loadingUpdate} loadingText="Atualizando...">Atualizar</Button>
        <Button onClick={handleDelete} className="btn-danger" loading={loadingDelete} loadingText="Excluindo...">Excluir</Button>
      </div>

      <div className="history-deleted-grid">
        <div className="section">
          <h3>Histórico de Alterações</h3>
          <ul className="list">
            {data.history && data.history.length > 0 ? (
              [...data.history].reverse().slice(0, 5).map((item, index) => (
                item.url && <li key={index} title={`Alterado em: ${formatDate(item.timestamp)} por ${item.updatedBy}`}>{item.url}</li>
              ))
            ) : (
              <li className="empty-list">Nenhuma alteração registrada.</li>
            )}
          </ul>
        </div>

        <div className="section">
          <h3>Links Excluídos</h3>
          <ul className="list">
            {data.deleted && data.deleted.length > 0 ? (
              [...data.deleted].reverse().slice(0, 5).map((item, index) => (
                <li key={index} title={`Excluído em: ${formatDate(item.timestamp)} por ${item.deletedBy}`}>{item.url}</li>
              ))
            ) : (
              <li className="empty-list">Nenhum link excluído.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LinkCard;
