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
        // 🎨 FitMe Brand Colors - Primary Palette
        'brand-background': '#F5EFE6', // Main app background (cream)
        'brand-cream': '#F5EFE6',
        'brand-brown': '#6B4F4F',
        'brand-beige': '#A99985',
        'brand-text': '#2D1B1B', // High contrast text on light backgrounds
        
        // 🌟 Primary Color Scale (Brand Brown)
        primary: {
          50: '#F7F3F3',
          100: '#EDE5E5',
          200: '#D4C2C2',
          300: '#BB9F9F',
          400: '#8A7272',
          500: '#6B4F4F', // Brand brown
          600: '#5A4242',
          700: '#4A3535',
          800: '#3A2828',
          900: '#2D1B1B',
        },

        // 🎯 Secondary Color Scale (Brand Beige)
        secondary: {
          50: '#F9F7F4',
          100: '#F2EDE6',
          200: '#E0D5C7',
          300: '#CEBDA8',
          400: '#B8A48A',
          500: '#A99985', // Brand beige
          600: '#968670',
          700: '#7D705C',
          800: '#645A49',
          900: '#4B4336',
        },

        // 🖍️ Accent Colors
        accent: {
          50: '#FEF7F3',
          100: '#FDEDE3',
          200: '#FCD5C1',
          300: '#FABD9F',
          400: '#F8935B',
          500: '#F59E0B', // Warm orange
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },

        // 🌓 Dark Theme Support
        'dark-bg': '#1C1C1E',
        'dark-surface': '#2C2C2E',
        'dark-text': '#FFFFFF',
        'dark-text-secondary': '#8E8E93',
        'dark-border': '#38383A',

        // 🎯 Surface Colors
        surface: '#FFFFFF',
        'surface-secondary': '#F8F9FA',
        border: '#E5E7EB',
        'border-light': '#F3F4F6',

        // ✅ Semantic Colors
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        info: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },

        // 🩸 Cycle Phase Colors
        'phase-menstrual': {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
        },
        'phase-follicular': {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
        },
        'phase-ovulation': {
          50: '#FEFCE8',
          100: '#FEF3C7',
          500: '#EAB308',
          600: '#CA8A04',
        },
        'phase-luteal': {
          50: '#FFF7ED',
          100: '#FFEDD5',
          500: '#F97316',
          600: '#EA580C',
        },
      },
      fontFamily: {
        sans: ['System', 'SF Pro Display', 'Roboto', 'sans-serif'],
      },
      fontSize: {
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
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      spacing: {
        '18': '72px',
        '22': '88px',
        '26': '104px',
        '30': '120px',
        '34': '136px',
        '38': '152px',
        '42': '168px',
        '46': '184px',
        '50': '200px',
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
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
      },
    },
  },
  plugins: [],
}
