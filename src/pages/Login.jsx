// src/pages/Login.jsx - PROFESSIONAL ENHANCED VERSION
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { 
  Mail, Lock, Eye, EyeOff, LogIn, AlertCircle,
  CheckCircle, Moon, Sun, Building2
} from 'lucide-react';
import logoImage from '../assets/icon.png';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!identifier.trim()) {
      setError('Please enter your email or username');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await login(identifier.trim(), password);
      
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('remembered_identifier', identifier);
        } else {
          localStorage.removeItem('remembered_identifier');
        }
        navigate('/');
      } else {
        setError(result.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative ${
      darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.03] animate-pulse ${
          darkMode ? 'bg-blue-500' : 'bg-blue-600'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-[30rem] h-[30rem] rounded-full opacity-[0.03] animate-pulse delay-1000 ${
          darkMode ? 'bg-indigo-500' : 'bg-indigo-600'
        }`}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo & Brand Section */}
        <div className="text-center mb-8">
          {/* Logo - Clean, no frame, large display */}
          <div className="flex justify-center mb-6">
            <img 
              src={logoImage} 
              alt="Qine Consulting" 
              className="w-auto h-24 md:h-28 object-contain mx-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'flex flex-col items-center justify-center mx-auto';
                fallback.innerHTML = `
                  <svg class="w-16 h-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span class="text-lg font-bold text-blue-600 mt-2">QINE</span>
                `;
                e.target.parentNode.appendChild(fallback);
              }}
            />
          </div>
          
          {/* Brand Name */}
          <div className="space-y-1">
            <h1 className={`text-4xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Qine Consulting
            </h1>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Administration Dashboard
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className={`rounded-3xl shadow-2xl p-8 backdrop-blur-sm ${
          darkMode 
            ? 'bg-gray-800/95 border border-gray-700' 
            : 'bg-white/95 border border-gray-100'
        }`}>
          
          {/* Card Header */}
          <div className="mb-8">
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome Back
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Please sign in to your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-4 p-4 rounded-2xl flex items-start gap-3 text-sm animate-shake ${
              darkMode 
                ? 'bg-red-900/40 border border-red-800 text-red-300' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Authentication Failed</p>
                <p className="text-xs mt-1 opacity-80">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Username Input */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                  identifier ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl transition-all duration-200 text-sm ${
                    darkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-gray-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white'
                  } border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/10`}
                  placeholder="Enter your email"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <button 
                  type="button" 
                  className={`text-xs font-medium transition-colors ${
                    darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                  password ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className={`w-full pl-12 pr-12 py-3.5 rounded-2xl transition-all duration-200 text-sm ${
                    darkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-gray-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white'
                  } border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/10`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 mr-3 ${
                  rememberMe 
                    ? 'bg-blue-600 border-blue-600 scale-110' 
                    : darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {rememberMe && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <label 
                className={`text-sm select-none cursor-pointer ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                onClick={() => setRememberMe(!rememberMe)}
              >
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 transform ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40'
              } text-white`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 ${
            darkMode ? 'bg-gray-900/50' : 'bg-gray-50'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <Building2 className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Secure access to Qine Consulting administration panel. Authorized personnel only.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6 px-2">
          <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            © 2026 Qine Consulting. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl transition-all duration-200 ${
                darkMode 
                  ? 'text-yellow-400 hover:bg-gray-800 hover:scale-110' 
                  : 'text-gray-500 hover:bg-gray-100 hover:scale-110'
              }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default Login;