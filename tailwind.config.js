/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    screens: {
      tiny: "320px",
      small: "540px",
      normal: "1024px",
      large: "1400px",
      huge: "1600px",
      giant: "2240px",
    },
    extend: {},
  },
  plugins: [],
}

