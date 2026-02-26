const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const GenerateSiteJsonPlugin = require("./webpack/GenerateSiteJsonPlugin");
const UpdateStaticJsonPlugin = require("./webpack/UpdateStaticJsonPlugin");
const DynamicHtmlManagerPlugin = require("./webpack/DynamicHtmlManagerPlugin");
const loadPartials = require("./webpack/load-partials");

module.exports = (env, argv) => {
  isProduction = argv.mode === "production";

  const partials = loadPartials(isProduction);

  return {
    mode: isProduction ? "production" : "development",

    entry: "./src/index.js",
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "dist"),
      clean: true, // This keeps your dist folder tidy!
    },
    devServer: {
      static: "./dist",
      hot: true, // Enables Hot Module Replacement (updates without full refresh)
      port: 8080, // You can change this to any number you like
      open: true, // Automatically opens your browser
    },
    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "src/js/components"),
        "@framework": path.resolve(__dirname, "src/js/framework"),
        "@data": path.resolve(__dirname, "src/data"),
        "@jdbpages": path.resolve(__dirname, "src/data/pages"),
        "@siteliveurl": "https://www.gmfc.uk/",
      },
      extensions: [".js", ".json"], // optional, helps omit extensions
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new UpdateStaticJsonPlugin({
        filename: "@data/site/static.json", // You can now pass the filename here
        jdblocation: "@jdbpages",
      }),
      new GenerateSiteJsonPlugin({
        sourceFile: "./src/data/site/static.json",
        outputFile: "./src/data/site/site.json",
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "src/data",
            to: "data",
            globOptions: {
              ignore: ["**/dynamic/**", "**/documents/**", "**/site.json"],
            },
          },
          {
            from: "src/images",
            to: "images",
            globOptions: {
              ignore: [
                "**/carousel/**",
                "**/cartrack/**",
                "**/crawl/**",
                "**/flying/**",
                "**/hero/**",
                "**/news/**",
                "**/racing/**",
                "**/favicon/**",
                "**/icons/**",
                "**/siteimages/**",
              ],
            },
          },
          { from: "src/rootdir/favicon.ico", to: "." },
          { from: "src/rootdir/site.webmanifest", to: "." },
          { from: "src/rootdir/sitemap.xml", to: "." },
          { from: "src/rootdir/robots.txt", to: "." },
        ],
      }),
      // 3. Dynamically create all HTML pages based on site.json
      new DynamicHtmlManagerPlugin({
        sourceFile: "./src/data/site/site.json",
        partials: partials,
      }),
    ],
  };
};
