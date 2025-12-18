/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // DarkTube Color Palette
        'dt-black': '#000000',           // Primary Background
        'dt-charcoal': '#121212',        // Secondary Background
        'dt-dark-gray': '#1E1E1E',       // Tertiary/Surface
        'dt-orange': '#FF6600',          // Primary Accent
        'dt-orange-muted': '#CC5500',    // Secondary Accent (hover)
        'dt-white': '#FFFFFF',           // Primary Text
        'dt-light-gray': '#AAAAAA',      // Secondary Text
        'dt-green': '#00CC66',           // Success/Positive
        'dt-red': '#FF3333',             // Error/Negative
      },
      fontFamily: {
        'sans': ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        'mono': ['Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-orange': 'pulse-orange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        'pulse-orange': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 0 0 rgba(255, 102, 0, 0.7)',
          },
          '50%': {
            opacity: '.8',
            boxShadow: '0 0 0 10px rgba(255, 102, 0, 0)',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      aspectRatio: {
        '16/9': '16 / 9',
        '4/3': '4 / 3',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};