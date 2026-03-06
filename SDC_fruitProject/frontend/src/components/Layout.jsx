import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';
import {
  LayoutDashboard, ScanSearch, Video, History, FileBarChart,
  Sun, Moon, Menu, X, LogOut, Shield, Sparkles, Activity,
  ChevronDown, Stethoscope, Heart, MessageSquareText, Settings,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export default function Layout() {
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const NAV = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, section: t('sections.analytics') },
    { to: '/detect', label: t('nav.detect'), icon: ScanSearch, section: t('sections.inspection') },
    { to: '/live', label: t('nav.liveScan'), icon: Video, section: t('sections.inspection') },
    { to: '/chatbot', label: t('nav.aiDoctor'), icon: MessageSquareText, section: t('sections.inspection') },
    { to: '/history', label: t('nav.history'), icon: History, section: t('sections.data') },
    { to: '/reports', label: t('nav.reports'), icon: FileBarChart, section: t('sections.data') },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = (path) =>
    clsx(
      'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
      location.pathname === path
        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-600/25'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100'
    );

  const sections = NAV.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:static lg:translate-x-0 flex flex-col',
          'bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl border-r border-gray-200/60 dark:border-gray-800/60',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200/60 dark:border-gray-800/60">
          <Link to="/dashboard" className="flex items-center gap-3 group" aria-label={t('nav.dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 group-hover:scale-105 transition-all duration-300">
              <Stethoscope size={22} />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Fruit<span className="text-gradient">MD</span></h1>
              <p className="text-xs text-gray-400 leading-tight flex items-center gap-1">
                <Heart size={10} className="text-red-400" /> {t('tagline')}
              </p>
            </div>
          </Link>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto" role="navigation" aria-label="Main navigation">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section}>
              <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {section}
              </p>
              <div className="space-y-1">
                {items.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={() => linkClass(to)} onClick={() => setSidebarOpen(false)}>
                    <Icon size={18} />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User card */}
        <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.first_name || user?.username}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Shield size={10} className="text-primary-500" />
                {t('auth.adminLogin').replace(' Login', '')}
              </p>
            </div>
            <NavLink
              to="/settings"
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-500 transition-colors"
              title={t('settings.title')}
              aria-label={t('settings.title')}
              onClick={() => setSidebarOpen(false)}
            >
              <Settings size={15} />
            </NavLink>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
              title={t('auth.logout')}
              aria-label={t('auth.logout')}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 bg-white/70 dark:bg-gray-950/70 backdrop-blur-2xl border-b border-gray-200/60 dark:border-gray-800/60 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold capitalize">
                {location.pathname.slice(1) || t('nav.dashboard')}
              </h2>
              <p className="text-xs text-gray-400 -mt-0.5">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
              <Activity size={12} className="animate-pulse" />
              <span className="text-xs font-medium">{t('systemOnline')}</span>
            </div>

            <span className="text-xs px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium flex items-center gap-1">
              <Shield size={10} />
              Admin
            </span>

            <button
              onClick={toggle}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <LanguageSwitcher compact />

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="User menu"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                  {user?.first_name?.[0] || 'A'}
                </div>
                <ChevronDown size={12} className="text-gray-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 z-50 card !p-2 shadow-xl animate-slide-up">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                      <p className="text-sm font-medium">{user?.first_name || user?.username}</p>
                      <p className="text-xs text-gray-400">{user?.email || 'admin@fruitmd.app'}</p>
                    </div>
                    <NavLink
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Settings size={14} />
                      {t('settings.title')}
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <LogOut size={14} />
                      {t('auth.logout')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
