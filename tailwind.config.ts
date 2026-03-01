import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 18px 40px rgba(44, 62, 80, 0.08)"
      },
      colors: {
        mist: "#f4f8f3",
        sage: "#6d8b74",
        moss: "#3f5f4b",
        sand: "#f5e9da",
        gold: "#f0c56c"
      }
    }
  },
  daisyui: {
    themes: [
      {
        zenludico: {
          primary: "#6d8b74",
          secondary: "#9eb384",
          accent: "#f0c56c",
          neutral: "#2f3e36",
          "base-100": "#f7fbf6",
          "base-200": "#edf4eb",
          "base-300": "#dce7d9",
          info: "#82b4b7",
          success: "#7fb77e",
          warning: "#e4b363",
          error: "#d86c70"
        }
      }
    ]
  },
  plugins: [daisyui]
};

export default config;
