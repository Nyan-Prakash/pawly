/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pawly: {
          green: '#22C55E',
          gold: '#F59E0B',
          coach: '#3B82F6',
          appBg: '#FFF9F4',
          surface: '#FFFFFF',
          surfaceAlt: '#F5F7F9',
          textPrimary: '#111827',
          textSecondary: '#6B7280',
          border: '#E5E7EB',
          borderSoft: '#EEF2F7',
          success: '#22C55E',
          warning: '#FBBF24',
          error: '#EF4444',
        }
      }
    }
  },
  plugins: []
};
