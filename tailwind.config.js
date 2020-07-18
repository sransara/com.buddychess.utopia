const production = !process.env.ROLLUP_WATCH;

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
