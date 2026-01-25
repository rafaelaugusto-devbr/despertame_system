import React, { useState } from 'react';
import { PANELS } from '../../config-senha/panels';
import Header from '../../components/layout/Header';
import { FiLock, FiEye, FiEyeOff, FiCopy, FiCheckCircle, FiShield } from 'react-icons/fi';
// import '../financeiro/Financeiro.css'; // CSS movido para tesouraria
import '../tesouraria/Financeiro.css';

const SenhasPage = () => {
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const togglePasswordVisibility = (key) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const copyToClipboard = async (password, key) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const panelsList = Object.entries(PANELS).filter(([_, panel]) => panel.password);

  return (
    <>
      <Header
        title="Senhas dos Painéis"
        subtitle="Gerencie as senhas de acesso aos painéis do sistema"
      />

      <div className="link-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #FFF9F0 0%, #FFF5E6 100%)', border: '2px solid #FFD700' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <FiShield size={32} style={{ color: '#FF8C00' }} />
          <div>
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem', fontWeight: 700 }}>
              Segurança das Senhas
            </h3>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9375rem' }}>
              Mantenha essas senhas em segurança. Não compartilhe com pessoas não autorizadas.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {panelsList.map(([key, panel]) => {
          const isVisible = visiblePasswords[key];
          const isCopied = copiedKey === key;

          return (
            <div
              key={key}
              className="link-card"
              style={{
                padding: '2rem',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '2px solid #e2e8f0',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Ícone e Nome */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(255, 140, 0, 0.3)'
                }}>
                  <FiLock size={28} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                    {panel.label}
                  </h3>
                  <span style={{
                    display: 'inline-block',
                    marginTop: '0.25rem',
                    padding: '0.25rem 0.75rem',
                    background: '#d1fae5',
                    color: '#065f46',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Protegido
                  </span>
                </div>
              </div>

              {/* Campo de Senha */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#475569',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em'
                }}>
                  Senha de Acesso
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.875rem 1rem',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type={isVisible ? 'text' : 'password'}
                    value={panel.password}
                    readOnly
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      fontFamily: isVisible ? 'inherit' : 'monospace',
                      letterSpacing: isVisible ? 'normal' : '0.1em',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => togglePasswordVisibility(key)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                      marginLeft: '0.5rem'
                    }}
                    title={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    {isVisible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Botão Copiar */}
              <button
                onClick={() => copyToClipboard(panel.password, key)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.625rem',
                  padding: '0.875rem 1.5rem',
                  background: isCopied
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #FFD700, #FF8C00)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isCopied
                    ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                    : '0 4px 12px rgba(255, 140, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!isCopied) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 140, 0, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isCopied
                    ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                    : '0 4px 12px rgba(255, 140, 0, 0.3)';
                }}
              >
                {isCopied ? (
                  <>
                    <FiCheckCircle size={18} />
                    Copiado!
                  </>
                ) : (
                  <>
                    <FiCopy size={18} />
                    Copiar Senha
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Informações Adicionais */}
      <div className="link-card" style={{ marginTop: '2rem', background: '#f8fafc', border: '2px dashed #cbd5e1' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#1e293b', fontSize: '1.125rem', fontWeight: 700 }}>
          Informações Importantes
        </h3>
        <p style={{ margin: 0, color: '#64748b', lineHeight: '1.8', fontSize: '0.9375rem' }}>
          <strong>⚠️ Aviso:</strong> As senhas exibidas nesta página <strong>não podem ser compartilhadas sem autorização</strong>.
          Mantenha essas informações em sigilo e compartilhe apenas com pessoas devidamente autorizadas.
        </p>
      </div>
    </>
  );
};

export default SenhasPage;
