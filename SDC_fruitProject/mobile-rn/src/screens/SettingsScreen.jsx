import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { changeUsername, changePassword } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { useColors, Spacing, FontSize, BorderRadius, Shadows } from '../theme';

export default function SettingsScreen({ navigation }) {
  const { t, lang, setLang } = useI18n();
  const { dark, toggle: toggleTheme } = useTheme();
  const { user, logout, refreshUser } = useAuth();
  const c = useColors(dark);

  const [usernameForm, setUsernameForm] = useState({ new_username: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [loadingU, setLoadingU] = useState(false);
  const [loadingP, setLoadingP] = useState(false);
  const [showPassword, setShowPassword] = useState({});

  const handleChangeUsername = async () => {
    if (!usernameForm.new_username.trim()) {
      Alert.alert(t('settings.error'), t('settings.usernameRequired'));
      return;
    }
    setLoadingU(true);
    try {
      await changeUsername(passwordForm.current_password || '', usernameForm.new_username.trim());
      await refreshUser();
      setUsernameForm({ new_username: '' });
      Alert.alert(t('settings.success'), t('settings.usernameChanged'));
    } catch (e) {
      const msg = e.response?.data?.error || e.response?.data?.detail || t('settings.usernameFailed');
      Alert.alert(t('settings.error'), msg);
    } finally {
      setLoadingU(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      Alert.alert(t('settings.error'), t('settings.passwordMismatch'));
      return;
    }
    if (passwordForm.new_password.length < 4) {
      Alert.alert(t('settings.error'), t('settings.passwordTooShort'));
      return;
    }
    setLoadingP(true);
    try {
      await changePassword(
        passwordForm.current_password,
        passwordForm.new_password,
        passwordForm.confirm_password,
      );
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      Alert.alert(t('settings.success'), t('settings.passwordChanged'));
    } catch (e) {
      const msg = e.response?.data?.error || e.response?.data?.detail || t('settings.passwordFailed');
      Alert.alert(t('settings.error'), msg);
    } finally {
      setLoadingP(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(t('settings.logoutTitle'), t('settings.logoutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.logout'), style: 'destructive', onPress: logout },
    ]);
  };

  const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'fil', label: 'Filipino', flag: '🇵🇭' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      {/* Profile section */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
        <View style={styles.profileRow}>
          <View style={[styles.avatarCircle, { backgroundColor: c.primary }]}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
          <View>
            <Text style={[styles.profileName, { color: c.text }]}>{user?.username || 'User'}</Text>
            <Text style={[styles.profileRole, { color: c.textMuted }]}>
              {user?.is_staff ? t('settings.admin') : t('settings.user')}
            </Text>
          </View>
        </View>
      </View>

      {/* Appearance */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('settings.appearance')}</Text>
        <View style={styles.optionRow}>
          <Ionicons name={dark ? 'moon' : 'sunny'} size={20} color={c.primary} />
          <Text style={[styles.optionLabel, { color: c.text }]}>{t('settings.darkMode')}</Text>
          <TouchableOpacity
            style={[styles.toggle, { backgroundColor: dark ? c.primary : c.inputBg }]}
            onPress={toggleTheme}
          >
            <View style={[styles.toggleCircle, { transform: [{ translateX: dark ? 20 : 2 }] }]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Language */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('settings.language')}</Text>
        {LANGUAGES.map((l) => (
          <TouchableOpacity
            key={l.code}
            style={[
              styles.langRow,
              { backgroundColor: lang === l.code ? c.primaryLight : 'transparent' },
            ]}
            onPress={() => setLang(l.code)}
          >
            <Text style={{ fontSize: 18 }}>{l.flag}</Text>
            <Text style={[styles.langLabel, { color: c.text }]}>{l.label}</Text>
            {lang === l.code && <Ionicons name="checkmark-circle" size={20} color={c.primary} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Change username */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('settings.changeUsername')}</Text>
        <View style={[styles.inputBox, { backgroundColor: c.inputBg, borderColor: c.cardBorderSubtle }]}>
          <Ionicons name="person-outline" size={16} color={c.textMuted} />
          <TextInput
            style={[styles.input, { color: c.text }]}
            placeholder={t('settings.newUsername')}
            placeholderTextColor={c.textMuted}
            value={usernameForm.new_username}
            onChangeText={(v) => setUsernameForm({ new_username: v })}
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: c.primary, opacity: loadingU ? 0.7 : 1 }]}
          onPress={handleChangeUsername}
          disabled={loadingU}
        >
          {loadingU ? <ActivityIndicator color="#fff" size="small" /> : (
            <>
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.btnText}>{t('settings.save')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Change password */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('settings.changePassword')}</Text>
        {['current_password', 'new_password', 'confirm_password'].map((field) => (
          <View key={field} style={[styles.inputBox, { backgroundColor: c.inputBg, borderColor: c.cardBorderSubtle }]}>
            <Ionicons name="lock-closed-outline" size={16} color={c.textMuted} />
            <TextInput
              style={[styles.input, { color: c.text }]}
              placeholder={t(`settings.${field}`)}
              placeholderTextColor={c.textMuted}
              secureTextEntry={!showPassword[field]}
              value={passwordForm[field]}
              onChangeText={(v) => setPasswordForm((p) => ({ ...p, [field]: v }))}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword((p) => ({ ...p, [field]: !p[field] }))}>
              <Ionicons name={showPassword[field] ? 'eye-off' : 'eye'} size={16} color={c.textMuted} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: c.primary, opacity: loadingP ? 0.7 : 1 }]}
          onPress={handleChangePassword}
          disabled={loadingP}
        >
          {loadingP ? <ActivityIndicator color="#fff" size="small" /> : (
            <>
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.btnText}>{t('settings.save')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={[styles.logoutBtn, { borderColor: c.red, ...c.cardShadow }]} onPress={handleLogout}>
        <Ionicons name="log-out" size={18} color={c.red} />
        <Text style={[styles.logoutText, { color: c.red }]}>{t('settings.logout')}</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.lg, gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  profileName: { fontSize: FontSize.lg, fontWeight: '700' },
  profileRole: { fontSize: FontSize.xs },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  optionLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: '500' },
  toggle: { width: 44, height: 24, borderRadius: 12, justifyContent: 'center' },
  toggleCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  langRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.md,
  },
  langLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: '500' },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, height: 44,
  },
  input: { flex: 1, fontSize: FontSize.sm },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: BorderRadius.md,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: BorderRadius.lg, borderWidth: 1.5,
  },
  logoutText: { fontWeight: '700', fontSize: FontSize.md },
});
