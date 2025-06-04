/** @type {import('tailwindcss').Config} */
const config = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          background: "var(--color-background)",
          foreground: "var(--color-foreground)",
          gold: "var(--color-gold)",
          lightPurple: "var(--color-lightPurple)",
          darkPurple: "var(--color-darkPurple)",
        },
      },
    },
    plugins: [],
  };
  
  export default config;
  