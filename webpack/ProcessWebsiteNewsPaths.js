const path = require("path");
const fs = require("fs");

class ProcessWebsiteNewsPaths {
  constructor(options) {
    this.newsSource = options.newsSource || "news-processed.json";
    this.siteSource = options.siteSource || "static.json";
    this.outputFile = options.outputFile || "site.json";
    this.newsOutput = options.newsOutput || "news.json";
  }

  apply(compiler) {
    compiler.hooks.environment.tap("ProcessWebsiteNewsPaths", () => {
      const srcDir = path.resolve(compiler.context, "");
      const newsPath = path.resolve(srcDir, this.newsSource);
      const sitePath = path.resolve(srcDir, this.siteSource);
      const outputPath = path.resolve(srcDir, this.outputFile);
      const newsOutput = path.resolve(srcDir, this.newsOutput);

      if (!fs.existsSync(newsPath) || !fs.existsSync(sitePath)) {
        console.warn("[ProcessWebsiteNewsPaths] Missing source files.");
        return;
      }

      try {
        const newsData = JSON.parse(fs.readFileSync(newsPath, "utf8"));
        const siteData = JSON.parse(fs.readFileSync(sitePath, "utf8"));

        // 1. Transform the news items into the website path format
        const newsPaths = newsData.map((item) => {
          // Parse date for URL structure
          const dateObj = new Date(item.date);
          const year = dateObj.getFullYear();
          const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");

          //const urlJson = `/news/${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${sanitizeString(item.title)}`;
          const urlJson = `\\data/generated/${year}/${month}/${sanitizeString(item.hash)}.json`;

          return {
            title: `${item.title}`,
            // The template used for news posts
            page: `/news/${year}/${month}/${sanitizeString(item.title)}.html`,
            // The public URL matching your folder structure 
            url: `/news/${year}/${month}/${sanitizeString(item.title)}`,
            keywords:
              "Gordano Model Flying Club, News, RC Club updates, " + item.title,
            description: `Latest news from Gordano Model Flying Club: ${item.title}`,
            chunks: "news",
            date: new Date(item.date).toISOString(),
            year: year,
            month: month,
            hash: item.hash,
            image: item.image,
            urlJson: urlJson,
            // Reference to the actual JSON data file
            //dataSource: `@/posts/${year}/${month}/${item.hash}.json`,
          };
        });

        const newsDetails = newsData.map((item) => {
          // Parse date for URL structure
          const dateObj = new Date(item.date);
          const year = dateObj.getFullYear();
          const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
          const urlJson = `\\data/generated/${year}/${month}/${sanitizeString(item.hash)}.json`;
          return {
            //title: `${item.title}`, //not required - just for debugging
            url: `\\news/${year}/${month}/${sanitizeString(item.title)}`,
            date: new Date(item.date).toISOString(),
            hash: item.hash,
            urlJson: urlJson,
          };
        });

        // 2. Add the news array to the site data
        siteData.news = newsPaths;

        // 3. Write to site.json
        const outputContent = JSON.stringify(siteData, null, 2);

        // 4. Write to news.json
        const newsContent = JSON.stringify(newsDetails, null, 2);

        if (
          !fs.existsSync(outputPath) ||
          fs.readFileSync(outputPath, "utf8") !== outputContent
        ) {
          fs.writeFileSync(outputPath, outputContent);
          console.log(
            `[ProcessWebsiteNewsPaths] Site details injected ${siteData.length} news paths into ${this.outputFile}`,
          );
        }

        if (
          !fs.existsSync(newsOutput) ||
          fs.readFileSync(newsOutput, "utf8") !== newsContent
        ) {
          fs.writeFileSync(newsOutput, newsContent);
          console.log(
            `[ProcessWebsiteNewsPaths] News details injected ${newsPaths.length} news paths into ${this.newsOutput}`,
          );
        }
      } catch (err) {
        console.error("[ProcessWebsiteNewsPaths] Error:", err);
      }
    });
  }
}

function sanitizeString(str) {
  if (typeof str !== "string") return "";
  // Replace anything that is NOT a letter or number with empty string
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
module.exports = ProcessWebsiteNewsPaths;
