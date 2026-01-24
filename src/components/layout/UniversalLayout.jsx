import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSidebar } from '../../contexts/SidebarContext';
import { FiMenu } from 'react-icons/fi';
import './UniversalLayout.css';

const UniversalLayout = ({ Sidebar }) => {
  const { collapsed, mobileOpen, toggleMobile } = useSidebar();

  return (
    <div className={`admin-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile hamburger button */}
      <button
        className="mobile-menu-btn"
        onClick={toggleMobile}
        aria-label="Toggle menu"
      >
        <FiMenu size={24} />
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggleMobile}
          aria-hidden="true"
        />
      )}

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
