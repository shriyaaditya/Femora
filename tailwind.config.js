/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        denis: ['DenisMacharov', 'serif'],
        // Don't override default fonts globally - let components choose
      },
    },
    // Remove global font overrides to preserve icon fonts
    fontFamily: {
      // Keep system defaults for icons and system elements
      sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      serif: ['Georgia', 'Times New Roman', 'serif'],
      mono: ['Monaco', 'Consolas', 'monospace'],
    },
  },
  plugins: [],
};
