import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useColors, BorderRadius, FontSize, Spacing, Shadows } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login, enterGuest } = useAuth();
  const { dark, toggle } = useTheme();
  const c = useColors(dark);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: c.background }]}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header gradient area */}
        <View style={[styles.header, { backgroundColor: dark ? '#0a1a12' : c.primary }]}>
          {/* Decorative orbs */}
          <View style={[styles.headerOrb1, { backgroundColor: dark ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.1)' }]} />
          <View style={[styles.headerOrb2, { backgroundColor: dark ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.06)' }]} />

          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <View style={[styles.logoBox, { backgroundColor: dark ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="medical" size={24} color={dark ? c.primary : '#fff'} />
              </View>
              <View>
                <Text style={[styles.logoText, { color: dark ? c.text : '#fff' }]}>
                  Fruit<Text style={{ color: '#fbbf24' }}>MD</Text>
                </Text>
                <Text style={[styles.logoSub, { color: dark ? c.textMuted : 'rgba(255,255,255,0.6)' }]}>❤️ The Fruit Doctor</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={toggle}
              style={[styles.themeBtn, { backgroundColor: dark ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.12)' }]}
            >
              <Ionicons name={dark ? 'sunny' : 'moon'} size={18} color={dark ? '#fbbf24' : '#fff'} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={[styles.welcomeText, { color: dark ? c.text : '#fff' }]}>Welcome back 👋</Text>
            <Text style={[styles.welcomeSub, { color: dark ? c.textSecondary : 'rgba(255,255,255,0.7)' }]}>Sign in to access admin features</Text>
          </View>
          <View style={styles.fruitRow}>
            <Text style={styles.fruitEmoji}>🍎</Text>
            <Text style={styles.fruitEmoji}>🍊</Text>
            <Text style={styles.fruitEmoji}>🥭</Text>
            <Text style={styles.fruitEmoji}>🍇</Text>
            <Text style={styles.fruitEmoji}>🍌</Text>
          </View>
        </View>

        {/* Form */}
        <View style={[
          styles.form,
          {
            backgroundColor: c.card,
            borderColor: c.cardBorder,
            ...c.cardShadowElevated,
          },
        ]}>
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: c.errorBg, borderColor: c.errorBorder }]}>
              <Ionicons name="alert-circle" size={16} color={c.red} />
              <Text style={[styles.errorText, { color: c.errorText }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Username</Text>
            <View style={[styles.inputWrapper, { backgroundColor: c.inputBg, borderColor: c.inputBorder }]}>
              <Ionicons name="person-outline" size={16} color={c.textMuted} style={{ marginLeft: 4 }} />
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor={c.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input, { color: c.text }]}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: c.inputBg, borderColor: c.inputBorder }]}>
              <Ionicons name="lock-closed-outline" size={16} color={c.textMuted} style={{ marginLeft: 4 }} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={c.textMuted}
                secureTextEntry={!showPass}
                style={[styles.input, { color: c.text, flex: 1 }]}
              />
              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                style={{ padding: 8 }}
              >
                <Ionicons name={showPass ? 'eye-off' : 'eye'} size={18} color={c.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[
              styles.submitBtn,
              {
                backgroundColor: c.primary,
                opacity: loading ? 0.7 : 1,
                ...Shadows.glow(c.primary),
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="log-in" size={18} color="#fff" />
            )}
            <Text style={styles.submitText}>
              {loading ? 'Signing in…' : 'Sign in as Admin'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Guest button */}
        <TouchableOpacity
          onPress={() => enterGuest()}
          style={[styles.guestBtn, {
            backgroundColor: dark ? c.card : c.backgroundSecondary,
            borderWidth: 1,
            borderColor: c.cardBorder,
            ...c.cardShadow,
          }]}
        >
          <View style={{ padding: 6, borderRadius: 10, backgroundColor: c.primaryLight }}>
            <Ionicons name="medical" size={16} color={c.primary} />
          </View>
          <Text style={[styles.guestText, { color: c.text }]}>Continue as Guest</Text>
          <Ionicons name="arrow-forward" size={14} color={c.textMuted} />
        </TouchableOpacity>

        <Text style={[styles.footer, { color: c.textMuted }]}>
          ❤️ FruitMD — The Fruit Doctor
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 44,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerOrb1: {
    position: 'absolute', top: -40, right: -40,
    width: 200, height: 200, borderRadius: 100,
  },
  headerOrb2: {
    position: 'absolute', bottom: -30, left: -30,
    width: 160, height: 160, borderRadius: 80,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: FontSize.xl, fontWeight: '800' },
  logoSub: { fontSize: FontSize.xs },
  themeBtn: {
    padding: 10,
    borderRadius: BorderRadius.md,
  },
  headerContent: { marginTop: Spacing.xxl },
  welcomeText: { fontSize: FontSize.xxl, fontWeight: '800', letterSpacing: -0.5 },
  welcomeSub: { fontSize: FontSize.md, marginTop: 4 },
  fruitRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    position: 'absolute',
    bottom: 14,
    right: Spacing.xl,
  },
  fruitEmoji: { fontSize: 24 },
  form: {
    marginHorizontal: Spacing.xl,
    marginTop: -22,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  errorText: { fontSize: FontSize.sm, flex: 1 },
  field: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: '600', letterSpacing: 0.2 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    paddingVertical: 0,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 15,
    borderRadius: BorderRadius.md,
    marginTop: 4,
  },
  submitText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '700' },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  guestText: { fontSize: FontSize.md, fontWeight: '600', flex: 1 },
  footer: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xxl,
  },
});
