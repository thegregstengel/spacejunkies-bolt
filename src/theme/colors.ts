export const colors = {
  // Dark theme colors
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceVariant: '#2a2a2a',
  primary: '#4a9eff',
  primaryVariant: '#2563eb',
  secondary: '#f59e0b',
  accent: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  
  // Federation colors
  federation: '#2563eb',
  federationLight: '#60a5fa',
  
  // Pirate colors
  pirate: '#dc2626',
  pirateLight: '#f87171',
  
  // Neutral colors
  neutral: '#6b7280',
  neutralLight: '#9ca3af',
  
  // Status colors
  disabled: '#374151',
  border: '#374151',
  borderLight: '#4b5563',
};

export const theme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};