# FruitMD – React Native (Expo) Mobile App

This is the **React Native** version of the FruitMD mobile app for **fruit freshness detection** (Fresh vs Rotten). It uses the same Django backend API and supports multiple fruit types (apple, banana, orange, mango, grape).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo ~52) |
| Navigation | React Navigation 6 (Bottom Tabs + Native Stack) |
| Icons | @expo/vector-icons (Ionicons) |
| HTTP | Axios |
| Camera | expo-camera |
| Image Picker | expo-image-picker |
| Storage | @react-native-async-storage/async-storage |
| File System | expo-file-system + expo-sharing |

## Project Structure

```
mobile-rn/
├── index.js                 # Entry point
├── app.json                 # Expo config
├── package.json
├── babel.config.js
└── src/
    ├── App.jsx              # Root navigator with auth flow
    ├── api.js               # API layer (same endpoints as web)
    ├── theme.js             # Centralized colors, spacing, fonts
    ├── components/
    │   ├── Badges.jsx       # LabelBadge, GradeBadge
    │   ├── LanguageSwitcher.jsx
    │   ├── ResultCard.jsx   # Detection result display
    │   ├── Skeleton.jsx     # Loading placeholders
    │   ├── StatCard.jsx     # Dashboard stat card
    │   └── Toast.jsx        # Animated toast notifications
    ├── contexts/
    │   ├── AuthContext.jsx   # Token auth + guest mode
    │   ├── I18nContext.jsx   # Multilingual (EN/VI/FIL)
    │   └── ThemeContext.jsx  # Dark/light mode
    ├── i18n/
    │   ├── en.js
    │   ├── fil.js
    │   └── vi.js
    ├── screens/
    │   ├── LoginScreen.jsx
    │   ├── DashboardScreen.jsx
    │   ├── DetectScreen.jsx
    │   ├── LiveScanScreen.jsx
    │   ├── HistoryScreen.jsx
    │   ├── ReportsScreen.jsx
    │   ├── ChatbotScreen.jsx
    │   └── SettingsScreen.jsx
    └── utils/
        ├── fallbackReplies.js
        └── fruitConstants.js
```

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (or an emulator)

### Install & Run

```bash
cd mobile-rn
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the Camera app (iOS).

### Backend

Make sure the Django backend is running:

```bash
cd ../backend
python manage.py runserver
```

> **Note:** The API base URL in `src/api.js` defaults to `http://127.0.0.1:8000/api`. For physical devices, update this to your machine's local IP (e.g., `http://192.168.x.x:8000/api`).

## Key Differences from Web Version

| Aspect | Web (Vite) | React Native (Expo) |
|--------|-----------|---------------------|
| Auth | Session cookies + CSRF | Token auth via AsyncStorage |
| Styling | Tailwind CSS | React Native StyleSheet |
| Icons | lucide-react | Ionicons (@expo/vector-icons) |
| Routing | react-router-dom | React Navigation |
| Camera | navigator.mediaDevices | expo-camera |
| File Pick | `<input type="file">` | expo-image-picker |
| Storage | localStorage | AsyncStorage |
| Charts | recharts | Custom View-based bars |
