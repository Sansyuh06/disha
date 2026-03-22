/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          teal: '#0ABFA3',
          'teal-light': '#E1F5EE',
          coral: '#FF6B35',
          'coral-light': '#FFF0EB',
          purple: '#7C5CBF',
          'purple-light': '#EEEDFE',
          dark: '#0F172A',
          muted: '#64748B',
        },
        surface: '#F8FAFC',
        border: '#E2E8F0',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
