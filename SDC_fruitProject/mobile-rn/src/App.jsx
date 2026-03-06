import React, { useEffect, useCallback, useState } from 'react';
import { StatusBar, View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { I18nProvider, useI18n } from './contexts/I18nContext';
import { useColors } from './theme';
import LanguageSwitcher from './components/LanguageSwitcher';
import AnimatedSplash from './components/AnimatedSplash';

// Keep splash screen visible while we load resources
SplashScreen.preventAutoHideAsync();

// Screens
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import DetectScreen from './screens/DetectScreen';
import LiveScanScreen from './screens/LiveScanScreen';
import HistoryScreen from './screens/HistoryScreen';
import ReportsScreen from './screens/ReportsScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* ─── Tab icons ─── */
const TAB_ICONS = {
  Dashboard: { focused: 'grid', unfocused: 'grid-outline' },
  Detect: { focused: 'scan-circle', unfocused: 'scan-circle-outline' },
  LiveScan: { focused: 'videocam', unfocused: 'videocam-outline' },
  Chatbot: { focused: 'chatbubble-ellipses', unfocused: 'chatbubble-ellipses-outline' },
  History: { focused: 'time', unfocused: 'time-outline' },
  Reports: { focused: 'bar-chart', unfocused: 'bar-chart-outline' },
};

/* ─── Bottom Tab Navigator ─── */
function MainTabs() {
  const { dark, toggle } = useTheme();
  const { t } = useI18n();
  const { isGuest, isAuthenticated, exitGuest, logout } = useAuth();
  const c = useColors(dark);
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(t('settings.logoutTitle'), t('settings.logoutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.logout'), style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: c.headerBg,
          shadowColor: c.shadowColor,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: dark ? 0.3 : 0.06,
          shadowRadius: 8,
          elevation: 4,
          borderBottomWidth: 0.5,
          borderBottomColor: c.cardBorderSubtle,
        },
        headerTintColor: c.text,
        headerTitleStyle: { fontWeight: '800', fontSize: 17, letterSpacing: -0.3 },
        headerLeft: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 12, gap: 10 }}>
            {isAuthenticated && (
              <>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Settings')}
                  style={{ padding: 6, borderRadius: 10, backgroundColor: dark ? c.primaryLight : 'rgba(22,163,74,0.08)' }}
                >
                  <Ionicons name="settings-outline" size={20} color={c.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleLogout}
                  style={{ padding: 6, borderRadius: 10, backgroundColor: c.redLight }}
                >
                  <Ionicons name="log-out-outline" size={20} color={c.red} />
                </TouchableOpacity>
              </>
            )}
            {isGuest && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 5,
                  backgroundColor: c.primary,
                  paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                  shadowColor: c.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
                }}
                onPress={() => exitGuest()}
              >
                <Ionicons name="log-in-outline" size={15} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{t('auth.login')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 8, gap: 4 }}>
            <TouchableOpacity
              style={{
                padding: 6, borderRadius: 10,
                backgroundColor: dark ? 'rgba(251,191,36,0.12)' : 'rgba(107,114,128,0.08)',
              }}
              onPress={toggle}
            >
              <Ionicons name={dark ? 'sunny' : 'moon'} size={19} color={dark ? '#fbbf24' : '#6b7280'} />
            </TouchableOpacity>
            <LanguageSwitcher />
          </View>
        ),
        tabBarStyle: {
          backgroundColor: c.tabBarBg,
          borderTopColor: c.tabBarBorder,
          borderTopWidth: 0.5,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
          shadowColor: c.shadowColor,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: dark ? 0.25 : 0.06,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name] || { focused: 'ellipse', unfocused: 'ellipse-outline' };
          return (
            <View style={focused ? {
              backgroundColor: dark ? c.primaryLight : 'rgba(22,163,74,0.1)',
              borderRadius: 12, padding: 4,
            } : { padding: 4 }}>
              <Ionicons name={focused ? icons.focused : icons.unfocused} size={21} color={color} />
            </View>
          );
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: -2 },
      })}
    >
      {!isGuest && (
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: t('nav.dashboard') }} />
      )}
      <Tab.Screen name="Detect" component={DetectScreen} options={{ title: t('nav.detect') }} />
      <Tab.Screen name="LiveScan" component={LiveScanScreen} options={{ title: t('nav.liveScan') }} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} options={{ title: t('nav.chatbot') }} />
      {!isGuest && (
        <Tab.Screen name="History" component={HistoryScreen} options={{ title: t('nav.history') }} />
      )}
    </Tab.Navigator>
  );
}

/* ─── Root Stack ─── */
function RootNavigator() {
  const { user, isAuthenticated, isGuest, guestMode, loading } = useAuth();
  const { dark } = useTheme();
  const c = useColors(dark);
  const [splashAnimDone, setSplashAnimDone] = useState(false);

  const onLayoutRootView = useCallback(async () => {
    if (!loading) {
      await SplashScreen.hideAsync();
    }
  }, [loading]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  // Keep splash visible until BOTH the animation finishes AND auth loading completes
  const splashDone = splashAnimDone && !loading;

  if (!splashDone) {
    return (
      <AnimatedSplash
        onFinish={() => setSplashAnimDone(true)}
        holdOpen={splashAnimDone && loading}
      />
    );
  }

  const showMain = isAuthenticated || guestMode;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!showMain ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={({ navigation }) => ({
              headerShown: true,
              headerStyle: { backgroundColor: c.card },
              headerTintColor: c.text,
              title: 'Settings',
            })}
          />
          <Stack.Screen
            name="Reports"
            component={ReportsScreen}
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: c.card },
              headerTintColor: c.text,
              title: 'Reports',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

/* ─── App ─── */
export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

function AppInner() {
  const { dark } = useTheme();
  const c = useColors(dark);

  const navTheme = dark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: c.background, card: c.card, primary: c.primary }, fonts: DarkTheme.fonts }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: c.background, card: c.card, primary: c.primary }, fonts: DefaultTheme.fonts };

  return (
    <>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor={c.background} />
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({});
