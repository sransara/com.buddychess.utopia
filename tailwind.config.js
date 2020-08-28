const production = !process.env.ROLLUP_WATCH;

const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: {
    enabled: production,
    content: ["./src/**/*.html", "./src/**/*.svelte"],
    options: {
      whitelistPatterns: [/svelte-/],
    },
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ["Source Sans Pro"],
        mono: ["Source Code Pro"],
      },
      padding: {
        "1/8": "12.5%",
      },
      width: {
        "1/8": "12.5%",
      },
    },
  },
  variants: {},
  plugins: [require("@tailwindcss/typography")],
};
