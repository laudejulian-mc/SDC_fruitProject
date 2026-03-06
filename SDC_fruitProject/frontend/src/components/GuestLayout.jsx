import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';
import { ScanSearch, Video, Sun, Moon, LogIn, Stethoscope, Heart, MessageSquareText, Sparkles, Shield, Zap, Camera, Upload, Brain, BarChart3, Apple, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export default function GuestLayout() {
  const { dark, toggle } = useTheme();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const NAV = [
    { to: '/detect', label: t('nav.uploadDiagnose'), icon: ScanSearch },
    { to: '/live', label: t('nav.liveCamera'), icon: Video },
    { to: '/chatbot', label: t('nav.aiDoctor'), icon: MessageSquareText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-orange-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-gray-950/70 backdrop-blur-2xl border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/detect" className="flex items-center gap-3 group" aria-label="Home">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 group-hover:scale-105 transition-all duration-300">
              <Stethoscope size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Fruit<span className="text-gradient">MD</span></h1>
              <p className="text-xs text-gray-400 leading-tight flex items-center gap-1">
                <Heart size={10} className="text-red-400" /> {t('tagline')}
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl" role="navigation" aria-label="Guest navigation">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={() =>
                  clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    location.pathname === to
                      ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  )
                }
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <button onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Toggle dark mode">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => navigate('/login')} className="btn-primary text-sm !py-2 !px-4">
              <LogIn size={14} />
              <span className="hidden sm:inline">{t('auth.drLogin')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Hero banner */}
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-600 dark:from-primary-700 dark:via-primary-600 dark:to-emerald-700 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -mr-10 -mt-10 blur-2xl animate-float" />
          <div className="absolute bottom-0 left-1/3 w-60 h-32 rounded-full bg-white/5 blur-3xl" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope size={20} />
                <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">{t('guestMode')}</span>
                <span className="flex items-center gap-1 text-sm bg-white/15 backdrop-blur-sm px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> {t('online')}
                </span>
              </div>
              <h2 className="text-xl font-bold">{t('guest.welcome')}</h2>
              <p className="text-white/70 text-base mt-1">{t('guest.heroSubtitle')}</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 self-start sm:self-center"
            >
              <Shield size={14} /> {t('auth.adminLogin')} <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Quick feature widgets — bento style */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Upload, label: t('guest.uploadDiagnose'), desc: t('guest.formats'), color: 'primary', path: '/detect' },
            { icon: Camera, label: t('guest.liveCamera'), desc: t('guest.realTimeScan'), color: 'blue', path: '/live' },
            { icon: Brain, label: t('guest.aiDoctorChat'), desc: t('guest.askAnything'), color: 'purple', path: '/chatbot' },
            { icon: Apple, label: t('guest.multiFruit'), desc: t('guest.fiveFruits'), color: 'orange', path: null },
          ].map(({ icon: Icon, label, desc, color, path }) => (
            <div
              key={label}
              onClick={() => path && navigate(path)}
              className={clsx(
                'card !p-4 text-center space-y-2 transition-all duration-200',
                path && 'cursor-pointer hover:scale-[1.02] hover:shadow-lg'
              )}
            >
              <div className={`w-12 h-12 mx-auto rounded-xl bg-${color}-50 dark:bg-${color}-900/20 flex items-center justify-center`}>
                <Icon size={20} className={`text-${color}-500`} />
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-6 card !py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
            {[
              { step: '1', icon: Upload, text: t('guest.howStep1') },
              { step: '2', icon: Zap, text: t('guest.howStep2') },
              { step: '3', icon: CheckCircle2, text: t('guest.howStep3') },
            ].map(({ step, icon: Icon, text }, i) => (
              <div key={step} className="flex items-center gap-3">
                {i > 0 && <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 hidden sm:block" />}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{step}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                    <Icon size={14} className="text-gray-400" />
                    {text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capabilities */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Sparkles, label: t('guest.aiPowered'), value: t('guest.deepLearning'), color: 'text-purple-500' },
            { icon: Clock, label: t('guest.instant'), value: t('guest.lessThan2Sec'), color: 'text-blue-500' },
            { icon: BarChart3, label: t('guest.gradesLabel'), value: t('guest.gradesList'), color: 'text-emerald-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card !p-3 text-center">
              <Icon size={16} className={`mx-auto mb-1.5 ${color}`} />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <div className="animate-fade-in">
          <Outlet />
        </div>

        <div className="mt-8 text-center text-xs text-gray-400 space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <Heart size={12} className="text-red-400" /> {t('appName')} — {t('tagline')}
          </p>
          <p>{t('guest.footer')}</p>
        </div>
      </main>
    </div>
  );
}
