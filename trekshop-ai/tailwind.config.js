/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        decathlonBlue: '#007abd',
        decathlonDark: '#005587',
        lightGray: '#f7f8f9',
        primary: '#ec5b13',
        'background-light': '#f8f6f6',
        'background-dark': '#221610',
        'gold-accent': '#FFD700',
        'terminal-green': '#4ade80',
      },
      animation: {
        'subtle-pulse': 'subtlePulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-blue': 'pulseBlue 2s infinite',
      },
      keyframes: {
        subtlePulse: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(0, 122, 189, 0.4)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(0, 122, 189, 0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        pulseBlue: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(0, 122, 189, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(0, 122, 189, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(0, 122, 189, 0)' },
        },
      },
    },
  },
  plugins: [],
}
