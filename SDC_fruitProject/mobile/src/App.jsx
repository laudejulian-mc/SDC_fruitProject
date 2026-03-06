import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './contexts/AuthContext';
import MobileLayout from './components/MobileLayout';
import { Loader2, Stethoscope, Heart, Scan, Activity, CheckCircle2 } from 'lucide-react';

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
    <div className="flex items-center justify-center h-48">
      <Loader2 size={24} className="animate-spin text-primary-500" />
    </div>
  );
}

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? children : <Navigate to="/detect" replace />;
}

/* ── Splash Screen (mobile-optimized) ── */
function SplashScreen({ onFinish, holdOpen = false }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => {
        setPhase(4);
        setTimeout(() => onFinish(), 400);
      }, 2400),
    ];
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayPhase = holdOpen ? 3 : phase;

  return (
    <div className={`fixed inset-0 z-[99999] flex items-center justify-center transition-opacity duration-400 ${
      displayPhase >= 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-700 dark:from-gray-950 dark:via-primary-950 dark:to-gray-950">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[15%] left-[10%] w-48 h-48 rounded-full bg-accent-500/15 blur-3xl animate-float" />
          <div className="absolute bottom-[20%] right-[10%] w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl animate-float-slow" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-white px-8">
        {/* Logo */}
        <div className={`transition-all duration-500 ease-out ${displayPhase >= 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl ring-1 ring-white/20">
              <Stethoscope size={40} className="text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-white/30" style={{ animationDuration: '2s' }} />
            <span className={`absolute -top-2 -right-2 text-xl transition-all duration-500 ${displayPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>🍎</span>
            <span className={`absolute -bottom-1 -left-2 text-xl transition-all duration-500 delay-100 ${displayPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>🥭</span>
            <span className={`absolute -top-1 -left-3 text-base transition-all duration-500 delay-200 ${displayPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>🍊</span>
            <span className={`absolute -bottom-2 -right-3 text-base transition-all duration-500 delay-300 ${displayPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>🍇</span>
          </div>
        </div>

        {/* Brand */}
        <div className={`mt-6 text-center transition-all duration-500 ${displayPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Fruit<span className="text-accent-300">MD</span>
          </h1>
          <p className="text-white/60 text-sm mt-1 flex items-center justify-center gap-1">
            <Heart size={11} className="text-red-300" /> The Fruit Doctor
          </p>
        </div>

        {/* Feature pills */}
        <div className={`flex flex-wrap justify-center gap-2 mt-6 transition-all duration-500 ${displayPhase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          {[
            { icon: Scan, text: 'AI Diagnosis' },
            { text: '🍎🍊🥭🍇🍌' },
            { icon: Activity, text: 'Real-time' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-white/80">
              {Icon && <Icon size={11} />}
              {text}
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className={`mt-8 flex flex-col items-center gap-2 transition-all duration-500 ${displayPhase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-40 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-accent-400 to-emerald-400"
              style={{ animation: displayPhase >= 3 ? 'progressFill 1s ease-out forwards' : 'none' }} />
          </div>
          <div className="flex items-center gap-1.5">
            {displayPhase < 4 ? (
              <>
                <Loader2 size={11} className="animate-spin text-white/50" />
                <span className="text-xs text-white/50">Initializing…</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={11} className="text-emerald-400" />
                <span className="text-xs text-emerald-400">Ready!</span>
              </>
            )}
          </div>
        </div>

        <p className={`mt-6 text-[10px] text-white/20 tracking-widest uppercase transition-all duration-500 ${displayPhase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          Mobile • AI-Powered Fruit Quality Detection
        </p>
      </div>
    </div>
  );
}

/* ── Transition Overlay ── */
function TransitionOverlay({ type }) {
  const isLogin = type === 'login';
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className={`absolute inset-0 ${isLogin ? 'bg-gradient-to-br from-primary-600 to-emerald-700' : 'bg-gradient-to-br from-gray-900 to-gray-950'}`} />
      <div className="relative z-10 flex flex-col items-center gap-4 text-white animate-bounce-in">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl">
          <Stethoscope size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold">{isLogin ? 'Welcome, Doctor!' : 'See You Soon!'}</h2>
        <div className="flex items-center gap-2">
          <Loader2 size={16} className="animate-spin text-white/70" />
          <span className="text-sm text-white/70">{isLogin ? 'Preparing…' : 'Signing out…'}</span>
        </div>
        <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
          <div className={`h-full rounded-full ${isLogin ? 'bg-emerald-400' : 'bg-orange-400'}`}
            style={{ animation: `progressFill ${isLogin ? '1.4s' : '1s'} ease-out forwards` }} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isAdmin, loading, transitioning } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const ready = splashDone && !loading;

  if (!ready) {
    return <SplashScreen onFinish={() => setSplashDone(true)} holdOpen={splashDone && loading} />;
  }

  const overlay = transitioning ? <TransitionOverlay type={transitioning} /> : null;

  if (!isAuthenticated) {
    return (
      <>
        {overlay}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<MobileLayout />}>
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

  return (
    <>
      {overlay}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MobileLayout />}>
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
