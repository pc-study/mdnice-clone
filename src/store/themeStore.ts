import { create } from 'zustand';

interface ThemeState {
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
  currentCodeTheme: string;
  setCurrentCodeTheme: (theme: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: localStorage.getItem('mdnice-theme') || 'juejin',
  setCurrentTheme: (currentTheme) => {
    localStorage.setItem('mdnice-theme', currentTheme);
    set({ currentTheme });
  },
  currentCodeTheme: localStorage.getItem('mdnice-codeTheme') || 'atomOneDark',
  setCurrentCodeTheme: (currentCodeTheme) => {
    localStorage.setItem('mdnice-codeTheme', currentCodeTheme);
    set({ currentCodeTheme });
  },
}));
