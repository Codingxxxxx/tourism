/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Note the addition of the `app` directory.
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
 
    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
    screens: {
      xs: '0px',       // optional (default is mobile-first)
      sm: '600px',     // match MUI sm
      md: '900px',     // match MUI md
      lg: '1200px',    // match MUI lg
      xl: '1536px',    // match MUI xl
    },
  },
  plugins: [],
}