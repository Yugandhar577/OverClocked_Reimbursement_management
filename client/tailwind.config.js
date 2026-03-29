/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f5f6f8',
        panel: '#ffffff',
        line: '#dfe3e8',
        ink: {
          950: '#2f3640',
          800: '#46505c',
          700: '#5e6977',
          500: '#7b8796',
          400: '#a7afb9',
        },
        brand: {
          950: '#55364d',
          900: '#714b67',
          800: '#875a7b',
          700: '#875a7b',
          600: '#9f7893',
          100: '#efe7eb',
          50: '#f8f4f6',
        },
        aqua: {
          700: '#007983',
          600: '#0b9aa8',
          500: '#18b9b4',
          100: '#dff5f7',
          50: '#f2fbfc',
        },
        amber: {
          700: '#863900',
          600: '#9c4a10',
          500: '#c36a25',
          100: '#ffe5d3',
          50: '#fff7f0',
        },
      },
      fontFamily: {
        sans: ['Inter', '"Odoo Unicode Support Noto"', 'sans-serif'],
        display: ['Inter', '"Odoo Unicode Support Noto"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 24px -18px rgba(46, 54, 64, 0.24)',
        card: '0 18px 42px -30px rgba(46, 54, 64, 0.2)',
        float: '0 26px 60px -36px rgba(46, 54, 64, 0.26)',
      },
      keyframes: {
        'fade-up': {
          '0%': {
            opacity: 0,
            transform: 'translateY(12px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        shimmer: 'shimmer 1.8s linear infinite',
      },
    },
  },
  plugins: [],
}
