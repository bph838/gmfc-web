const path = require("path");
const fs = require("fs");

class ProcessWebsitePaths {
  constructor(options) {
    this.sourceFile = options.sourceFile || "static.json";
    this.outputFile = options.outputFile || "site.json";
  }

  apply(compiler) {
    // Run at the very start of the compilation
    compiler.hooks.environment.tap("ProcessWebsitePaths", () => {
      const srcDir = path.resolve(compiler.context, "");
      const sourcePath = path.resolve(srcDir, this.sourceFile);
      const outputPath = path.resolve(srcDir, this.outputFile);

      if (!fs.existsSync(sourcePath)) {
        console.warn(
          `[ProcessWebsitePaths] Source file missing: ${sourcePath}`,
        );
        return;
      }

      try {
        const rawData = fs.readFileSync(sourcePath, "utf8");
        const data = JSON.parse(rawData);
        let hasChanged = false;

        const keywordsString = data.keywords.join(", ");
        const descriptionString = data.description;

        // 1. Update dates in the data object based on the filesystem
        const processedPages = data.pages.map((page) => {
          let updatedDate = page.date_modified;

          if (page.datetype === "filemodified" && page.jdb) {
            // Resolve the path (handling the @jdbpages shorthand)
            const jdbRelativePath = page.jdb.replace("@jdbpages/", "jdbpages/");
            const jdbFullPath = path.resolve(srcDir, jdbRelativePath);

            if (fs.existsSync(jdbFullPath)) {
              const stats = fs.statSync(jdbFullPath);
              const mTime = stats.mtime.toISOString();

              if (page.date_modified !== mTime) {
                updatedDate = mTime;
                hasChanged = true;
              }
            }
          }

          let keywords = keywordsString;
          if (page.keywords)
            keywords = keywordsString + ", " + page.keywords.join(", ");

          let description = descriptionString;
          if (page.description) description = description;

          // 2. Return the "clean" object for site.json
          return {
            title: page.title,
            page: page.page,
            url: page.url,
            keywords: keywords,
            description: description,
            chunks: page.chunks,
            date_modified: updatedDate, // Now included as requested
          };
        });

        // 3. Update the source static.json if dates changed
        if (hasChanged) {
          data.pages.forEach((p, i) => {
            p.date_modified = processedPages[i].date_modified;
          });
          fs.writeFileSync(sourcePath, JSON.stringify(data, null, 2));
        }

        // 4. Write the new site.json
        const outputContent = JSON.stringify(
          { pages: processedPages },
          null,
          2,
        );

        // Only write if content is different to prevent Webpack watch loops
        if (
          !fs.existsSync(outputPath) ||
          fs.readFileSync(outputPath, "utf8") !== outputContent
        ) {
          fs.writeFileSync(outputPath, outputContent);
          console.log(
            `[ProcessWebsitePaths] Updated ${this.outputFile} with latest timestamps.`,
          );
        }
      } catch (err) {
        console.error("[ProcessWebsitePaths] Error processing JSON:", err);
      }
    });
  }
}

module.exports = ProcessWebsitePaths;
