import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bb-bg': '#0d0d0d',
        'bb-primary': '#e8e0d8',
        'bb-secondary': '#888888',
        'bb-subtle': '#555555',
        'bb-accent': '#c0392b',
        'bb-border': '#222222',
        'bb-card': '#111111',
        'bb-btn': '#f0ebe4',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Jost"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '2px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        '2xl': '2px',
      },
      letterSpacing: {
        widest: '0.2em',
        wider: '0.16em',
        wide: '0.08em',
      },
    },
  },
  plugins: [],
}

export default config
