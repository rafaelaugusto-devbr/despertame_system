// src/components/layout/Header.jsx

import React from 'react';

const Header = ({ title, subtitle }) => {
  return (
    <div className="header">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
};

export default Header;
