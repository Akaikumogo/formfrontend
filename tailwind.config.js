/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1F3A',
          light: '#132D52',
          dark: '#071528',
        },
        accent: '#1B4F8A',
        silver: '#D0D5DD',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
