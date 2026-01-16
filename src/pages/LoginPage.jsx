// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../services/firebase';
import { syncUser } from '../services/userApi';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiHash } from 'react-icons/fi';
import logoDespertame from '../assets/logo_despertame.jpg';

// --- SUB-COMPONENTES (Formulários) ---
const LoginForm = ({ loginMethod, email, setEmail, password, setPassword, showPassword, setShowPassword, phone, setPhone, handleLogin, loading, setLoginMethod }) => (
  <form id="login-form" onSubmit={handleLogin}>
    {loginMethod === 'email' ? (
      <>
        <div className="input-wrapper">
          <FiMail className="input-icon" />
          <input className="input-field" type="email" placeholder="Seu e-mail" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="input-wrapper">
          <FiLock className="input-icon" />
          <input className="input-field" type={showPassword ? 'text' : 'password'} placeholder="Sua senha" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </>
    ) : (
      <div className="input-wrapper">
        <FiPhone className="input-icon" />
        <PhoneInput placeholder="Seu telefone" value={phone} onChange={setPhone} defaultCountry="BR" international className="input-field" />
      </div>
    )}
    <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
    <a href="#" onClick={(e) => { e.preventDefault(); setLoginMethod(loginMethod === 'email' ? 'phone' : 'email'); }} className="switch-method-link">
      {loginMethod === 'email' ? 'Entrar com telefone' : 'Entrar com e-mail'}
    </a>
  </form>
);

const OtpForm = ({ phone, otp, setOtp, handleOtpSubmit, loading, setConfirmationResult }) => (
  <form id="login-form" onSubmit={handleOtpSubmit}>
    <p>Digite o código enviado para <strong>{phone}</strong>.</p>
    <div className="input-wrapper">
      <FiHash className="input-icon" />
      <input className="input-field" type="text" placeholder="Código" required value={otp} onChange={(e) => setOtp(e.target.value)} />
    </div>
    <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Verificando...' : 'Confirmar'}</button>
    <a href="#" onClick={(e) => { e.preventDefault(); setConfirmationResult(null); }} className="back-link">Voltar</a>
  </form>
);

// --- COMPONENTE PRINCIPAL ---
const LoginPage = () => {
  const [loginMethod, setLoginMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = 'login-page-body';
    return () => { document.body.className = ''; };
  }, []);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });
    }
  };

  const onLoginSuccess = async () => {
    // 1. Chama o sync apenas para registrar no banco (não bloqueia se falhar)
    try {
      await syncUser(); 
    } catch (err) {
      console.warn("Sync background:", err);
    }
    
    // 2. Redireciona IMEDIATAMENTE para o Admin
    navigate('/admin');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');

    if (loginMethod === 'email') {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        await onLoginSuccess();
      } catch (err) {
        console.error(err);
        setError('E-mail ou senha incorretos.');
        setLoading(false);
      }
    } else {
      if (!phone || phone.length < 10) { setError("Telefone inválido."); setLoading(false); return; }
      setupRecaptcha();
      try {
        const res = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
        setConfirmationResult(res);
      } catch (err) {
        setError('Erro ao enviar SMS.');
      }
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await confirmationResult.confirm(otp);
      await onLoginSuccess();
    } catch (err) {
      setError('Código inválido.');
      setLoading(false);
    }
  };

  return (
    <div className="login-split-container">
      <div id="recaptcha-container"></div>
      <div className="login-left-side">
        <div className="inspirational-content">
          <h2 className="message-quote">"Coragem, levanta-te, Ele te chama"</h2>
          <p className="message-reference">(Marcos 10:49)</p>
        </div>
      </div>
      <div className="login-right-side">
        <div className="login-form-wrapper">
          <header className="login-header">
            <img src={logoDespertame} alt="Logo" className="login-logo" />
            <h2 className="company-name">Desperta-me</h2>
            <h1>Painel Administrativo</h1>
          </header>
          {confirmationResult ? 
            <OtpForm phone={phone} otp={otp} setOtp={setOtp} handleOtpSubmit={handleOtpSubmit} loading={loading} setConfirmationResult={setConfirmationResult} /> : 
            <LoginForm loginMethod={loginMethod} email={email} setEmail={setEmail} password={password} setPassword={setPassword} showPassword={showPassword} setShowPassword={setShowPassword} phone={phone} setPhone={setPhone} handleLogin={handleLogin} loading={loading} setLoginMethod={setLoginMethod} />
          }
          {error && <p id="erro" style={{color: 'red', marginTop: '10px'}}>{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;