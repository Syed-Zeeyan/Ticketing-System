export const theme = {
  colors: {
    primary: '#0f62fe',
    secondary: '#0a9396',
    accent: '#ffbf69',
    status: {
      open: {
        light: '#dbeafe',
        dark: '#1e3a8a',
        text: {
          light: '#1e40af',
          dark: '#93c5fd',
        },
      },
      inProgress: {
        light: '#fed7aa',
        dark: '#7c2d12',
        text: {
          light: '#9a3412',
          dark: '#fdba74',
        },
      },
      resolved: {
        light: '#bbf7d0',
        dark: '#14532d',
        text: {
          light: '#166534',
          dark: '#86efac',
        },
      },
      closed: {
        light: '#f3f4f6',
        dark: '#374151',
        text: {
          light: '#4b5563',
          dark: '#d1d5db',
        },
      },
      urgent: {
        light: '#fee2e2',
        dark: '#7f1d1d',
        text: {
          light: '#991b1b',
          dark: '#fca5a5',
        },
      },
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  shadows: {
    soft: '0 2px 8px rgba(0, 0, 0, 0.08)',
    'soft-xl': '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
  fonts: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  },
} as const

export type Theme = typeof theme

