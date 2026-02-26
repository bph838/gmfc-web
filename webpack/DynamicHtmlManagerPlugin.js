const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");

let site = { sitename: "GMFC" };
let partials = {};

class DynamicHtmlManagerPlugin {
  constructor(options) {
    this.sourceFile = options.sourceFile || "site.json";
    this.partials = options.partials;
  }

  apply(compiler) {
    const siteJsonPath = path.resolve(compiler.context, "", this.sourceFile);

    if (!fs.existsSync(siteJsonPath)) {
      console.warn(
        `[DynamicHtmlManagerPlugin] ${this.sourceFile} not found. Skipping page generation.`,
      );
      return;
    }

    try {
      const siteData = JSON.parse(fs.readFileSync(siteJsonPath, "utf8"));

      siteData.pages.forEach((pageData) => {
        // Clean @/ shorthand
        let template = "./src/templates/main.html";

        //work out template
        if (pageData.template === "main.html")
          template = "./src/templates/main.html";

        template = path.resolve(compiler.context, "", template);

        // Determine output filename
        // If url is @/, output is index.html. If @/about, output is about/index.html
        let outputFilename = pageData.page.replace("@/", "");
        if (outputFilename === "" || outputFilename.endsWith("/")) {
          outputFilename += "index.html";
        }

        let pageurl = "https://www.gmfc.uk/" + outputFilename;

        // Programmatically add a new HtmlWebpackPlugin to the compiler
        new HtmlWebpackPlugin({
          title: pageData.title,
          template: template,
          filename: outputFilename,
          inject: "body",
          templateParameters: {
            pageurl: pageurl,
            partials: this.partials,
            keywords: pageData.page.keywords,
            description: pageData.page.description,
            site: site,
          },
        }).apply(compiler);
      });

      console.log(
        `[DynamicHtmlManagerPlugin] Generated ${siteData.pages.length} pages.`,
      );
    } catch (err) {
      console.error("[DynamicHtmlManagerPlugin] Error:", err);
    }
  }
}

module.exports = DynamicHtmlManagerPlugin;
