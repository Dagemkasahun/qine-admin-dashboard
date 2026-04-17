// src/context/ThemeContext.jsx (Enhanced with multiple themes)
import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

const themes = {
  light: {
    name: 'Light',
    primary: '#3B82F6',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1F2937',
    border: '#E5E7EB',
  },
  dark: {
    name: 'Dark',
    primary: '#3B82F6',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    border: '#374151',
  },
  midnight: {
    name: 'Midnight',
    primary: '#6366F1',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#E2E8F0',
    border: '#334155',
  },
  forest: {
    name: 'Forest',
    primary: '#059669',
    background: '#064E3B',
    surface: '#047857',
    text: '#D1FAE5',
    border: '#065F46',
  },
  sunset: {
    name: 'Sunset',
    primary: '#EA580C',
    background: '#7C2D12',
    surface: '#9A3412',
    text: '#FED7AA',
    border: '#C2410C',
  },
  ocean: {
    name: 'Ocean',
    primary: '#0284C7',
    background: '#0C4A6E',
    surface: '#075985',
    text: '#E0F2FE',
    border: '#0369A1',
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  const [themeColors, setThemeColors] = useState(themes[theme] || themes.light);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const colors = themes[theme] || themes.light;
    setThemeColors(colors);

    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-border', colors.border);

    // Apply dark class for dark-like themes
    if (['dark', 'midnight', 'forest', 'sunset', 'ocean'].includes(theme)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const setThemeByName = (themeName) => {
    if (themes[themeName]) {
      setTheme(themeName);
    }
  };

  const toggleDarkMode = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const darkMode = theme !== 'light';

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themeColors, 
      darkMode, 
      setTheme: setThemeByName, 
      toggleDarkMode,
      availableThemes: Object.keys(themes),
    }}>
      {children}
    </ThemeContext.Provider>
  );
};