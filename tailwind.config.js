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
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        navy: {
          900: '#0D1B3E',
          800: '#1B3A8E',
          700: '#2548A8',
          600: '#3560C0',
          100: '#E8EDF8',
          50:  '#F2F5FC',
        },
        teal: {
          DEFAULT: '#0ABFA3',
          dark: '#089B84',
          light: '#E1F5EE',
        },
        surface: '#F2F5FC',
        border: '#DDE4F5',
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
