// src/main.jsx (ou seu arquivo de entrada principal)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ToastContainer from './components/ui/ToastContainer';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <App />
        <ToastContainer />
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>,
);
