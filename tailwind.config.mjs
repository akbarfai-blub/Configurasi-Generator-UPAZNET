/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'upaz-green': '#00A651',
        'upaz-blue': '#003C71',
        'upaz-bg': '#FBFCFD',
      }
    },
  },
  plugins: [],
};
