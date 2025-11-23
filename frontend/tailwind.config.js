/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/react";
import typography from '@tailwindcss/typography';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/react/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f8ff',
          100: '#dcecff',
          200: '#b9d8ff',
          300: '#8bbcff',
          400: '#5f9cff',
          500: '#3a7bff',
          600: '#2a5fe0',
          700: '#224bb3',
          800: '#1f3f8f',
          900: '#1f356f',
        },
      },
    },
  },
  plugins: [heroui(), typography],
};
