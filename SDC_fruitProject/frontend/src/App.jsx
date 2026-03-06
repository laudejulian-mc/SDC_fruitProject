import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import GuestLayout from './components/GuestLayout';
import CursorPicker from './components/CursorPicker';
import { Loader2, Stethoscope, LogIn, LogOut, Sparkles, ShieldCheck, Heart, Apple, Scan, Activity, CheckCircle2 } from 'lucide-react';

// Lazy-load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Detect = lazy(() => import('./pages/Detect'));
const LiveScan = lazy(() => import('./pages/LiveScan'));
const History = lazy(() => import('./pages/History'));
const Reports = lazy(() => import('./pages/Reports'));
const Chatbot = lazy(() => import('./pages/Chatbot'));
const Settings = lazy(() => import('./pages/Settings'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-primary-500" />
    </div>
  );
}

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? children : <Navigate to="/detect" replace />;
}

function SplashScreen({ onFinish, holdOpen = false }) {
  const [phase, setPhase] = useState(0);
  // phase 0 = logo pop-in, 1 = brand text, 2 = tagline + features, 3 = progress bar, 4 = fade out

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => {
        setPhase(4);
        // Small delay after fade-out animation before signaling done
        setTimeout(() => onFinish(), 500);
      }, 3000),
    ];
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If animation finished but auth is still loading, hold the splash visible at phase 3
  const displayPhase = holdOpen ? 3 : phase;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center transition-opacity duration-500 ${
        displayPhase >= 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-700 dark:from-gray-950 dark:via-primary-950 dark:to-gray-950">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[10%] left-[15%] w-80 h-80 rounded-full bg-accent-500/15 blur-3xl animate-float" />
          <div className="absolute bottom-[15%] right-[10%] w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl animate-float-slow" />
          <div className="absolute top-[50%] left-[60%] w-64 h-64 rounded-full bg-white/5 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-white">
        {/* Logo */}
        <div className={`transition-all duration-700 ease-out ${
          displayPhase >= 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}>
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-black/20 ring-1 ring-white/20">
              <Stethoscope size={48} className="text-white drop-shadow-lg" />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-3xl animate-ping opacity-20 bg-white/30" style={{ animationDuration: '2s' }} />
            {/* Floating fruit emojis */}
            <span className={`absolute -top-3 -right-3 text-2xl transition-all duration-500 ${
              displayPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`} style={{ animationDelay: '0.2s' }}>🍎</span>
            <span className={`absolute -bottom-2 -left-3 text-2xl transition-all duration-500 delay-150 ${
              displayPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>🥭</span>
            <span className={`absolute -top-2 -left-4 text-lg transition-all duration-500 delay-200 ${
              displayPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>🍊</span>
            <span className={`absolute -bottom-3 -right-4 text-lg transition-all duration-500 delay-300 ${
              displayPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>🍇</span>
            <span className={`absolute top-1/2 -right-6 text-lg transition-all duration-500 delay-100 ${
              displayPhase >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}>🍌</span>
          </div>
        </div>

        {/* Brand name */}
        <div className={`mt-8 text-center transition-all duration-600 ease-out ${
          displayPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          <h1 className="text-5xl font-extrabold tracking-tight">
            Fruit<span className="text-accent-300">MD</span>
          </h1>
          <div className={`flex items-center justify-center gap-1.5 mt-2 transition-all duration-500 delay-200 ${
            displayPhase >= 1 ? 'opacity-100' : 'opacity-0'
          }`}>
            <Heart size={12} className="text-red-300" />
            <p className="text-white/60 text-sm font-medium tracking-wide">The Fruit Doctor</p>
          </div>
        </div>

        {/* Feature pills */}
        <div className={`flex flex-wrap items-center justify-center gap-2 mt-8 transition-all duration-500 ${
          displayPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          {[
            { icon: Scan, text: 'AI Diagnosis' },
            { icon: Apple, text: '🍎🍊🥭🍇🍌' },
            { icon: Activity, text: 'Real-time Analysis' },
          ].map(({ icon: Icon, text }, i) => (
            <div
              key={text}
              className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-white/80"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <Icon size={12} />
              {text}
            </div>
          ))}
        </div>

        {/* Progress section */}
        <div className={`mt-10 flex flex-col items-center gap-3 transition-all duration-500 ${
          displayPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="w-52 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-400 to-emerald-400"
              style={{ animation: displayPhase >= 3 ? 'progressFill 1.2s ease-out forwards' : 'none' }}
            />
          </div>
          <div className="flex items-center gap-2">
            {displayPhase < 4 ? (
              <>
                <Loader2 size={12} className="animate-spin text-white/50" />
                <span className="text-xs text-white/50">{holdOpen ? 'Preparing your session…' : 'Initializing clinic…'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span className="text-xs text-emerald-400">Ready!</span>
              </>
            )}
          </div>
        </div>

        {/* Version tag */}
        <p className={`mt-8 text-[10px] text-white/20 tracking-widest uppercase transition-all duration-500 ${
          displayPhase >= 2 ? 'opacity-100' : 'opacity-0'
        }`}>
          v1.0 • AI-Powered Fruit Quality Detection
        </p>
      </div>
    </div>
  );
}

function TransitionOverlay({ type }) {
  const isLogin = type === 'login';
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500"
      style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Background */}
      <div className={`absolute inset-0 ${
        isLogin
          ? 'bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-700'
          : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950'
      }`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-white/5 blur-3xl animate-float-slow" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-white animate-bounce-in">
        <div className="relative">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl ${
            isLogin
              ? 'bg-white/20 backdrop-blur-xl'
              : 'bg-white/10 backdrop-blur-xl'
          }`}>
            <Stethoscope size={36} className="text-white" />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${
            isLogin ? 'bg-emerald-500' : 'bg-orange-500'
          }`}>
            {isLogin ? <ShieldCheck size={16} /> : <LogOut size={16} />}
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            {isLogin ? 'Welcome, Doctor!' : 'See You Soon!'}
          </h2>
          <p className="text-white/60 text-sm max-w-xs">
            {isLogin
              ? 'Setting up your clinic dashboard and analytics…'
              : 'Signing out of admin mode…'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Loader2 size={18} className="animate-spin text-white/70" />
          <span className="text-sm text-white/70 font-medium">
            {isLogin ? 'Preparing dashboard…' : 'Closing session…'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full rounded-full ${isLogin ? 'bg-emerald-400' : 'bg-orange-400'}`}
            style={{ animation: `progressFill ${isLogin ? '1.6s' : '1.2s'} ease-out forwards` }}
          />
        </div>

        <div className="flex items-center gap-2 text-white/40 text-xs mt-2">
          <Heart size={10} className="text-red-400" />
          <span>FruitMD — The Fruit Doctor</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isAdmin, loading, transitioning } = useAuth();
  const [splashAnimDone, setSplashAnimDone] = useState(false);

  // Keep splash visible until BOTH the animation finishes AND auth loading completes
  const splashDone = splashAnimDone && !loading;

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashAnimDone(true)} holdOpen={splashAnimDone && loading} />;
  }

  // Show transition overlay during login/logout
  const overlay = transitioning ? <TransitionOverlay type={transitioning} /> : null;

  // Guest (not logged in)
  if (!isAuthenticated) {
    return (
      <>
        {overlay}
        <CursorPicker />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<GuestLayout />}>
              <Route path="detect" element={<Detect />} />
              <Route path="live" element={<LiveScan />} />
              <Route path="chatbot" element={<Chatbot />} />
            </Route>
            <Route path="*" element={<Navigate to="/detect" replace />} />
          </Routes>
        </Suspense>
      </>
    );
  }

  // Admin (logged in)
  return (
    <>
      {overlay}
      <CursorPicker />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="detect" element={<Detect />} />
            <Route path="live" element={<LiveScan />} />
            <Route path="history" element={<AdminRoute><History /></AdminRoute>} />
            <Route path="reports" element={<AdminRoute><Reports /></AdminRoute>} />
            <Route path="chatbot" element={<Chatbot />} />
            <Route path="settings" element={<AdminRoute><Settings /></AdminRoute>} />
          </Route>
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
