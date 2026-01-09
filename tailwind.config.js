/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Background layers
        'bg-deep': 'var(--color-bg-deep)',
        'bg-surface': 'var(--color-bg-surface)',
        'bg-elevated': 'var(--color-bg-elevated)',

        // Accent colors - Phosphor amber
        'accent-primary': 'var(--color-accent-primary)',
        'accent-secondary': 'var(--color-accent-secondary)',
        'accent-glow': 'var(--color-accent-glow)',

        // Semantic colors
        'mint': 'var(--color-mint)',
        'mint-glow': 'var(--color-mint-glow)',
        'rose': 'var(--color-rose)',

        // Text
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',

        // Borders
        'border': 'var(--color-border)',
        'border-hover': 'var(--color-border-hover)',

        // Legacy support
        'glass-bg': 'var(--color-bg-surface)',
        'glass-border': 'var(--color-border)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'ambient-drift': 'ambient-drift 20s ease-in-out infinite alternate',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      boxShadow: {
        'glow-amber': '0 0 24px var(--color-accent-glow)',
        'glow-mint': '0 0 24px var(--color-mint-glow)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    }
  },
  plugins: []
}
