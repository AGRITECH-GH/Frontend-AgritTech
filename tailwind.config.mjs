/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0FBD3B",
        "primary-dark": "#052e16",
        background: "#ffffff",
        surface: "#f6f8f6",
        muted: "#6b7280",
        foreground: "#111827",
        border: "#e2e8f0",
      },
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
        heading: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 45px rgba(15,23,42,0.12)",
        "soft-lg": "0 30px 80px rgba(15,23,42,0.18)",
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1.5rem",
          lg: "2rem",
          xl: "3rem",
        },
      },
    },
  },
  plugins: [],
};
