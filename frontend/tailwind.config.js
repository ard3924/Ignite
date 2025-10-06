/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'text-gradient': 'text-gradient-anim 3s ease infinite',
      },
      keyframes: {
        'text-gradient-anim': {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': { 'background-position': '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
