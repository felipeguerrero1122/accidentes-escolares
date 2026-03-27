import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#183b56",
        mist: "#f5f7fb",
        accent: "#ea7b39",
        pine: "#0d6f63",
        warn: "#c2410c"
      },
      boxShadow: {
        card: "0 16px 36px rgba(24,59,86,0.08)"
      }
    }
  },
  plugins: []
};

export default config;
