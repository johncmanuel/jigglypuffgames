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
        screenShake: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-5px, -3px)" },
          "20%": { transform: "translate(5px, 3px)" },
          "30%": { transform: "translate(-3px, 5px)" },
          "40%": { transform: "translate(3px, -5px)" },
          "50%": { transform: "translate(-5px, 3px)" },
          "60%": { transform: "translate(5px, -3px)" },
          "70%": { transform: "translate(-3px, -5px)" },
          "80%": { transform: "translate(3px, 5px)" },
          "90%": { transform: "translate(-5px, -3px)" },
        },
        moveLeftToRight: {
          "0%": { transform: "translateX(-250px)" },
          "100%": { transform: "translateX(calc(100vw + 250px))" },
        },
        moveRightToLeft: {
          "0%": { transform: "translateX(calc(100vw + 250px))" },
          "100%": { transform: "translateX(-250px)" },
        },
      },
      animation: {
        bounce: "bounce 1s infinite",
        floatUp: "floatUp 2s ease-in-out forwards",
        glow: "glow 2s infinite alternate",
        screenShake: "screenShake 0.5s linear 4",
        moveLeftToRight: "moveLeftToRight 6s linear forwards",
        moveRightToLeft: "moveRightToLeft 6s linear forwards",
      },
    },
  },
  plugins: [],
};
