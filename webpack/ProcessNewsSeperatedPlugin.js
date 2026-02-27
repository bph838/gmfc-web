const path = require("path");
const fs = require("fs");

class ProcessNewsSeperatedPlugin {
  constructor(options) {
    this.sourceFile = options.sourceFile || "news.json";
    this.outputFile = options.outputFile || "news-processed.json";
    this.postsBaseDir = options.postsBaseDir || "posts";
  }

  apply(compiler) {
    compiler.hooks.environment.tap("ProcessNewsSeperatedPlugin", () => {
      const srcDir = path.resolve(compiler.context, "");
      const sourcePath = path.resolve(srcDir, this.sourceFile);
      const outputPath = path.resolve(srcDir, this.outputFile);

      if (!fs.existsSync(sourcePath)) return;

      try {
        const rawData = fs.readFileSync(sourcePath, "utf8");
        let newsArray = JSON.parse(rawData);

        // Sort Newest First
        newsArray.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Deduplicate by hash
        const uniqueNews = newsArray.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.hash === item.hash),
        );

        const processedSummary = uniqueNews.map((item) => {
          const dateObj = new Date(item.date);
          const year = dateObj.getFullYear().toString();
          const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");

          const targetDir = path.resolve(
            srcDir,
            this.postsBaseDir,
            year,
            month,
          );
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          const fileName = `${item.hash}.json`;
          const filePath = path.join(targetDir, fileName);

          const postContent = {
            content: {
              hero: {
                generatehero: true,
                image: "https://siteimages.gmfc.uk/hero/hero-plane.jpg",
                text: item.title,
                weatherCoordinates: {
                  latitude: 51.459563,
                  longitude: -2.790968,
                },
              },
              sections: item.items || [],
              meta: {
                imagesticker: item.imagesticker || null,
                showhide: item.showhide ?? true,
                type: item.type || "wrappedTextLeft",
                image:
                  item.image ||
                  "https://siteimages.gmfc.uk/hero/hero-plane.jpg",
                date: item.date,
                title:item.title,
              },
            },
          };

          const postJson = JSON.stringify(postContent, null, 2);

          if (
            !fs.existsSync(filePath) ||
            fs.readFileSync(filePath, "utf8") !== postJson
          ) {
            fs.writeFileSync(filePath, postJson);
          }

          return {
            title: item.title,
            date: item.date,
            hash: item.hash,
            image: item.image,
            link: `/${year}/${month}/${fileName}`,
          };
        });

        const summaryJson = JSON.stringify(processedSummary, null, 2);
        if (
          !fs.existsSync(outputPath) ||
          fs.readFileSync(outputPath, "utf8") !== summaryJson
        ) {
          fs.writeFileSync(outputPath, summaryJson);
          console.log(
            `[ProcessNewsSeperatedPlugin] Split ${processedSummary.length} posts into date folders.`,
          );
        }
      } catch (err) {
        console.error(
          "[ProcessNewsSeperatedPlugin] Error processing news JSON:",
          err,
        );
      }
    });
  }
}

module.exports = ProcessNewsSeperatedPlugin;
