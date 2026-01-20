import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../contexts/ModalContext';
import { useSidebar } from '../../contexts/SidebarContext';

export function useSidebarBase() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showModal } = useModal();
  const { collapsed, toggleCollapse, toggleMobile, mobileOpen } = useSidebar();

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
