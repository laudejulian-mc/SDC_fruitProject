import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';
import {
  LayoutDashboard, ScanSearch, Video, History, FileBarChart,
  Sun, Moon, LogOut, LogIn, Stethoscope, Heart, MessageSquareText,
  Activity, ChevronLeft, Settings,
} from 'lucide-react';
import clsx from 'clsx';

export default function MobileLayout() {
  const { dark, toggle } = useTheme();
  const { user, logout, isAdmin } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const TABS = isAdmin ? [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/detect', label: t('nav.detect'), icon: ScanSearch },
    { to: '/live', label: t('nav.liveScan'), icon: Video },
    { to: '/chatbot', label: t('nav.aiDoctor'), icon: MessageSquareText },
    { to: '/history', label: t('nav.history'), icon: History },
  ] : [
    { to: '/detect', label: t('nav.detect'), icon: ScanSearch },
    { to: '/live', label: t('nav.liveScan'), icon: Video },
    { to: '/chatbot', label: t('nav.aiDoctor'), icon: MessageSquareText },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const pageTitle = () => {
    const path = location.pathname.slice(1);
    const map = {
      dashboard: t('nav.dashboard'),
      detect: t('nav.detect'),
      live: t('nav.liveScan'),
      chatbot: t('nav.aiDoctor'),
      history: t('nav.history'),
      reports: t('nav.reports'),
      settings: t('settings.title'),
    };
    return map[path] || 'FruitMD';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top header bar */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl border-b border-gray-200/60 dark:border-gray-800/60 sticky top-0 z-30">
        <div className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate(isAdmin ? '/dashboard' : '/detect')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center shadow-md">
            <Stethoscope size={16} />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">
              Fruit<span className="text-gradient">MD</span>
            </h1>
            <p className="text-[10px] text-gray-400 leading-tight flex items-center gap-0.5">
              <Heart size={8} className="text-red-400" /> {t('tagline')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Online indicator */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20">
            <Activity size={10} className="text-green-500 animate-pulse" />
            <span className="text-[10px] font-medium text-green-600 dark:text-green-400">{t('online')}</span>
          </div>

          <LanguageSwitcher />

          <button
            onClick={toggle}
            className="p-2 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAdmin ? (
            <>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 rounded-xl text-gray-400 active:text-primary-500 transition-colors"
                aria-label={t('settings.title')}
              >
                <Settings size={18} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-gray-400 active:text-red-500 transition-colors"
                aria-label={t('auth.logout')}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-primary-500 text-white text-xs font-semibold active:bg-primary-600 transition-colors shadow-sm"
              aria-label="Login"
            >
              <LogIn size={14} />
              <span>{t('auth.login') || 'Login'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl border-t border-gray-200/60 dark:border-gray-800/60 pb-safe">
        <div className="flex items-center justify-around px-2 py-1.5">
          {TABS.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[60px] rounded-xl transition-all active:scale-95"
              >
                <div className={clsx(
                  'flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200',
                  active ? 'bg-primary-100 dark:bg-primary-900/30' : ''
                )}>
                  <Icon
                    size={20}
                    className={clsx(
                      'transition-colors',
                      active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
                    )}
                  />
                </div>
                <span className={clsx(
                  'text-[10px] font-medium transition-colors',
                  active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
                )}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
