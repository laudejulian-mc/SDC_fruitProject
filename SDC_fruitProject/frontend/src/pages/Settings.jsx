import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { changeUsername, changePassword } from '../api';
import {
  Settings as SettingsIcon, User, Lock, Eye, EyeOff,
  CheckCircle2, AlertCircle, Loader2, Shield, KeyRound,
} from 'lucide-react';

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const { t } = useI18n();

  /* ── Username state ── */
  const [uCurrent, setUCurrent] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [uMsg, setUMsg] = useState(null); // { type: 'ok'|'err', text }
  const [uLoading, setULoading] = useState(false);

  /* ── Password state ── */
  const [pCurrent, setPCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [pMsg, setPMsg] = useState(null);
  const [pLoading, setPLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ── Handlers ── */
  const handleUsername = async (e) => {
    e.preventDefault();
    setUMsg(null);
    if (!uCurrent.trim() || !newUsername.trim()) {
      return setUMsg({ type: 'err', text: t('settings.fillAllFields') });
    }
    setULoading(true);
    try {
      await changeUsername(uCurrent, newUsername);
      setUMsg({ type: 'ok', text: t('settings.usernameUpdated') });
      setUCurrent('');
      setNewUsername('');
      await refreshUser();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error updating username';
      setUMsg({ type: 'err', text: msg });
    } finally {
      setULoading(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPMsg(null);
    if (!pCurrent.trim() || !newPass.trim() || !confirmPass.trim()) {
      return setPMsg({ type: 'err', text: t('settings.fillAllFields') });
    }
    if (newPass !== confirmPass) {
      return setPMsg({ type: 'err', text: t('settings.passwordsNoMatch') });
    }
    setPLoading(true);
    try {
      await changePassword(pCurrent, newPass, confirmPass);
      setPMsg({ type: 'ok', text: t('settings.passwordUpdated') });
      setPCurrent('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      const msg = err.response?.data?.error || 'Error updating password';
      setPMsg({ type: 'err', text: msg });
    } finally {
      setPLoading(false);
    }
  };

  const inputCls =
    'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-sm focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400';

  const btnCls =
    'w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/25">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
          <p className="text-sm text-gray-400">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Current user info */}
      <div className="card !p-4 flex items-center gap-3 bg-primary-50/50 dark:bg-primary-900/10 border border-primary-200/40 dark:border-primary-800/30">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
          {user?.username?.[0]?.toUpperCase() || 'A'}
        </div>
        <div>
          <p className="text-sm font-semibold">{user?.username}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Shield size={10} className="text-primary-500" /> Admin
          </p>
        </div>
      </div>

      {/* ── Change Username Card ── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <User size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold">{t('settings.changeUsername')}</h2>
        </div>

        <form onSubmit={handleUsername} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              {t('settings.currentPassword')}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={uCurrent}
                onChange={(e) => setUCurrent(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              {t('settings.newUsername')}
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className={inputCls}
              placeholder={t('settings.newUsername')}
            />
          </div>

          {uMsg && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-xl ${
              uMsg.type === 'ok'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}>
              {uMsg.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {uMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={uLoading}
            className={`${btnCls} bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-[0.98]`}
          >
            {uLoading ? (
              <><Loader2 size={16} className="animate-spin" /> {t('settings.updating')}</>
            ) : (
              <><User size={16} /> {t('settings.updateUsername')}</>
            )}
          </button>
        </form>
      </div>

      {/* ── Change Password Card ── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <KeyRound size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold">{t('settings.changePassword')}</h2>
        </div>

        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              {t('settings.currentPassword')}
            </label>
            <div className="relative">
              <input
                type="password"
                value={pCurrent}
                onChange={(e) => setPCurrent(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              {t('settings.newPassword')}
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              {t('settings.confirmPassword')}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {pMsg && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-xl ${
              pMsg.type === 'ok'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}>
              {pMsg.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {pMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={pLoading}
            className={`${btnCls} bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md shadow-amber-600/25 hover:shadow-amber-600/40 active:scale-[0.98]`}
          >
            {pLoading ? (
              <><Loader2 size={16} className="animate-spin" /> {t('settings.updating')}</>
            ) : (
              <><Lock size={16} /> {t('settings.updatePassword')}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
