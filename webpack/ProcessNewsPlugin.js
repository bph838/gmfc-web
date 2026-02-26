const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

class ProcessNewsPlugin {
  constructor(options) {
    this.sourceFile = options.sourceFile || "news.json";
    this.outputFile = options.outputFile || "news-processed.json";
    this.postsFolderName = options.postsFolderName;
  }

  apply(compiler) {
    compiler.hooks.environment.tap("ProcessNewsPlugin", () => {
      const srcDir = path.resolve(compiler.context, "");
      const sourcePath = path.resolve(srcDir, this.sourceFile);
      const outputPath = path.resolve(srcDir, this.outputFile);

      if (!fs.existsSync(sourcePath)) {
        console.warn(`[ProcessNewsPlugin] Source not found: ${sourcePath}`);
        return;
      }

      try {
        const rawData = fs.readFileSync(sourcePath, "utf8");
        let newsArray = JSON.parse(rawData);

        // 1. Sort the array by date (Newest First)
        newsArray.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });

        // 2. Map through and add the hash
        const processedNews = newsArray.map((item) => {
          // Hash based on title and date to ensure uniqueness
          const hashString = `${item.title}${item.date}`;
          const hash = crypto
            .createHash("md5")
            .update(hashString)
            .digest("hex");

          return {
            ...item,
            hash: hash,
          };
        });

        const outputContent = JSON.stringify(processedNews, null, 2);        

        // 3. Prevent unnecessary writes
        if (
          !fs.existsSync(outputPath) ||
          fs.readFileSync(outputPath, "utf8") !== outputContent
        ) {
          fs.writeFileSync(outputPath, outputContent);
          console.log(
            `[ProcessNewsPlugin] Sorted and hashed ${processedNews.length} news items.`,
          );
        }
      } catch (err) {
        console.error("[ProcessNewsPlugin] Error processing news:", err);
      }
    });
  }
}

module.exports = ProcessNewsPlugin;
