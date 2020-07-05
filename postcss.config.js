const production = !process.env.ROLLUP_WATCH;

module.exports = {
  plugins: [
    require("postcss-import"),
    require("tailwindcss"),
    require("postcss-nested"),
    require("autoprefixer"),
    ...(production
      ? [
          require("@fullhuman/postcss-purgecss")({
            content: ["./src/**/*.html", "./src/**/*.svelte"],

            whitelistPatterns: [/svelte-/],

            defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || [],
          }),
          require("cssnano"),
        ]
      : []),
  ],
};
