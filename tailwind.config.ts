/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pink and gold theme
        'coquette-pink': {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        'coquette-gold': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        'coquette-cream': {
          50: '#fefcfb',
          100: '#fef7f0',
          200: '#fdedd6',
          300: '#fbe2b8',
          400: '#f8d08a',
          500: '#f4c05a',
          600: '#e6a847',
          700: '#d19133',
          800: '#b8781f',
          900: '#9f5f0b',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'elegant': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #fce7f3 0%, #fef3c7 100%)',
        'gradient-pink': 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
        'gradient-gold': 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      },
      boxShadow: {
        'primary': '0 10px 25px -5px rgba(236, 72, 153, 0.1), 0 10px 10px -5px rgba(236, 72, 153, 0.04)',
        'primary-lg': '0 20px 25px -5px rgba(236, 72, 153, 0.1), 0 10px 10px -5px rgba(236, 72, 153, 0.04)',
      }
    },
  },
  plugins: [],
};
