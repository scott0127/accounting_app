/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        rounded: ['Varela Round', 'sans-serif'],
        quicksand: ['Quicksand', 'sans-serif'],
      },
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        success: {
          50: 'var(--color-success-50)',
          100: 'var(--color-success-100)',
          200: 'var(--color-success-200)',
          300: 'var(--color-success-300)',
          400: 'var(--color-success-400)',
          500: 'var(--color-success-500)',
          600: 'var(--color-success-600)',
          700: 'var(--color-success-700)',
          800: 'var(--color-success-800)',
          900: 'var(--color-success-900)',
        },
        warning: {
          50: 'var(--color-warning-50)',
          100: 'var(--color-warning-100)',
          200: 'var(--color-warning-200)',
          300: 'var(--color-warning-300)',
          400: 'var(--color-warning-400)',
          500: 'var(--color-warning-500)',
          600: 'var(--color-warning-600)',
          700: 'var(--color-warning-700)',
          800: 'var(--color-warning-800)',
          900: 'var(--color-warning-900)',
        },
        danger: {
          50: 'var(--color-danger-50)',
          100: 'var(--color-danger-100)',
          200: 'var(--color-danger-200)',
          300: 'var(--color-danger-300)',
          400: 'var(--color-danger-400)',
          500: 'var(--color-danger-500)',
          600: 'var(--color-danger-600)',
          700: 'var(--color-danger-700)',
          800: 'var(--color-danger-800)',
          900: 'var(--color-danger-900)',
        },
      },
      // 添加自定義動畫和轉場效果
      animation: {
        'gradient-x': 'gradient-x 2s ease infinite',
        'width-60': 'width-60 2s ease-out forwards',
        'width-25': 'width-25 2s ease-out forwards', 
        'width-15': 'width-15 2s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in-from-top': 'slideInFromTop 0.6s ease-out',
        'slide-in-from-left': 'slideInFromLeft 0.7s ease-out',
        'slide-in-from-right': 'slideInFromRight 0.7s ease-out',
        'slide-in-from-bottom': 'slideInFromBottom 0.8s ease-out',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'width-60': {
          'from': { width: '0%' },
          'to': { width: '60%' },
        },
        'width-25': {
          'from': { width: '0%' },
          'to': { width: '25%' },
        },
        'width-15': {
          'from': { width: '0%' },
          'to': { width: '15%' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideInFromTop: {
          'from': { opacity: '0', transform: 'translateY(-20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInFromLeft: {
          'from': { opacity: '0', transform: 'translateX(-20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInFromRight: {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInFromBottom: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
}