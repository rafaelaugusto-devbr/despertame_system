import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSidebar } from '../../contexts/SidebarContext';
import { FiMenu, FiX } from 'react-icons/fi';
import ProfileModal from '../modal/ProfileModal';
import './UniversalLayout.css';

const UniversalLayout = ({ Sidebar }) => {
  const { collapsed, mobileOpen, toggleMobile, profileModalOpen, closeProfileModal } = useSidebar();

  return (
    <div className={`admin-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile hamburger button */}
      <button
        className={`mobile-menu-btn ${mobileOpen ? 'open' : ''}`}
        onClick={toggleMobile}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
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

      {/* ProfileModal renderizado fora da sidebar para funcionar corretamente no mobile */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={closeProfileModal}
      />
    </div>
  );
};

export default UniversalLayout;
