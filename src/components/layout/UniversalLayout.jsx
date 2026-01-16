import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSidebarBase } from '../sidebar/useSidebarBase';

const UniversalLayout = ({ Sidebar }) => {
  const { collapsed } = useSidebarBase();

  return (
    <div className={`admin-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <main className="admin-content-wrapper">
        <Outlet />
      </main>
    </div>
  );
};

export default UniversalLayout;
