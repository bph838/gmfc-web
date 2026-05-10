const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
//const PrerenderSPAPlugin = require("prerender-spa-plugin");
const PrerendererWebpackPlugin =
  require("@prerenderer/webpack-plugin").default ||
  require("@prerenderer/webpack-plugin");
const PuppeteerRenderer = require("@prerenderer/renderer-puppeteer");

const ProcessWebsitePaths = require("./webpack/ProcessWebsitePaths");
const ProcessWebsiteNewsPaths = require("./webpack/ProcessWebsiteNewsPaths");
const JsonToIcsPlugin = require("./webpack/JsonToIcsPlugin");

const ProcessAlertsPlugin = require("./webpack/ProcessAlertsPlugin");

const ProcessNewsPlugin = require("./webpack/ProcessNewsPlugin");
const ProcessNewsSeperatedPlugin = require("./webpack/ProcessNewsSeperatedPlugin");
const NewsArchivePlugin = require("./webpack/NewsArchivePlugin");

const GenerateSitemapPlugin = require("./webpack/GenerateSitemapPlugin");
const ExcelToCsvAndJsonPlugin = require("./webpack/ExcelToCsvAndJsonPlugin.js");
const DynamicHtmlManagerPlugin = require("./webpack/DynamicHtmlManagerPlugin");
const DynamicHtmlNewsPlugin = require("./webpack/DynamicHtmlNewsPlugin");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const loadPartials = require("./webpack/load-partials");
const { SITE_TITLE } = require("./src/js/components/constants.js");

module.exports = (env, argv) => {
  isProduction = argv.mode === "production";

  const partials = loadPartials(isProduction);
  console.log(`Is Production  ${isProduction}`);

  return {
    mode: isProduction ? "production" : "development",
    devtool: "eval-source-map",
    entry: {
      index: "./src/pages/index.js",
      404: "./src/pages/404.js",
      calendar: "./src/pages/calendar.js",
      news: "./src/pages/news.js",
      aboutus: "./src/pages/aboutus.js",
      gallery: "./src/pages/gallery.js",
      clubleaderboard: "./src/pages/club/leaderboard.js",
      clubleaderboardinstructions:
        "./src/pages/club/leaderboard/instructions.js",
      clubrules: "./src/pages/club/rules.js",
      clubrulesflying: "./src/pages/club/rules/flying.js",
      clubrulesquickguide: "./src/pages/club/rules/quickguide.js",
      clubrulesdisciplinaryprocedure:
        "./src/pages/club/rules/disciplinaryprocedure.js",
      clubmerch: "./src/pages/club/merch.js",
      clubmember: "./src/pages/club/member.js",
      clubmemberexisting:"./src/pages/club/member/existing.js",
      clubmemberprospective:"./src/pages/club/member/prospective.js",
      clubhistory: "./src/pages/club/history.js",
      clubweather: "./src/pages/club/weather.js",
      clubwildlife: "./src/pages/club/wildlife/wildlife.js",
      styles: "./src/scss/styles.scss",
    },
    output: {
      filename: "js/[name].js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
      clean: true,
      devtoolModuleFilenameTemplate: (info) =>
        path.resolve(info.absoluteResourcePath).replace(/\\/g, "/"),
    },
    devtool: "source-map",
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
        "@lapmonitor": path.resolve(__dirname, "src/lapmonitor"),
        "@jdbpages": path.resolve(__dirname, "src/data/pages"),
        "@siteliveurl": "https://www.gmfc.uk/",
      },
      extensions: [".js", ".json"], // optional, helps omit extensions
    },

    plugins: [
      //output leaderboard
      /*
      new ExcelToCsvAndJsonPlugin({
        input: path.resolve(__dirname, "src/data/dynamic/leaderboard.xlsx"),
        sheetName: "Leaderboard", // Your Excel sheet name
        csvOutput: "src/data/dynamic/leaderboard.csv", // Where CSV will go
        jsonOutput: "src/data/leaderboard.json", // Where JSON will go
        mode: isProduction,
      }),*/
      new ProcessWebsitePaths({
        sourceFile: "./src/data/site/static.json",
        outputFile: "./src/data/generated/site.json",
      }),
      new ProcessAlertsPlugin({
        sourceFile: "./src/data/site/alerts.json",
        outputFile: "./src/data/alerts.json",
      }),
      new ProcessNewsPlugin({
        sourceFile: "./src/data/site/news-raw.json",
        outputFile: "./src/data/generated/news-step-1.json",
      }),
      new ProcessNewsSeperatedPlugin({
        sourceFile: "./src/data/generated/news-step-1.json",
        outputFile: "./src/data/generated/news-step-2.json",
        postsBaseDir: "./src/data/generated/",
      }),
      new ProcessWebsiteNewsPaths({
        newsSource: "./src/data/generated/news-step-2.json",
        siteSource: "./src/data/generated/site.json",
        outputFile: "./src/data/generated/news-processed.json",
        newsOutput: "./src/data/news.json",
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
                "**/wildlife/**",
                "**/hisory/**",
                "**/merch/**",
                "**/stickers/**",
                "**/weather/**",
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
      // Dynamically create all HTML pages based on site.json
      new DynamicHtmlManagerPlugin({
        sourceFile: "./src/data/generated/news-processed.json",
        partials: partials,
      }),
      //sitmap
      new GenerateSitemapPlugin({
        input: "./src/data/generated/news-processed.json",
        siteUrl: "https://www.gmfc.uk",
        output: "src/rootdir/sitemap.xml",
      }),
      //ics file
      new JsonToIcsPlugin({
        input: "src/data/calendarevents.json",
        output: "calendar.ics",
        prodId: "-//" + SITE_TITLE + "//Club Calendar//EN",
        nameId: SITE_TITLE,
      }),
      //seperate out all the newsa json file to year/month
      new NewsArchivePlugin({
        input: "./src/data/news.json",
        output: "./src/data/generated/", // -> dist/news/{year}/{month}/news.json
        writeToDisk: true,
      }),
      // Dynamically create all HTML pages based on site.json
      new DynamicHtmlNewsPlugin({
        input: "./src/data/news.json",
        output: "./src/data/generated/",
        menujson: "./src/data/generated/menu.json",
        //sourceFile: "./src/data/generated/news-processed.json",
        partials: partials,
      }),
    ],
    watchOptions: {
      ignored: [
        "**/src/rootdir/sitemap.xml",
        "**/src/data/generated/",
        "**/src/data/generated/*",
        "**/src/data/generated/*.*",
      ],
    },

    performance: {
      hints: false,
    },
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
