import React from 'react';

const Button = ({ onClick, children, className, disabled, loading, loadingText, type = 'button' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn ${className}`}
      disabled={disabled || loading}
    >
      {loading ? loadingText : children}
    </button>
  );
};

export default Button;
