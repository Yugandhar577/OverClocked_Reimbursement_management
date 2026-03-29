/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#fbf9f8',
        panel: '#ffffff',
        line: '#e7dfdf',
        ink: {
          950: '#1b1c1c',
          800: '#342d31',
          700: '#4e444a',
          500: '#80747b',
          400: '#a69aa1',
        },
        brand: {
          950: '#310e2b',
          900: '#4c203f',
          800: '#6d4262',
          700: '#875a7b',
          600: '#9d7691',
          100: '#f2e7ee',
          50: '#fbf7fa',
        },
        aqua: {
          700: '#006a68',
          600: '#087c7a',
          500: '#2eb7b2',
          100: '#d7f4f2',
          50: '#f1fbfa',
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
        sans: ['Inter', 'sans-serif'],
        display: ['Public Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 12px 28px -18px rgba(49, 14, 43, 0.18)',
        card: '0 18px 40px -26px rgba(49, 14, 43, 0.22)',
        float: '0 28px 70px -34px rgba(49, 14, 43, 0.28)',
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
