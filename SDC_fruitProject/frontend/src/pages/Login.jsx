import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Eye, EyeOff, LogIn, Sun, Moon, Shield, AlertCircle, Loader2, Stethoscope, Heart, Microscope, Apple, Cherry } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-800 dark:via-primary-900 dark:to-primary-950 items-center justify-center p-12">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-accent-400/20 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white/5 blur-3xl animate-float-slow" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-accent-500/10 blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 text-white max-w-lg space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
              <Stethoscope size={36} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Fruit<span className="text-accent-300">MD</span></h1>
              <p className="text-white/70 text-sm flex items-center gap-1"><Heart size={12} className="text-red-300" /> Fruit Health Diagnosis</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Your Fruit's<br />Health Expert 🩺
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              AI-powered fruit quality diagnosis for apples, oranges, mangoes, grapes, and bananas.
              Instant classification. Accurate grading. Smart analytics.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4 pt-4">
            {[
              { icon: Microscope, text: 'AI diagnosis for 5 fruit types' },
              { icon: Shield, text: 'Fresh vs Rotten classification' },
              { icon: Apple, text: 'Real-time camera & batch processing' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>

          {/* Floating fruit emojis */}
          <div className="flex items-center gap-3 pt-4 text-3xl">
            <span className="animate-float" style={{ animationDelay: '0s' }}>🍎</span>
            <span className="animate-float" style={{ animationDelay: '0.7s' }}>🍊</span>
            <span className="animate-float" style={{ animationDelay: '1.4s' }}>🥭</span>
            <span className="animate-float" style={{ animationDelay: '2.1s' }}>🍇</span>
            <span className="animate-float" style={{ animationDelay: '2.8s' }}>�</span>
            <span className="animate-float" style={{ animationDelay: '3.5s' }}>🧑‍⚕️</span>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Theme toggle */}
          <div className="flex justify-end">
            <button
              onClick={toggle}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Stethoscope size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Fruit<span className="text-gradient">MD</span></h1>
              <p className="text-xs text-gray-400 flex items-center gap-1"><Heart size={10} className="text-red-400" /> The Fruit Doctor</p>
            </div>
          </div>

          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, Doctor 👋</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Sign in as <span className="font-medium text-primary-600 dark:text-primary-400">Admin</span> to access full diagnosis features
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm animate-slide-up" role="alert">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="input-field"
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              {loading ? 'Signing in…' : 'Sign in as Admin'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-3 text-gray-400">or</span>
            </div>
          </div>

          {/* Guest info */}
          <div className="card bg-gray-50 dark:bg-gray-800/50 text-center space-y-3 !p-5">
            <button
              type="button"
              onClick={() => window.location.href = '/detect'}
              className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors w-full cursor-pointer"
            >
              <Stethoscope size={16} className="text-primary-500" />
              Continue as Guest →
            </button>
            <p className="text-xs text-gray-400 leading-relaxed">
              Guests can upload images and use the live camera to diagnose fruit quality.
              Sign in as Admin for dashboard analytics, history, and reports.
            </p>
            <p className="text-[11px] text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              Default credentials: <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono">admin</code> / <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono">admin</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
