
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark' | 'high-contrast';

interface ThemeContextProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    card: string;
    border: string;
    notification: string;
    error: string;
    success: string;
  };
  fontSize: {
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
  };
}

const ThemeContext = createContext<ThemeContextProps>({} as ThemeContextProps);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>(deviceTheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    // If device theme changes, update our theme (unless user specifically chose high-contrast)
    if (theme !== 'high-contrast') {
      setTheme(deviceTheme === 'dark' ? 'dark' : 'light');
    }
  }, [deviceTheme]);

  // Define colors for different themes
  const colors = {
    light: {
      background: '#F5F7FA',
      text: '#2A2A2A',
      primary: '#6C63FF',
      secondary: '#5A52E0',
      accent: '#FF6584',
      card: '#FFFFFF',
      border: '#E1E1E1',
      notification: '#7C4DFF',
      error: '#FF5252',
      success: '#4CAF50',
    },
    dark: {
      background: '#121212',
      text: '#FFFFFF',
      primary: '#BB86FC',
      secondary: '#3700B3',
      accent: '#03DAC6',
      card: '#1E1E1E',
      border: '#2C2C2C',
      notification: '#BB86FC',
      error: '#CF6679',
      success: '#4CAF50',
    },
    'high-contrast': {
      background: '#000000',
      text: '#FFFFFF',
      primary: '#FFFF00',
      secondary: '#00FFFF',
      accent: '#FF00FF',
      card: '#000000',
      border: '#FFFFFF',
      notification: '#FFFF00',
      error: '#FF0000',
      success: '#00FF00',
    },
  };

  // Define font sizes for accessibility
  const fontSize = {
    small: 16,
    medium: 18,
    large: 22,
    extraLarge: 28,
  };

  const value = {
    theme,
    setTheme,
    colors: colors[theme],
    fontSize,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
