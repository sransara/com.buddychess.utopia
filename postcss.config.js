const production = !process.env.ROLLUP_WATCH;

module.exports = {
  plugins: [
    require("postcss-import"),
    require("postcss-url")([
      { url: "inline", maxSize: 1, fallback: "copy", optimizeSvgEncode: true },
      {
        url: "copy",
        assetsPath: "assets",
        useHash: true,
        hashOptions: { append: true },
      },
    ]),
    require("postcss-nested"),
    require("tailwindcss"),
    require("autoprefixer"),
    ...(production ? [require("cssnano")] : []),
  ],
};
