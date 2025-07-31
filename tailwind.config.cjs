/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
    // Safelist these dynamic classes for Tailwind to pick them up
    // This ensures that even if dynamically constructed, they are included in the final CSS
    { raw: 'theme-blue theme-red theme-green theme-orange dark:theme-blue dark:theme-red dark:theme-green dark:theme-orange' },
    { raw: 'shadow-sm-applied shadow-md-applied shadow-lg-applied shadow-xl-applied dark:shadow-sm-applied dark:shadow-md-applied dark:shadow-lg-applied dark:shadow-xl-applied' }
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Define a dynamic primary color using CSS variables
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
          950: 'var(--color-primary-950)',
        },
      },
      boxShadow: {
        // Define a dynamic shadow using a CSS variable
        dynamic: 'var(--shadow-dynamic)',
      },
    },
  },
  plugins: [],
}
