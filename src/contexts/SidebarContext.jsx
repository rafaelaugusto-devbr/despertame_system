import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    sidebar.classList.toggle('open', mobileOpen);
  }, [mobileOpen]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!mobileOpen) return;

    const handleClickOutside = (e) => {
      const sidebar = document.querySelector('.sidebar');
      const menuBtn = document.querySelector('.mobile-menu-btn');

      if (sidebar && !sidebar.contains(e.target) && !menuBtn?.contains(e.target)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileOpen]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth <= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const toggleCollapse = () => {
    setCollapsed(prev => !prev);
  };

  const toggleMobile = () => {
    setMobileOpen(prev => !prev);
  };

  const closeMobile = () => {
    setMobileOpen(false);
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
