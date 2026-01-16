import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../contexts/ModalContext';

export function useSidebarBase() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showModal } = useModal();

  useEffect(() => {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    sidebar.classList.toggle('open', mobileOpen);
  }, [mobileOpen]);

  const toggleCollapse = () => {
    setCollapsed(prev => !prev);
  };

  const toggleMobile = () => {
    setMobileOpen(prev => !prev);
  };

  const handleLogout = () => {
    showModal({
      title: 'Sair do sistema',
      message: 'Tem certeza que deseja sair?',
      type: 'danger',
      onConfirm: async () => {
        await logout();
        sessionStorage.clear();
        navigate('/login');
      },
    });
  };

  return {
    collapsed,
    toggleCollapse,
    toggleMobile,
    mobileOpen,
    handleLogout,
  };
}
