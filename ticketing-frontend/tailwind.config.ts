import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f62fe',
          50: '#e6f0ff',
          100: '#b3d1ff',
          200: '#80b2ff',
          300: '#4d93ff',
          400: '#1a74ff',
          500: '#0f62fe',
          600: '#0c4fc7',
          700: '#093c90',
          800: '#062959',
          900: '#031622',
        },
        secondary: {
          DEFAULT: '#0a9396',
          50: '#e6f7f7',
          100: '#b3e3e5',
          200: '#80cfd3',
          300: '#4dbbc1',
          400: '#1aa7af',
          500: '#0a9396',
          600: '#087578',
          700: '#06575a',
          800: '#04393c',
          900: '#021b1e',
        },
        accent: {
          DEFAULT: '#ffbf69',
          50: '#fff9f0',
          100: '#ffedd6',
          200: '#ffe1bd',
          300: '#ffd5a4',
          400: '#ffc98b',
          500: '#ffbf69',
          600: '#cc9944',
          700: '#997333',
          800: '#664d22',
          900: '#332611',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'soft-xl': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
export default config

