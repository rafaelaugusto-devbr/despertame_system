import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../services/firebase';

const EmailList = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      .then(() => alert(`E-mail "${email}" copiado para a área de transferência!`))
      .catch(() => alert("Falha ao copiar e-mail."));
  };

  return (
    <div className="link-card">
      <h2 className="link-title emails">Emails Cadastrados</h2>
      
      <div className="active-link" style={{ background: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)' }}>
        <span>Total de e-mails únicos: {loading ? 'Carregando...' : emails.length}</span>
      </div>

      <div className="section">
        <h3 className="section-title email-list-title">Lista de E-mails</h3>
        <ul className="list">
          {loading ? (
            <li>Carregando e-mails...</li>
          ) : (
            emails.map(emailData => (
              <li key={emailData.id} title="Clique para copiar" onClick={() => handleCopyEmail(emailData.email)}>
                {emailData.email}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default EmailList;
