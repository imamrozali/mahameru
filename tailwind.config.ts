import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          600: "#999cad",
          700: "#353843",
          800: "#13141b",
          900: "#0d0e13",
        },
      },
    },
  },
  plugins: [],
};
export default config;
