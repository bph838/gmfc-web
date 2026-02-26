const path = require("path");
const fs = require("fs");

class GenerateSiteJsonPlugin {
  constructor(options) {
    this.sourceFile = options.sourceFile || "static.json";
    this.outputFile = options.outputFile || "site.json";
  }

  apply(compiler) {
    // Using environment hook so it runs right at the start
    compiler.hooks.environment.tap("GenerateSiteJsonPlugin", () => {
      const sourcePath = path.resolve(compiler.context, "", this.sourceFile);
      const outputPath = path.resolve(compiler.context, "", this.outputFile);

      if (!fs.existsSync(sourcePath)) {
        console.warn(
          `[GenerateSiteJsonPlugin] Source not found: ${sourcePath}`,
        );
        return;
      }

      try {
        const rawData = fs.readFileSync(sourcePath, "utf8");
        const staticData = JSON.parse(rawData);

        // Map only the fields you want
        const siteData = {
          pages: staticData.pages.map((p) => ({
            title: p.title,
            page: p.page,
            url: p.url,
          })),
        };

        const jsonString = JSON.stringify(siteData, null, 2);

        // Read existing file to check if we actually need to write (avoids loop)
        let existingData = "";
        if (fs.existsSync(outputPath)) {
          existingData = fs.readFileSync(outputPath, "utf8");
        }

        if (jsonString !== existingData) {
          fs.writeFileSync(outputPath, jsonString);
          console.log(
            `[GenerateSiteJsonPlugin] Successfully updated src/${this.outputFile}`,
          );
        } else {
          console.log(
            `[GenerateSiteJsonPlugin] ${this.outputFile} is already up to date.`,
          );
        }
      } catch (err) {
        console.error("[GenerateSiteJsonPlugin] Error:", err);
      }
    });
  }
}

module.exports = GenerateSiteJsonPlugin;
