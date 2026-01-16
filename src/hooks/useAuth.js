// src/hooks/useAuth.js
import { useEffect, useState } from 'react';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

/**
 * Hook de autenticação (Firebase)
 *
 * - user: usuário atual
 * - isAdmin: no momento, qualquer usuário logado é tratado como admin no frontend
 * - loading: status de carregamento
 * - logout(): encerra a sessão
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAdmin(true);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return { user, isAdmin, loading, logout };
};
