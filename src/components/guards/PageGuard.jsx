import React, { useEffect, useState } from 'react';
import PasswordModal from '../modal/PasswordModal';

/**
 * PageGuard
 *
 * Protege páginas ou painéis com senha simples (frontend).
 * A senha é validada uma vez por sessão (sessionStorage),
 * usando uma chave única por painel (pageKey).
 *
 * Props:
 * - pageKey: string única (ex: 'marketing', 'financeiro', 'config')
 * - correctPassword: string
 * - pageName: string (exibido no modal)
 */
const PageGuard = ({ children, pageKey, correctPassword, pageName }) => {
  const sessionKey = `password_unlocked_${pageKey}`;

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');

  // 🔹 Verifica se já foi desbloqueado nesta sessão
  useEffect(() => {
    const unlocked = sessionStorage.getItem(sessionKey) === 'true';
    setIsUnlocked(unlocked);
  }, [sessionKey]);

  const handlePasswordSubmit = (password) => {
    if (password === correctPassword) {
      sessionStorage.setItem(sessionKey, 'true');
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
  };

  // 🔒 Bloqueado → mostra modal
  if (!isUnlocked) {
    return (
      <PasswordModal
        pageName={pageName}
        error={error}
        onSubmit={handlePasswordSubmit}
      />
    );
  }

  // ✅ Liberado → renderiza conteúdo
  return <>{children}</>;
};

export default PageGuard;
