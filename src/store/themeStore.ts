import { create } from 'zustand';
import { themes } from '../themes';
import { legacyThemeMap } from '../codeThemes';

interface ThemeState {
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
  currentCodeTheme: string;
  setCurrentCodeTheme: (theme: string) => void;
  macStyleEnabled: boolean;
  setMacStyleEnabled: (enabled: boolean) => void;
}

// Migrate legacy code theme IDs on load
function migrateSavedCodeTheme(): { codeTheme: string; macEnabled: boolean } {
  let savedCodeTheme = localStorage.getItem('mdnice-codeTheme') || 'atom-one-dark';

  // Detect if old value was a mac variant
  const wasMac = savedCodeTheme.startsWith('mac');

  // Migrate legacy ID to new CDN-compatible ID
  if (legacyThemeMap[savedCodeTheme]) {
    savedCodeTheme = legacyThemeMap[savedCodeTheme];
    localStorage.setItem('mdnice-codeTheme', savedCodeTheme);
  }

  // Migrate mac style preference
  const savedMacStyle = localStorage.getItem('mdnice-macStyle');
  const macEnabled = savedMacStyle !== null ? savedMacStyle === 'true' : wasMac;

  return { codeTheme: savedCodeTheme, macEnabled };
}

const { codeTheme: initialCodeTheme, macEnabled: initialMacEnabled } = migrateSavedCodeTheme();

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: localStorage.getItem('mdnice-theme') || 'juejin',
  setCurrentTheme: (currentTheme) => {
    localStorage.setItem('mdnice-theme', currentTheme);
    set({ currentTheme });
    // Auto-switch code theme if the layout theme specifies a highlight
    const theme = themes[currentTheme];
    if (theme?.highlight) {
      localStorage.setItem('mdnice-codeTheme', theme.highlight);
      set({ currentCodeTheme: theme.highlight });
    }
  },
  currentCodeTheme: initialCodeTheme,
  setCurrentCodeTheme: (currentCodeTheme) => {
    localStorage.setItem('mdnice-codeTheme', currentCodeTheme);
    set({ currentCodeTheme });
  },
  macStyleEnabled: initialMacEnabled,
  setMacStyleEnabled: (macStyleEnabled) => {
    localStorage.setItem('mdnice-macStyle', String(macStyleEnabled));
    set({ macStyleEnabled });
  },
}));
