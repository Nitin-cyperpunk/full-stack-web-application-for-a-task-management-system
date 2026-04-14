/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        glass: '0 4px 24px -4px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
        'glass-lg': '0 12px 40px -12px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(255, 255, 255, 0.45) inset',
      },
    },
  },
  plugins: [],
};
