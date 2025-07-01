/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-background': '#F5EFE6',
        'brand-text': '#6B4F4F',
        'brand-placeholder': '#A99985',
        // Dark theme from new design
        'brand-dark-bg': '#1C1C1E',
        'brand-dark-text': '#FFFFFF',
        'brand-dark-secondary': '#8E8E93',
        'brand-dark-surface': '#3A3A3C',
        'brand-dark-brown-btn': '#4a2c2a',
        'brand-dark-gray-btn': '#6B6B6B',
        'brand-dark-red-btn': '#D13438',
        // FitMe Brand Colors - Light Theme
        primary: {
          50: '#ecfeff',
          100: '#cffafe', 
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#0891b2', // Main primary
          600: '#0e7490',
          700: '#155e75',
          800: '#164e63',
          900: '#083344',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Main accent
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Semantic Colors
        background: '#f8fafc',
        surface: '#ffffff',
        'surface-alt': '#f1f5f9',
        'text-primary': '#1e293b',
        'text-secondary': '#64748b',
        'text-tertiary': '#94a3b8',
        border: '#e2e8f0',
        'border-light': '#f1f5f9',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        // System fonts for better performance on mobile
        sans: ['System', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
      },
      fontSize: {
        // Responsive typography scale - React Native compatible
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
        '5xl': ['48px', { lineHeight: '48px' }],
      },
      spacing: {
        // Custom spacing scale for mobile - React Native compatible
        '18': '72px',   // 4.5rem equivalent
        '22': '88px',   // 5.5rem equivalent  
        '26': '104px',  // 6.5rem equivalent
        '30': '120px',  // 7.5rem equivalent
        '34': '136px',  // 8.5rem equivalent
        '38': '152px',  // 9.5rem equivalent
        '42': '168px',  // 10.5rem equivalent
        '46': '184px',  // 11.5rem equivalent
        '50': '200px',  // 12.5rem equivalent
      },
      borderRadius: {
        // Consistent border radius scale
        'xs': '2px',
        'sm': '4px',
        'default': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      // React Native compatible shadows using elevation
      elevation: {
        'sm': 2,
        'md': 4,
        'lg': 8,
        'xl': 12,
      },
      animation: {
        // Custom animations
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}

