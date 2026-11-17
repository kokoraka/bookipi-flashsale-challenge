import {
  sizes, simpleTheme,
} from "./src/assets/themes"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      ...sizes,
      ...simpleTheme,
    }
  },
  plugins: [],
  darkMode: "selector",
}