const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");

let site = { sitename: "GMFC" };

class DynamicHtmlNewsPlugin {
  constructor(options) {
    this.input = options.input || "site.json";
    this.output = options.output || "";
    this.partials = options.partials;
    this.outputNewsMenuPath = options.menujson;
  }

  apply(compiler) {
    const inputPath = path.resolve(compiler.context, "", this.input);
    const outputNewsMenuPath = path.resolve(compiler.context, "", this.outputNewsMenuPath);

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
      let template = "./src/templates/news.html";
      template = path.resolve(compiler.context, "", template);

      for (const [year, data] of byYear) {
        let outputFilename = `news/${year}/index.html`;
        //let urlJson = `news/${year}/news.json`;
        let urlJson = `\\/data/generated/${year}/news.json`;
        let pageurl = "https://www.gmfc.uk/" + outputFilename;

        // Programmatically add a new HtmlWebpackPlugin to the compiler
        let title = `Gordano Model Flying Club - News - ${year}`;
        new HtmlWebpackPlugin({
          title: title,
          template: template,
          filename: outputFilename,
          chunks: ["news"],
          templateParameters: {
            title: title,
            pageurl: pageurl,
            partials: this.partials,
            keywords: "",
            description: "",
            site: site,
            year: year,
            image: null,
            hash: null,
            urlJson: urlJson,
            month: 0,
          },
        }).apply(compiler);
      }

      // months
      for (const [ym, data] of byMonth) {
        let outputFilename = `news/${ym}/index.html`;
        //let urlJson = `news/${ym}/news.json`;
        let urlJson = `\\/data/generated/${ym}/news.json`;
        let pageurl = "https://www.gmfc.uk/" + outputFilename;
        let yearmonth = ym.split("/");
        let year = yearmonth[0];
        let month = yearmonth[1];

        // Programmatically add a new HtmlWebpackPlugin to the compiler
        let title = `Gordano Model Flying Club - News - ${year} - ${month}`;
        new HtmlWebpackPlugin({
          title: title,
          template: template,
          filename: outputFilename,
          chunks: ["news"],
          templateParameters: {
            title: title,
            pageurl: pageurl,
            partials: this.partials,
            keywords: "",
            description: "",
            site: site,
            year: year,
            month: month,
            image: null,
            hash: null,
            urlJson: urlJson,
          },
        }).apply(compiler);
      }

      //create json to fill news menus
      const menus = [];

      for (const [ym, data] of byMonth) {
        const [year, month] = ym.split("/");
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);

        let yearEntry = menus.find((e) => e.year === yearNum);

        if (!yearEntry) {
          yearEntry = { year: yearNum, months: [] };
          menus.push(yearEntry);
        }

        yearEntry.months.push({ month: monthNum });
      }

      const outputNewsMenuContent = JSON.stringify(menus, null, 2);
      if (
        !fs.existsSync(outputNewsMenuPath) ||
        fs.readFileSync(outputNewsMenuPath, "utf8") !== outputNewsMenuContent
      ) {
        fs.writeFileSync(outputNewsMenuPath, outputNewsMenuContent);
      }

      console.log(
        `[DynamicHtmlNewsPlugin] Generated ${byYear.size} year pages and ${byMonth.size} month items.`,
      );
    } catch (err) {
      console.error("[DynamicHtmlNewsPlugin] Error:", err);
    }
  }
}

module.exports = DynamicHtmlNewsPlugin;
