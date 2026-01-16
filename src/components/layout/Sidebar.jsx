import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../contexts/ModalContext';

export function useSidebarBase() {
  const [collapsed, setCollapsed] = useState(false);

  const { logout } = useAuth();
  const { showModal } = useModal();
  const navigate = useNavigate();

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      // Mantém compatibilidade com o CSS antigo que espera
      // .admin-layout.sidebar-collapsed
      const root = document.querySelector('.admin-layout');
      if (root) root.classList.toggle('sidebar-collapsed', next);
      return next;
    });
  };

  const handleLogout = () => {
    showModal({
      title: 'Sair do sistema',
      message: 'Tem certeza que deseja sair?',
      type: 'danger',
      onConfirm: async () => {
        await logout();
        navigate('/login');
      },
    });
  };

  return {
    collapsed,
    toggleCollapse,
    handleLogout,
  };
}
