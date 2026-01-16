import React from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import './Toast.css';

const ICON_MAP = {
  success: FiCheckCircle,
  error: FiXCircle,
  warning: FiAlertCircle,
  info: FiInfo,
};

const Toast = ({ notification, onClose }) => {
  const Icon = ICON_MAP[notification.type] || FiInfo;

  return (
    <div className={`toast toast--${notification.type}`}>
      <div className="toast__icon">
        <Icon size={20} />
      </div>
      <div className="toast__message">{notification.message}</div>
      <button className="toast__close" onClick={() => onClose(notification.id)}>
        <FiX size={16} />
      </button>
    </div>
  );
};

export default Toast;
