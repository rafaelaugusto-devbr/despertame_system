// src/pages/EmailDashboardPage.jsx (Versão Corrigida)

import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Button from '../../components/ui/Button';
import { useModal } from '../../contexts/ModalContext';

const EmailDashboardPage = () => {
  const { showModal } = useModal();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ... (lógica de busca de e-mails permanece a mesma)
    const fetchEmails = async () => {
      try {
        const emailsCollectionRef = collection(db, "email", "inscricao", "emails");
        const q = query(emailsCollectionRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const uniqueEmails = new Set();
        const emailsData = [];
        
        querySnapshot.forEach((doc) => {
          const email = doc.data().email;
          if (email && !uniqueEmails.has(email)) {
            uniqueEmails.add(email);
            emailsData.push({ id: doc.id, ...doc.data() });
          }
        });
        setEmails(emailsData);
      } catch (error) {
        console.error("Erro ao carregar e-mails:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmails();
  }, []);

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email)
      .then(() => showModal({
        title: 'Sucesso',
        message: `E-mail "${email}" copiado!`,
        type: 'info'
      }))
      .catch(() => showModal({
        title: 'Erro',
        message: 'Falha ao copiar.',
        type: 'danger'
      }));
  };

  return (
    <>
      <Header 
        title="Dashboard de E-mails" 
        subtitle="Visualize os e-mails de pessoas interessadas." 
      />

      <div className="link-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 className="link-title">Estatísticas</h2>
        <div className="active-link" style={{ background: 'var(--gradient-success)', color: 'white', cursor: 'default' }}>
          <span>Total de e-mails únicos: {loading ? '...' : emails.length}</span>
        </div>
      </div>

      <div className="link-card user-table-container">
        <h2 className="link-title">Lista de E-mails</h2>
        <table className="user-table">
          <thead>
            <tr>
              <th>E-mail Cadastrado</th>
              <th style={{ textAlign: 'center' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="2" style={{ textAlign: 'center' }}>Carregando e-mails...</td></tr>
            ) : (
              emails.map(emailData => (
                <tr key={emailData.id}>
                  <td data-label="E-mail">{emailData.email}</td>
                  <td data-label="Ação" style={{ textAlign: 'center' }}>
                    <Button 
                      className="btn-primary" 
                      onClick={() => handleCopyEmail(emailData.email)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                      Copiar
                    </Button>
                  </td>
                </tr>
              ))
            )}
            {!loading && emails.length === 0 && (
              <tr><td colSpan="2" style={{ textAlign: 'center' }}>Nenhum e-mail cadastrado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default EmailDashboardPage;
