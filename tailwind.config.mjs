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
        neutral: {
          ink: '#1E293B',
          muted: '#64748B',
          'muted-strong': '#475569',
          divider: '#E2E8F0',
          stroke: '#CBD5E1',
          field: '#F8FAFC',
          rail: '#F1F5F9',
        },
        panel: {
          'on-navy': '#FFFFFF',
          text: '#DBEAFE',
          border: '#1E3A8A',
          divider: '#1E40AF',
        },
      }
    },
  },
  plugins: [],
};
