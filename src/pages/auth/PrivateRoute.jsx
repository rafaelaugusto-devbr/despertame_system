import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase';

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const idTokenResult = await currentUser.getIdTokenResult(true);
          if (idTokenResult.claims.admin) {
            setUser(currentUser);
            setIsAdmin(true);
          } else {
            await auth.signOut();
            setUser(null);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Erro ao verificar claims de admin:", error);
          await auth.signOut();
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', paddingTop: '5rem' }}>Carregando autenticação...</div>;
  }

  return user && isAdmin ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
