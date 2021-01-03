module.exports = {
  mode: "development",
  entry: "./script/index.ts",

  output: {
    path: `${__dirname}/dist`,
    filename: "index.js",
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  target: ["web", "es5"],
};
