import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProfileIcon } from '../assets/icons/icons';
import './UserAvatarIcon.css';

const UserAvatarIcon = () => {
  const { user } = useAuth();

  if (user?.photoURL) {
    return (
      <div className="user-avatar-icon">
        <img src={user.photoURL} alt="Avatar" />
      </div>
    );
  }

  return <ProfileIcon />;
};

export default UserAvatarIcon;
