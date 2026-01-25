import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../contexts/ModalContext';
import { useSidebar } from '../../contexts/SidebarContext';

export function useSidebarBase() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showModal } = useModal();
  const { collapsed, toggleCollapse, toggleMobile, mobileOpen, closeMobile } = useSidebar();

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

  // Close sidebar on navigation (mobile only)
  const handleNavigate = (path) => {
    if (window.innerWidth <= 1024) {
      closeMobile();
    }
    navigate(path);
  };

  return {
    collapsed,
    toggleCollapse,
    toggleMobile,
    mobileOpen,
    closeMobile,
    handleLogout,
    handleNavigate,
  };
}
