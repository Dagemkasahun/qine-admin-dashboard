// src/pages/Login.jsx - ENHANCED DESIGN (functionality preserved)
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  Mail, Lock, Eye, EyeOff, LogIn, AlertCircle,
  Moon, Sun, Building2, ShieldCheck
} from 'lucide-react';
import logoImage from '../assets/icon.png';

/* ─── inject styles once ─── */
const injectLoginStyles = () => {
  if (document.getElementById('login-styles')) return;
  const s = document.createElement('style');
  s.id = 'login-styles';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

    /* ── tokens ── */
    .login-root {
      font-family: 'DM Sans', sans-serif;
      --l-bg-light:      #EEF2FF;
      --l-bg-dark:       #080C14;
      --l-card-light:    #FFFFFF;
      --l-card-dark:     #111827;
      --l-border-light:  #E0E7FF;
      --l-border-dark:   #1F2D45;
      --l-text-light:    #0F172A;
      --l-text-dark:     #F1F5F9;
      --l-muted-light:   #64748B;
      --l-muted-dark:    #64748B;
      --l-field-light:   #F8FAFF;
      --l-field-dark:    #0D1525;
      --l-field-border-light: #C7D7FE;
      --l-field-border-dark:  #1E2E4A;
      --l-accent:        #2354E6;
      --l-accent-glow:   rgba(35,84,230,0.22);
      --l-error-bg-l:    #FEF2F2;
      --l-error-bg-d:    rgba(220,38,38,0.1);
      --l-error-border-l:#FECACA;
      --l-error-border-d:#7F1D1D;
      --l-error-text-l:  #991B1B;
      --l-error-text-d:  #FCA5A5;
    }

    /* ── page ── */
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      overflow: hidden;
    }
    .login-page.light { background: var(--l-bg-light); }
    .login-page.dark  { background: var(--l-bg-dark);  }

    /* ── decorative grid ── */
    .login-grid {
      position: absolute; inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(35,84,230,.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(35,84,230,.045) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .login-page.dark .login-grid {
      background-image:
        linear-gradient(rgba(35,84,230,.07) 1px, transparent 1px),
        linear-gradient(90deg, rgba(35,84,230,.07) 1px, transparent 1px);
    }

    /* ── orbs ── */
    .login-orb {
      position: absolute; border-radius: 50%; filter: blur(80px);
      pointer-events: none; animation: orb-drift 10s ease-in-out infinite alternate;
    }
    .login-orb-1 {
      width: 420px; height: 420px;
      top: -160px; right: -140px;
      background: radial-gradient(circle, rgba(35,84,230,.15), transparent 70%);
    }
    .login-orb-2 {
      width: 500px; height: 500px;
      bottom: -200px; left: -180px;
      background: radial-gradient(circle, rgba(99,102,241,.12), transparent 70%);
      animation-delay: -5s;
    }
    .login-page.dark .login-orb-1 { background: radial-gradient(circle, rgba(35,84,230,.22), transparent 70%); }
    .login-page.dark .login-orb-2 { background: radial-gradient(circle, rgba(99,102,241,.18), transparent 70%); }
    @keyframes orb-drift {
      from { transform: translate(0,0) scale(1); }
      to   { transform: translate(20px,30px) scale(1.05); }
    }

    /* ── wrapper ── */
    .login-wrapper {
      width: 100%; max-width: 420px;
      position: relative; z-index: 10;
      animation: login-rise .5s cubic-bezier(.22,1,.36,1) both;
    }
    @keyframes login-rise {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: none; }
    }

    /* ── logo block ── */
    .login-logo-block {
      display: flex; flex-direction: column; align-items: center;
      margin-bottom: 28px;
    }

    /* logo ring */
    .login-logo-ring {
      position: relative;
      width: 96px; height: 96px;
      margin-bottom: 16px;
    }
    .login-logo-ring::before {
      content: '';
      position: absolute; inset: -3px;
      border-radius: 26px;
      background: conic-gradient(from 0deg, #2354E6, #6366F1, #818CF8, #2354E6);
      animation: ring-spin 6s linear infinite;
    }
    @keyframes ring-spin { to { transform: rotate(360deg); } }
    .login-logo-inner {
      position: absolute; inset: 3px;
      border-radius: 22px;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .login-page.light .login-logo-inner { background: #fff; }
    .login-page.dark  .login-logo-inner { background: #111827; }
    .login-logo-inner img {
      width: 68px; height: 68px; object-fit: contain;
    }

    /* fallback icon */
    .login-logo-fallback {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
    }
    .login-logo-fallback svg { width: 36px; height: 36px; color: #2354E6; }
    .login-logo-fallback span {
      font-family: 'Sora', sans-serif;
      font-size: .65rem; font-weight: 700; letter-spacing: .18em;
      color: #2354E6; text-transform: uppercase;
    }

    /* brand text */
    .login-brand-name {
      font-family: 'Sora', sans-serif;
      font-size: 1.65rem; font-weight: 800; letter-spacing: -.04em;
      line-height: 1;
      background: linear-gradient(135deg, #2354E6 0%, #6366F1 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .login-brand-sub {
      margin-top: 5px; font-size: .78rem; font-weight: 500;
      letter-spacing: .06em; text-transform: uppercase;
    }
    .login-page.light .login-brand-sub { color: #94A3B8; }
    .login-page.dark  .login-brand-sub { color: #475569; }

    /* ── card ── */
    .login-card {
      border-radius: 20px;
      padding: 32px;
      border: 1px solid;
      box-shadow: 0 24px 64px rgba(0,0,0,.08);
    }
    .login-page.light .login-card {
      background: var(--l-card-light);
      border-color: var(--l-border-light);
    }
    .login-page.dark .login-card {
      background: var(--l-card-dark);
      border-color: var(--l-border-dark);
      box-shadow: 0 24px 64px rgba(0,0,0,.4), 0 0 0 1px rgba(35,84,230,.08);
    }

    /* card heading */
    .login-heading {
      font-family: 'Sora', sans-serif;
      font-size: 1.25rem; font-weight: 700; letter-spacing: -.02em;
      margin-bottom: 4px;
    }
    .login-page.light .login-heading { color: var(--l-text-light); }
    .login-page.dark  .login-heading { color: var(--l-text-dark);  }
    .login-subheading { font-size: .85rem; margin-bottom: 24px; }
    .login-page.light .login-subheading { color: var(--l-muted-light); }
    .login-page.dark  .login-subheading { color: var(--l-muted-dark);  }

    /* ── error ── */
    .login-error {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 14px; border-radius: 12px; border: 1px solid;
      margin-bottom: 20px; font-size: .84rem;
      animation: shake .5s cubic-bezier(.36,.07,.19,.97) both;
    }
    .login-page.light .login-error {
      background: var(--l-error-bg-l); border-color: var(--l-error-border-l); color: var(--l-error-text-l);
    }
    .login-page.dark .login-error {
      background: var(--l-error-bg-d); border-color: var(--l-error-border-d); color: var(--l-error-text-d);
    }
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%,60%  { transform: translateX(-5px); }
      40%,80%  { transform: translateX(5px); }
    }

    /* ── label ── */
    .login-label {
      display: block; font-size: .78rem; font-weight: 600;
      letter-spacing: .03em; margin-bottom: 7px;
    }
    .login-page.light .login-label { color: #334155; }
    .login-page.dark  .login-label { color: #94A3B8; }

    /* ── field ── */
    .login-field-wrap { position: relative; margin-bottom: 18px; }
    .login-field-icon {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
      pointer-events: none; transition: color .2s;
      display: flex; align-items: center;
    }
    .login-field-icon svg { width: 16px; height: 16px; }
    .login-field-wrap:focus-within .login-field-icon { color: var(--l-accent) !important; }

    .login-input {
      width: 100%; padding: 12px 14px 12px 42px;
      border-radius: 11px; border: 1.5px solid; outline: none;
      font-family: 'DM Sans', sans-serif; font-size: .9rem;
      transition: border-color .2s, box-shadow .2s, background .2s;
      box-sizing: border-box;
    }
    .login-page.light .login-input {
      background: var(--l-field-light);
      border-color: var(--l-field-border-light);
      color: var(--l-text-light);
    }
    .login-page.dark .login-input {
      background: var(--l-field-dark);
      border-color: var(--l-field-border-dark);
      color: var(--l-text-dark);
    }
    .login-input::placeholder { color: #94A3B8; }
    .login-input:focus {
      border-color: var(--l-accent) !important;
      box-shadow: 0 0 0 3px var(--l-accent-glow);
    }
    .login-input-pr { padding-right: 44px; }

    .login-eye {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer;
      display: flex; align-items: center; padding: 4px;
      border-radius: 6px; transition: background .15s;
      color: #94A3B8;
    }
    .login-eye:hover { background: rgba(99,102,241,.1); color: var(--l-accent); }
    .login-eye svg { width: 16px; height: 16px; }

    /* forgot */
    .login-forgot {
      background: none; border: none; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-size: .78rem; font-weight: 600;
      color: var(--l-accent); padding: 0; text-decoration: none;
      transition: opacity .15s;
    }
    .login-forgot:hover { opacity: .75; }

    /* ── checkbox row ── */
    .login-check-row {
      display: flex; align-items: center; gap: 10px; margin-bottom: 22px;
    }
    .login-check-box {
      width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0; transition: all .2s;
    }
    .login-check-box.checked {
      background: var(--l-accent); border-color: var(--l-accent);
      transform: scale(1.05);
    }
    .login-page.light .login-check-box:not(.checked) { border-color: #CBD5E1; background: #fff; }
    .login-page.dark  .login-check-box:not(.checked) { border-color: #1E2E4A; background: var(--l-field-dark); }
    .login-check-label {
      font-size: .84rem; cursor: pointer; user-select: none;
    }
    .login-page.light .login-check-label { color: #64748B; }
    .login-page.dark  .login-check-label { color: #475569; }

    /* ── submit ── */
    .login-submit {
      width: 100%; padding: 13px; border-radius: 11px; border: none;
      font-family: 'Sora', sans-serif; font-size: .9rem; font-weight: 700;
      letter-spacing: .01em; cursor: pointer; color: #fff;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      background: linear-gradient(135deg, #2354E6 0%, #4F63ED 100%);
      box-shadow: 0 8px 24px rgba(35,84,230,.35);
      transition: opacity .2s, transform .15s, box-shadow .2s;
      margin-bottom: 20px;
    }
    .login-submit:hover:not(:disabled) {
      opacity: .92; transform: translateY(-1px);
      box-shadow: 0 12px 32px rgba(35,84,230,.45);
    }
    .login-submit:active:not(:disabled) { transform: scale(.985); }
    .login-submit:disabled { opacity: .55; cursor: not-allowed; }
    .login-submit svg { width: 16px; height: 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .login-spin { animation: spin 1s linear infinite; }

    /* ── security strip ── */
    .login-security {
      display: flex; align-items: center; gap: 10px;
      padding: 11px 14px; border-radius: 11px;
    }
    .login-page.light .login-security { background: #F8FAFF; border: 1px solid #E0E7FF; }
    .login-page.dark  .login-security { background: rgba(35,84,230,.06); border: 1px solid rgba(35,84,230,.12); }
    .login-security-icon {
      width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .login-page.light .login-security-icon { background: #EEF2FF; }
    .login-page.dark  .login-security-icon { background: rgba(35,84,230,.14); }
    .login-security-icon svg { width: 15px; height: 15px; color: var(--l-accent); }
    .login-security p { font-size: .75rem; line-height: 1.4; }
    .login-page.light .login-security p { color: #64748B; }
    .login-page.dark  .login-security p { color: #475569; }

    /* ── footer ── */
    .login-footer {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 20px; padding: 0 2px;
    }
    .login-footer-copy { font-size: .72rem; }
    .login-page.light .login-footer-copy { color: #94A3B8; }
    .login-page.dark  .login-footer-copy { color: #334155; }
    .login-theme-btn {
      width: 34px; height: 34px; border-radius: 9px; border: 1px solid;
      display: flex; align-items: center; justify-content: center;
      background: none; cursor: pointer; transition: all .2s;
    }
    .login-page.light .login-theme-btn {
      border-color: #E2E8F0; color: #64748B;
    }
    .login-page.light .login-theme-btn:hover { background: #F1F5F9; }
    .login-page.dark .login-theme-btn {
      border-color: #1E2E4A; color: #94A3B8;
    }
    .login-page.dark .login-theme-btn:hover { background: #1E2E4A; }
    .login-theme-btn svg { width: 15px; height: 15px; }

    /* label+forgot row */
    .login-label-row {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 7px;
    }
  `;
  document.head.appendChild(s);
};

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  useEffect(() => { injectLoginStyles(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) { setError('Please enter your email or username'); return; }
    if (!password.trim())   { setError('Please enter your password'); return; }
    setLoading(true); setError('');
    try {
      const result = await login(identifier.trim(), password);
      if (result.success) {
        if (rememberMe) localStorage.setItem('remembered_identifier', identifier);
        else            localStorage.removeItem('remembered_identifier');
        navigate('/');
      } else {
        setError(result.error || 'Invalid credentials. Please try again.');
      }
    } catch {
      setError('Connection error. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const mode = darkMode ? 'dark' : 'light';
  const iconColor = darkMode ? '#475569' : '#94A3B8';

  return (
    <div className={`login-root login-page ${mode}`}>
      {/* background decoration */}
      <div className="login-grid" />
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />

      <div className="login-wrapper">

        {/* ── Logo & brand ── */}
        <div className="login-logo-block">
          <div className="login-logo-ring">
            <div className="login-logo-inner">
              {logoError ? (
                <div className="login-logo-fallback">
                  <Building2 />
                  <span>Qine</span>
                </div>
              ) : (
                <img
                  src={logoImage}
                  alt="Qine Consulting"
                  onError={() => setLogoError(true)}
                />
              )}
            </div>
          </div>

          <p className="login-brand-name">Qine Consulting</p>
          <p className="login-brand-sub">Administration Dashboard</p>
        </div>

        {/* ── Card ── */}
        <div className="login-card">
          <h2 className="login-heading">Welcome back</h2>
          <p className="login-subheading">Sign in to your account to continue</p>

          {/* Error */}
          {error && (
            <div className="login-error" key={error}>
              <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontWeight: 600, marginBottom: 2 }}>Authentication failed</p>
                <p style={{ opacity: .85, fontSize: '.8rem' }}>{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Email */}
            <label className="login-label">Email address</label>
            <div className="login-field-wrap">
              <span className="login-field-icon" style={{ color: iconColor }}>
                <Mail />
              </span>
              <input
                type="text"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                className="login-input"
                placeholder="you@qineconsulting.com"
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="login-label-row">
              <label className="login-label" style={{ marginBottom: 0 }}>Password</label>
              <button type="button" className="login-forgot">Forgot password?</button>
            </div>
            <div className="login-field-wrap">
              <span className="login-field-icon" style={{ color: iconColor }}>
                <Lock />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="login-input login-input-pr"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button type="button" className="login-eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* Remember me */}
            <div className="login-check-row">
              <div
                className={`login-check-box ${rememberMe ? 'checked' : ''}`}
                onClick={() => setRememberMe(!rememberMe)}
              >
                {rememberMe && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="login-check-label" onClick={() => setRememberMe(!rememberMe)}>
                Remember me for 30 days
              </span>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="login-submit">
              {loading ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="login-spin" style={{ width: 16, height: 16 }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn />
                  Sign In
                </>
              )}
            </button>

            {/* Security strip */}
            <div className="login-security">
              <div className="login-security-icon">
                <ShieldCheck />
              </div>
              <p>Secure access to Qine Consulting administration. Authorized personnel only.</p>
            </div>
          </form>
        </div>

        {/* ── Footer ── */}
        <div className="login-footer">
          <p className="login-footer-copy">© 2026 Qine Consulting. All rights reserved.</p>
          <button
            className="login-theme-btn"
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun /> : <Moon />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
