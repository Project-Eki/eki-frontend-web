/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 'Inter' for body text (clean & readable)
        sans: ['Inter', 'sans-serif'],
        // 'Poppins' for headings (bold & modern)
        display: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}