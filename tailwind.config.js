/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Implementing manual dark mode toggle or system preference later
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        'glass-bg': 'var(--color-glass-bg)',
        'glass-border': 'var(--color-glass-border)',
        'glass-highlight': 'var(--color-glass-highlight)',
        'accent-primary': 'var(--color-accent-primary)',
        'accent-secondary': 'var(--color-accent-secondary)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      animation: {
        'aurora': 'aurora-rotate 20s linear infinite',
      }
    }
  },
  plugins: []
}
