const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const GenerateSiteJsonPlugin = require("./webpack/GenerateSiteJsonPlugin");
const UpdateStaticJsonPlugin = require("./webpack/UpdateStaticJsonPlugin");
const DynamicHtmlManagerPlugin = require("./webpack/DynamicHtmlManagerPlugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const loadPartials = require("./webpack/load-partials");

module.exports = (env, argv) => {
  isProduction = argv.mode === "production";

  const partials = loadPartials(isProduction);

  return {
    mode: isProduction ? "production" : "development",

    entry: {
      index: "./src/pages/index.js",
      /*404: "./src/pages/404.js",
      calendar: "./src/pages/calendar.js",
      news: "./src/pages/news.js",
      aboutus: "./src/pages/aboutus.js",
      gallery: "./src/pages/gallery.js",
      leaderboard: "./src/pages/club/leaderboard.js",
      clubrules: "./src/pages/club/rules.js",
      clubmerch: "./src/pages/club/merch.js",
      clubmember: "./src/pages/club/member.js",
      cubhistory: "./src/pages/club/history.js",
      clubweather: "./src/pages/club/weather.js",*/
      styles: "./src/scss/styles.scss",
    },
    output: {
      filename: "js/[name].js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
      clean: true,
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
      //css
      new MiniCssExtractPlugin({
        filename: "styles/styles.css", // output CSS file name
      }),
      // 3. Dynamically create all HTML pages based on site.json
      new DynamicHtmlManagerPlugin({
        sourceFile: "./src/data/site/site.json",
        partials: partials,
      }),
    ],
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false, // Remove all comments
            },
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          framework: {
            test: /[\\/]src[\\/]js[\\/]framework[\\/]/,
            name: "framework",
            chunks: "all",
            enforce: true,
          },

          components: {
            test: /[\\/]src[\\/]js[\\/]components[\\/]/,
            name: "components",
            chunks: "all",
            enforce: true,
          },
        },
      },
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.scss$/i,
          use: [
            MiniCssExtractPlugin.loader, // extract CSS to separate file
            "css-loader", // translates CSS into CommonJS
            "postcss-loader", // optional, for autoprefixing
            {
              loader: "sass-loader", // compiles SCSS to CSS
              options: {
                sassOptions: {
                  quietDeps: true, // <- hides warnings from dependencies like Bootstrap
                },
              },
            },
          ],
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          type: "asset/resource",
          generator: {
            filename: "images/[name][ext]",
          },
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/i,
          type: "asset/resource",
          generator: {
            filename: "fonts/[name][ext]",
          },
        },
      ],
    },
  };
};
