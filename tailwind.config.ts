import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#1DB954",
          black: "#191414",
          darkgray: "#121212",
          lightgray: "#282828",
          white: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};

export default config;
