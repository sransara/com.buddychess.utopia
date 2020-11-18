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
        sans: ["Source Sans Pro", ...defaultTheme.fontFamily.sans],
        mono: ["Source Code Pro", ...defaultTheme.fontFamily.sans],
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
