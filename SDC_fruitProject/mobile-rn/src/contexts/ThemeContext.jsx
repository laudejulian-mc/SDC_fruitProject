import { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [dark, setDark] = useState(systemScheme === 'dark');
  const [loaded, setLoaded] = useState(false);

  // Load stored preference
  useEffect(() => {
    AsyncStorage.getItem('theme').then((stored) => {
      if (stored) setDark(stored === 'dark');
      setLoaded(true);
    });
  }, []);

  // Persist preference
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem('theme', dark ? 'dark' : 'light');
    }
  }, [dark, loaded]);

  const toggle = () => setDark((d) => !d);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
