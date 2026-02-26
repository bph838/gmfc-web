const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const PrerenderSPAPlugin = require("prerender-spa-plugin");
const GenerateSiteJsonPlugin = require("./webpack/GenerateSiteJsonPlugin");
const ProcessWebsitePaths = require("./webpack/ProcessWebsitePaths");
const ProcessAlertsPlugin = require("./webpack/ProcessAlertsPlugin");

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
      404: "./src/pages/404.js",
      calendar: "./src/pages/calendar.js",
      news: "./src/pages/news.js",
      aboutus: "./src/pages/aboutus.js",
      gallery: "./src/pages/gallery.js",
      clubleaderboard: "./src/pages/club/leaderboard.js",
      clubrules: "./src/pages/club/rules.js",
      clubmerch: "./src/pages/club/merch.js",
      clubmember: "./src/pages/club/member.js",
      clubhistory: "./src/pages/club/history.js",
      clubweather: "./src/pages/club/weather.js",
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
      //open: true, // Automatically opens your browser
      historyApiFallback: {
        index: "/404.html",
        rewrites: [
          // specific exception
          { from: /^\/news\/?$/, to: "/news.html" },

          // only rewrite paths WITHOUT extensions
          {
            from: /^(?!.*\.\w+$).*/,
            to: (ctx) => `${ctx.parsedUrl.pathname.replace(/\/$/, "")}.html`,
          },
        ],
      },
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
      new ProcessWebsitePaths({
        sourceFile: "./src/data/site/static.json",
        outputFile: "./src/data/generated/site.json",
      }),
      new ProcessAlertsPlugin({
        sourceFile: "./src/data/site/alerts.json",
        outputFile: "./src/data/alerts.json",
      }),
      /* new GenerateSiteJsonPlugin({
        sourceFile: "./src/data/site/static.json",
        outputFile: "./src/data/site/site.json",
      }),*/

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
        sourceFile: "./src/data/generated/site.json",
        partials: partials,
      }),

      /*
      new PrerenderSPAPlugin({
        staticDir: path.join(__dirname, "dist"),

        // URL routes, NOT filenames
        routes: [
          "/",
                "/aboutus",
          "/gallery",
          "/calendar",
          "/news",
          "/club",
          "/club/history",
          "/club/rules",
          "/club/leaderboard",
          "/club/weather",
        ],

        renderer: new PrerenderSPAPlugin.PuppeteerRenderer({
          headless: false, // true for CI/build
          renderAfterDocumentEvent: "render-ready",
          maxConcurrentRoutes: 4, // faster builds
          timeout: 30000,
        }),
      }),
      */
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
