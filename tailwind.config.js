/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#2A4343',      // Primary Dark (Text, Sidebar, Headers)
          teal: '#416B66',      // Secondary Teal (Buttons, Active States)
          muted: '#646756',     // Muted Gray-Green (Borders, Subtext)
          orange: '#D35E36',    // Accent Orange (CTAs like Save, Print, Issue Invoice)
          sand: '#F1D49A',      // Soft Sand Background
          sage: '#C0C29D',      // Light Sage Background
          'dark-light': '#365555',
          'teal-light': '#51857e',
          'teal-subtle': '#eef5f4',
          'sand-subtle': '#fdf8ee',
          'sage-subtle': '#f7f8f3',
          'orange-light': '#ea6f45',
          'orange-subtle': '#fdf2ed',
          border: '#d6d9cb',
          card: '#ffffff',
          surface: '#fcfcf9',
          body: '#f7f8f4'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        tamil: ['"Mukta Malar"', '"Noto Sans Tamil"', 'Latha', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(42, 67, 67, 0.06), 0 1px 3px 0 rgba(42, 67, 67, 0.04)',
        card: '0 4px 20px -4px rgba(42, 67, 67, 0.08), 0 2px 6px -2px rgba(42, 67, 67, 0.04)',
        elevated: '0 10px 30px -6px rgba(42, 67, 67, 0.12), 0 4px 10px -3px rgba(42, 67, 67, 0.06)',
      }
    },
  },
  plugins: [],
}
