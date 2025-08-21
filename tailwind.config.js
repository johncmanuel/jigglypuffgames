/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      // keyframes and anim mainly for math melody
      keyframes: {
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        floatUp: {
          "0%": { transform: "translateY(0) scale(0.5)", opacity: "1" },
          "100%": { transform: "translateY(-100px) scale(1.2)", opacity: "0" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 10px #ec4899, 0 0 20px #ec4899" },
          "50%": { boxShadow: "0 0 25px #ec4899, 0 0 40px #ec4899" },
        },
      },
      animation: {
        bounce: "bounce 1s infinite",
        floatUp: "floatUp 2s ease-in-out forwards",
        glow: "glow 2s infinite alternate",
      },
    },
  },
  plugins: [],
};
