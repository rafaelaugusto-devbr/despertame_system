import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Bloquear scroll do body quando sidebar está aberto no mobile ou quando profile modal está aberto
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      if (mobileOpen || profileModalOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen, profileModalOpen]);

  // Não precisa de click-outside detection - o overlay já faz isso

  // Close sidebar on route change is handled by handleNavClick in each sidebar component

  const toggleCollapse = () => {
    setCollapsed(prev => !prev);
  };

  const toggleMobile = () => {
    setMobileOpen(prev => !prev);
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const openProfileModal = () => {
    setProfileModalOpen(true);
    // Fechar sidebar mobile ao abrir perfil
    if (window.innerWidth <= 1024) {
      closeMobile();
    }
  };

  const closeProfileModal = () => {
    setProfileModalOpen(false);
  };

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        toggleCollapse,
        mobileOpen,
        setMobileOpen,
        toggleMobile,
        closeMobile,
        profileModalOpen,
        openProfileModal,
        closeProfileModal,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
