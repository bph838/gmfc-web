const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");

let site = { sitename: "GMFC" };

class DynamicHtmlNewsPlugin {
  constructor(options) {
    this.input = options.input || "site.json";
    this.output = options.output || "";
    this.partials = options.partials;
  }

  apply(compiler) {
    const inputPath = path.resolve(compiler.context, "", this.input);

    if (!fs.existsSync(inputPath)) {
      console.warn(
        `[DynamicHtmlNewsPlugin] ${this.input} not found. Skipping page generation.`,
      );
      return;
    }

    try {
      const items = JSON.parse(fs.readFileSync(inputPath, "utf8"));

      const byYear = new Map();
      const byMonth = new Map();

      for (const item of items) {
        const d = new Date(item.date);
        const year = String(d.getFullYear());
        const month = String(d.getMonth() + 1).padStart(2, "0");

        if (!byYear.has(year)) byYear.set(year, []);
        byYear.get(year).push(item);

        const ym = `${year}/${month}`;
        if (!byMonth.has(ym)) byMonth.set(ym, []);
        byMonth.get(ym).push(item);
      }

      let yearsSize = 0;
      for (const [year, data] of byYear) {
        yearsSize++;
        //writeJson(path.join(this.output, year, "news.json"), data);
        let template = "./src/templates/main.html";
        template = path.resolve(compiler.context, "", template);
        let outputFilename = `news/${year}/index.html`;
        let pageurl = "https://www.gmfc.uk/" + outputFilename;

        // Programmatically add a new HtmlWebpackPlugin to the compiler
        let title = `Gordano Model Flying Club - News = ${year}`;
        new HtmlWebpackPlugin({
          title: title,
          template: template,
          filename: outputFilename,
          chunks: ["news"],
          //inject: "body",
          templateParameters: {
            pageurl: pageurl,
            partials: this.partials,
            keywords: "keywords",
            description: "description",
            site: site,
          },
        }).apply(compiler);
      }

      console.log(
        `[DynamicHtmlNewsPlugin] Generated ${yearsSize} year pages and ${byMonth.size} month items.`,
      );
    } catch (err) {
      console.error("[DynamicHtmlNewsPlugin] Error:", err);
    }
  }
}

module.exports = DynamicHtmlNewsPlugin;
