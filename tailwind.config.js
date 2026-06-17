/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
    },
    extend: {
      colors: {
        bg: {
          primary: "#0d0221",
          secondary: "#1a0a2e",
          tertiary: "#2d1b4e",
          glass: "rgba(255, 255, 255, 0.05)",
          "glass-hover": "rgba(255, 255, 255, 0.08)",
        },
        text: {
          primary: "#ffffff",
          secondary: "#b8a9d4",
          muted: "#7b6fa0",
        },
        accent: {
          pink: "#ff2d95",
          blue: "#00d4ff",
          gold: "#ffd700",
          green: "#39ff14",
          red: "#ff3366",
          purple: "#9d4edd",
        },
        border: {
          DEFAULT: "rgba(255, 45, 149, 0.2)",
          light: "rgba(255, 255, 255, 0.1)",
          pink: "rgba(255, 45, 149, 0.5)",
          blue: "rgba(0, 212, 255, 0.5)",
        },
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        body: ["Noto Sans SC", "sans-serif"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "bounce-slow": "bounce 3s infinite",
        "spin-slow": "spin 8s linear infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "glow-pink": "glow-pink 2s ease-in-out infinite alternate",
        "glow-gold": "glow-gold 2s ease-in-out infinite alternate",
        "countdown-blink": "countdown-blink 1s ease-in-out infinite",
        "gradient-x": "gradient-x 3s ease infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(255, 45, 149, 0.5)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 40px rgba(255, 45, 149, 0.8)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "glow-pink": {
          "0%": { boxShadow: "0 0 5px #ff2d95, 0 0 10px #ff2d95" },
          "100%": { boxShadow: "0 0 20px #ff2d95, 0 0 30px #ff2d95, 0 0 40px #ff2d95" },
        },
        "glow-gold": {
          "0%": { boxShadow: "0 0 5px #ffd700, 0 0 10px #ffd700" },
          "100%": { boxShadow: "0 0 20px #ffd700, 0 0 30px #ffd700, 0 0 40px #ffd700" },
        },
        "countdown-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-pink-blue": "linear-gradient(135deg, #ff2d95, #00d4ff)",
        "gradient-gold-pink": "linear-gradient(135deg, #ffd700, #ff2d95)",
        "gradient-purple-pink": "linear-gradient(135deg, #9d4edd, #ff2d95)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
      },
      boxShadow: {
        "neon-pink": "0 0 10px rgba(255, 45, 149, 0.5), 0 0 20px rgba(255, 45, 149, 0.3)",
        "neon-blue": "0 0 10px rgba(0, 212, 255, 0.5), 0 0 20px rgba(0, 212, 255, 0.3)",
        "neon-gold": "0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)",
        "neon-green": "0 0 10px rgba(57, 255, 20, 0.5), 0 0 20px rgba(57, 255, 20, 0.3)",
        "card": "0 8px 32px rgba(0, 0, 0, 0.3)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
