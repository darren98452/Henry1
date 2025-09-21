import { useState, useEffect, useCallback } from 'react';

export const themes = {
  lavender: {
    'primary': '#a78bfa',
    'primary-focus': '#8b5cf6',
    'secondary': '#2dd4bf',
    'neutral': '#111827',
    'base-100': '#f6f4fc',
    'base-200': '#ede9fe',
  },
  rose: {
    'primary': '#f472b6',
    'primary-focus': '#ec4899',
    'secondary': '#60a5fa',
    'neutral': '#111827',
    'base-100': '#fdf2f8',
    'base-200': '#fce7f3',
  },
  teal: {
    'primary': '#2dd4bf',
    'primary-focus': '#14b8a6',
    'secondary': '#f59e0b',
    'neutral': '#111827',
    'base-100': '#f0fdfa',
    'base-200': '#ccfbf1',
  },
  forest: {
    'primary': '#22c55e',
    'primary-focus': '#16a34a',
    'secondary': '#f59e0b',
    'neutral': '#111827',
    'base-100': '#f0fdf4',
    'base-200': '#dcfce7',
  },
  ocean: {
    'primary': '#3b82f6',
    'primary-focus': '#2563eb',
    'secondary': '#14b8a6',
    'neutral': '#111827',
    'base-100': '#eff6ff',
    'base-200': '#dbeafe',
  },
  sunset: {
    'primary': '#f97316',
    'primary-focus': '#ea580c',
    'secondary': '#ec4899',
    'neutral': '#111827',
    'base-100': '#fff7ed',
    'base-200': '#ffedd5',
  },
  graphite: {
    'primary': '#64748b',
    'primary-focus': '#475569',
    'secondary': '#ef4444',
    'neutral': '#111827',
    'base-100': '#f8fafc',
    'base-200': '#f1f5f9',
  },
  ruby: {
    'primary': '#ef4444',
    'primary-focus': '#dc2626',
    'secondary': '#f59e0b',
    'neutral': '#111827',
    'base-100': '#fef2f2',
    'base-200': '#fee2e2',
  },
  mint: {
    'primary': '#10b981',
    'primary-focus': '#059669',
    'secondary': '#a855f7',
    'neutral': '#111827',
    'base-100': '#ecfdf5',
    'base-200': '#d1fae5',
  },
  sakura: {
    'primary': '#ec4899',
    'primary-focus': '#db2777',
    'secondary': '#a78bfa',
    'neutral': '#111827',
    'base-100': '#fdf2f8',
    'base-200': '#fce7f3',
  },
  citrus: {
    'primary': '#eab308',
    'primary-focus': '#ca8a04',
    'secondary': '#84cc16',
    'neutral': '#111827',
    'base-100': '#fefce8',
    'base-200': '#fef9c3',
  },
  indigo: {
    'primary': '#6366f1',
    'primary-focus': '#4f46e5',
    'secondary': '#f472b6',
    'neutral': '#111827',
    'base-100': '#eef2ff',
    'base-200': '#e0e7ff',
  },
  coffee: {
    'primary': '#854d0e',
    'primary-focus': '#713f12',
    'secondary': '#a16207',
    'neutral': '#111827',
    'base-100': '#fefce8',
    'base-200': '#fef9c3',
  },
  sky: {
    'primary': '#0ea5e9',
    'primary-focus': '#0284c7',
    'secondary': '#f59e0b',
    'neutral': '#111827',
    'base-100': '#f0f9ff',
    'base-200': '#e0f2fe',
  },
  coral: {
    'primary': '#f97316',
    'primary-focus': '#ea580c',
    'secondary': '#06b6d4',
    'neutral': '#111827',
    'base-100': '#fff7ed',
    'base-200': '#ffedd5',
  },
  plum: {
    'primary': '#8b5cf6',
    'primary-focus': '#7c3aed',
    'secondary': '#64748b',
    'neutral': '#111827',
    'base-100': '#f5f3ff',
    'base-200': '#ede9fe',
  },
  crimson: {
    'primary': '#dc2626',
    'primary-focus': '#b91c1c',
    'secondary': '#4b5563',
    'neutral': '#111827',
    'base-100': '#fee2e2',
    'base-200': '#fecaca',
  },
  jade: {
    'primary': '#0d9488',
    'primary-focus': '#0f766e',
    'secondary': '#facc15',
    'neutral': '#111827',
    'base-100': '#f0fdfa',
    'base-200': '#ccfbf1',
  },
  carbon: {
    'primary': '#64748b',
    'primary-focus': '#94a3b8',
    'secondary': '#2dd4bf',
    'neutral': '#f1f5f9',
    'base-100': '#1e293b',
    'base-200': '#0f172a',
  },
  asphalt: {
    'primary': '#9ca3af',
    'primary-focus': '#d1d5db',
    'secondary': '#8b5cf6',
    'neutral': '#f3f4f6',
    'base-100': '#374151',
    'base-200': '#1f2937',
  },
  mono: {
    'primary': '#e5e7eb',
    'primary-focus': '#ffffff',
    'secondary': '#6b7280',
    'neutral': '#ffffff',
    'base-100': '#111827',
    'base-200': '#000000',
  },
};

export type ThemeName = keyof typeof themes;

export interface Settings {
  theme: ThemeName;
  userName: string;
}

const SETTINGS_STORAGE_KEY = 'vocab-ai-trainer-settings';

const defaultSettings: Settings = {
  theme: 'lavender',
  userName: 'Learner',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed.theme && parsed.userName) {
          return {
            theme: parsed.theme,
            userName: parsed.userName,
          };
        }
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
    }
    return defaultSettings;
  });

  useEffect(() => {
    // Apply theme colors
    const theme = themes[settings.theme] || themes.lavender;
    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    }
  }, [settings.theme]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setTheme = useCallback((theme: ThemeName) => {
    setSettings(s => ({ ...s, theme }));
  }, []);

  const setUserName = useCallback((name: string) => {
      setSettings(s => ({...s, userName: name}));
  }, []);

  return {
    settings,
    setTheme,
    setUserName,
  };
};

export type UseSettingsReturn = ReturnType<typeof useSettings>;