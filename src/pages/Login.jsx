// src/pages/Login.jsx - PROFESSIONAL ENHANCED VERSION
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { 
  Store, Mail, Lock, Eye, EyeOff, LogIn, Shield,
  User, Bike, Building2, ArrowRight, AlertCircle,
  CheckCircle, Moon, Sun
} from 'lucide-react';
import logoImage from '../assets/icon.png';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [activeRole, setActiveRole] = useState('admin');
  
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

  // Quick demo login
  const demoLogin = (role) => {
    const credentials = {
      admin: { identifier: 'admin@qine.com', password: 'admin123' },
      merchant: { identifier: 'merchant@qine.com', password: 'merchant123' },
      rider: { identifier: 'rider@qine.com', password: 'rider123' }
    };
    const cred = credentials[role];
    setIdentifier(cred.identifier);
    setPassword(cred.password);
    setActiveRole(role);
  };

  const roles = [
    { id: 'admin', label: 'Admin', icon: Shield, color: 'blue' },
    { id: 'merchant', label: 'Merchant', icon: Building2, color: 'green' },
    { id: 'rider', label: 'Rider', icon: Bike, color: 'purple' },
  ];

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative ${
      darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-5 ${
          darkMode ? 'bg-blue-500' : 'bg-blue-600'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5 ${
          darkMode ? 'bg-indigo-500' : 'bg-indigo-600'
        }`}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              {logoImage ? (
                <img src={logoImage} alt="QINE" className="w-14 h-14 object-contain" />
              ) : (
                <Store className="w-10 h-10 text-blue-600" />
              )}
            </div>
          </div>
          <h1 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            QINE Admin
          </h1>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Super App Administration Dashboard
          </p>
        </div>

        {/* Main Card */}
        <div className={`rounded-2xl shadow-2xl p-8 backdrop-blur-sm ${
          darkMode ? 'bg-gray-800/90 border border-gray-700' : 'bg-white/90 border border-gray-100'
        }`}>
          
          {/* Role Selector Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl bg-gray-100 dark:bg-gray-700">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => demoLogin(role.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeRole === role.id
                    ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <role.icon className="w-3.5 h-3.5" />
                {role.label}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-4 p-3.5 rounded-xl flex items-start gap-3 text-sm animate-shake ${
              darkMode ? 'bg-red-900/30 border border-red-800 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Login Failed</p>
                <p className="text-xs mt-0.5 opacity-80">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {!error && identifier && password && (
            <div className={`mb-4 p-3.5 rounded-xl flex items-start gap-3 text-sm ${
              darkMode ? 'bg-blue-900/30 border border-blue-800 text-blue-300' : 'bg-blue-50 border border-blue-200 text-blue-700'
            }`}>
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Ready to Login</p>
                <p className="text-xs mt-0.5 opacity-80">Click Sign In to access the dashboard</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Identifier Input */}
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email or Username
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                  identifier ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl transition-all text-sm ${
                    darkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-gray-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="admin@qine.com"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <button type="button" className={`text-xs font-medium ${
                  darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}>
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                  password ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className={`w-full pl-11 pr-12 py-3 rounded-xl transition-all text-sm ${
                    darkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-gray-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors mr-2.5 ${
                  rememberMe 
                    ? 'bg-blue-600 border-blue-600' 
                    : darkMode ? 'border-gray-600' : 'border-gray-300'
                }`}
              >
                {rememberMe && <CheckCircle className="w-3 h-3 text-white" />}
              </button>
              <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} cursor-pointer`}
                onClick={() => setRememberMe(!rememberMe)}>
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40'
              } text-white`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className={`px-3 ${darkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-400'}`}>
                Quick Access
              </span>
            </div>
          </div>

          {/* Demo Login Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => demoLogin(role.id)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeRole === role.id
                    ? role.id === 'admin' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : role.id === 'merchant'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-purple-600 text-white shadow-md'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <role.icon className="w-3.5 h-3.5" />
                {role.label}
              </button>
            ))}
          </div>

          {/* Default Credentials */}
          <p className={`text-center text-xs mt-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            {activeRole === 'admin' && 'admin@qine.com / admin123'}
            {activeRole === 'merchant' && 'merchant@qine.com / merchant123'}
            {activeRole === 'rider' && 'rider@qine.com / rider123'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6 px-2">
          <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            © 2026 QINE Super App
          </p>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;