import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Eye, EyeOff, LogIn, Sun, Moon, AlertCircle, Loader2, Stethoscope, Heart, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Top area with gradient */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-800 dark:to-primary-950 px-6 pt-12 pb-16 rounded-b-3xl">
        <div className="absolute inset-0 overflow-hidden rounded-b-3xl">
          <div className="absolute top-5 left-5 w-40 h-40 rounded-full bg-accent-400/20 blur-3xl animate-float" />
          <div className="absolute bottom-0 right-5 w-48 h-48 rounded-full bg-white/5 blur-3xl animate-float-slow" />
        </div>

        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
              <Stethoscope size={24} className="text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold">Fruit<span className="text-accent-300">MD</span></h1>
              <p className="text-white/60 text-xs flex items-center gap-1"><Heart size={10} className="text-red-300" /> The Fruit Doctor</p>
            </div>
          </div>
          <button onClick={toggle} className="p-2.5 rounded-xl bg-white/10 text-white" aria-label="Toggle dark mode">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="relative z-10 mt-8 text-white">
          <h2 className="text-2xl font-bold">Welcome back 👋</h2>
          <p className="text-white/70 text-sm mt-1">Sign in to access admin features</p>
        </div>

        {/* Floating fruits */}
        <div className="absolute bottom-3 right-6 flex gap-2 text-2xl">
          <span className="animate-float" style={{ animationDelay: '0s' }}>🍎</span>
          <span className="animate-float" style={{ animationDelay: '0.5s' }}>🍊</span>
          <span className="animate-float" style={{ animationDelay: '1s' }}>🥭</span>
          <span className="animate-float" style={{ animationDelay: '1.5s' }}>🍇</span>
          <span className="animate-float" style={{ animationDelay: '2s' }}>🍌</span>
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 px-6 -mt-6">
        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm animate-slide-up">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="input-field"
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input-field pr-11"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            {loading ? 'Signing in…' : 'Sign in as Admin'}
          </button>
        </form>

        {/* Guest option */}
        <button
          onClick={() => window.location.href = '/detect'}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
        >
          <Stethoscope size={16} className="text-primary-500" />
          Continue as Guest
          <ArrowRight size={14} className="text-gray-400" />
        </button>

        <p className="text-center text-xs text-gray-400 mt-6 mb-8">
          <Heart size={10} className="inline text-red-400 mr-1" />
          FruitMD — The Fruit Doctor
        </p>
      </div>
    </div>
  );
}
