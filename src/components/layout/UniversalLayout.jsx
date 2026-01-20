import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSidebar } from '../../contexts/SidebarContext';

const UniversalLayout = ({ Sidebar }) => {
  const { collapsed } = useSidebar();

  return (
    <div className={`admin-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <main className="admin-content-wrapper">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UniversalLayout;
