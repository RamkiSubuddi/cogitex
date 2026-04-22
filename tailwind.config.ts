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
        'cogitx-purple': '#7F77DD',
        'cogitx-dark': '#0A0A0F',
        'cogitx-panel': '#111118',
        'cogitx-card': '#1A1A24',
        'cogitx-border': '#252532',
        'cogitx-muted': '#7A7A9A',
        'agent-teal': '#2DD4BF',
        'agent-coral': '#FF6B6B',
        'agent-amber': '#F59E0B',
        'agent-pink': '#EC4899',
        'wa-green': '#25D366',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pulse_dot: {
          '0%, 80%, 100%': { opacity: '0' },
          '40%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        pulse_dot: 'pulse_dot 1.4s infinite ease-in-out',
        shimmer: 'shimmer 1.8s infinite',
      },
    },
  },
  plugins: [],
}
export default config
