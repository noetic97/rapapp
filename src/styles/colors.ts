export const colors = {
  // Dark theme primary colors
  background: "#000000",
  surface: "#1a1a1a",
  surfaceVariant: "#2a2a2a",

  // Text colors
  text: "#ffffff",
  textSecondary: "#b3b3b3",
  textMuted: "#666666",

  // Accent colors for rap writing
  accent: "#ff6b6b",
  accentLight: "#ff8e8e",
  accentDark: "#e55555",

  // Functional colors
  success: "#4caf50",
  warning: "#ff9800",
  error: "#f44336",

  // Rap notation colors (for future use)
  rhyme: "#64b5f6",
  pause: "#ffb74d",
  emphasis: "#81c784",

  // Border and divider
  border: "#333333",
  divider: "#404040",
} as const;

// src/styles/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// src/styles/typography.ts
export const typography = {
  // Font families
  fontFamily: {
    regular: "System",
    medium: "System",
    bold: "System",
    mono: "Monaco", // For rap content that needs fixed width
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 28,
    header: 32,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },

  // Font weights
  fontWeight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
} as const;
