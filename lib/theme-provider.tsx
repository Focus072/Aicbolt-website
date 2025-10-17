'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // Always force dark mode
  useEffect(() => {
    setMounted(true);
    // Always set to dark mode
    setThemeState('dark');
    applyTheme('dark');
    // Force save dark mode to localStorage
    localStorage.setItem('theme', 'dark');
  }, []);

  const applyTheme = (newTheme: Theme) => {
    // Always force dark mode regardless of input
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  };

  const setTheme = (newTheme: Theme) => {
    // Always force dark mode regardless of input
    setThemeState('dark');
    localStorage.setItem('theme', 'dark');
    applyTheme('dark');
  };

  const toggleTheme = () => {
    // Disabled - always stay in dark mode
    setTheme('dark');
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};


