import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

export type Theme = 'light' | 'dark' | 'spring' | 'summer' | 'autumn' | 'winter';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isSeasonalThemeEnabled: boolean;
  toggleSeasonalTheme: () => void;
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    card: string;
    border: string;
  };
}

const themeColors = {
  light: {
    background: '#F8F8F8',
    text: '#333333',
    primary: '#76A97F',
    secondary: '#4A6B3F',
    accent: '#A8D5BA',
    card: '#FFFFFF',
    border: 'rgba(229, 229, 229, 0.25)',
  },
  dark: {
    background: '#1A1A1A',
    text: '#FFFFFF',
    primary: '#76A97F',
    secondary: '#4A6B3F',
    accent: '#2D4A2D',
    card: '#2D2D2D',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  spring: {
    background: '#F5FBF1',
    text: '#2D4A2D',
    primary: '#76BD43',
    secondary: '#F9C846',
    accent: '#FF9ECD',
    card: '#FFFFFF',
    border: 'rgba(118, 189, 67, 0.25)',
  },
  summer: {
    background: '#FFF5EB',
    text: '#8B2801',
    primary: '#FF8C42',
    secondary: '#FFD93D',
    accent: '#FF3D3D',
    card: '#FFFFFF',
    border: 'rgba(255, 140, 66, 0.25)',
  },
  autumn: {
    background: '#FDF6F0',
    text: '#4A2D1A',
    primary: '#D95D39',
    secondary: '#8B4513',
    accent: '#F0A500',
    card: '#FFFFFF',
    border: 'rgba(217, 93, 57, 0.25)',
  },
  winter: {
    background: '#EEF5FF',
    text: '#2C3E50',
    primary: '#147B9F',
    secondary: '#A1D2CE',
    accent: '#E3F4F9',
    card: '#FFFFFF',
    border: 'rgba(20, 123, 159, 0.25)',
  },
};

const getCurrentSeason = (): Theme => {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-11
  
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme() || 'light';
  const [theme, setTheme] = useState<Theme>(systemColorScheme as Theme);
  const [isSeasonalThemeEnabled, setIsSeasonalThemeEnabled] = useState(false);

  // Effect to handle seasonal theme changes
  useEffect(() => {
    if (isSeasonalThemeEnabled) {
      const currentSeason = getCurrentSeason();
      setTheme(currentSeason);
    }
  }, [isSeasonalThemeEnabled]);

  // Effect to handle system theme changes
  useEffect(() => {
    if (!isSeasonalThemeEnabled) {
      setTheme(systemColorScheme as Theme);
    }
  }, [systemColorScheme, isSeasonalThemeEnabled]);

  const toggleSeasonalTheme = () => {
    setIsSeasonalThemeEnabled(!isSeasonalThemeEnabled);
  };

  const colors = themeColors[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isSeasonalThemeEnabled, toggleSeasonalTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 