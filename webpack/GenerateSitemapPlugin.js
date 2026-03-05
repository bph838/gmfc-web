const fs = require("fs").promises;
const path = require("path");

class GenerateSitemapPlugin {
  constructor(options = {}) {
    this.input = options.input; // src/data/pages.json
    this.output = options.output || "src/sitemap.xml";
    this.siteUrl = options.siteUrl || "";
  }

  apply(compiler) {
    compiler.hooks.beforeCompile.tapPromise(
      "GenerateSitemapPlugin",
      async () => {
        const logger = compiler.getInfrastructureLogger(
          "GenerateSitemapPlugin",
        );

        try {
          const jsonPath = path.resolve(compiler.context, this.input);
          const outputPath = path.resolve(compiler.context, this.output);

          logger.info(`Reading ${jsonPath}`);

          const raw = await fs.readFile(jsonPath, "utf8");
          const data = JSON.parse(raw);

          //process pages first

          if (!Array.isArray(data.pages) || !Array.isArray(data.news)) {
            logger.warn("No pages found");
            return;
          }

          const urls = [];

          for (const p of data.pages) {
            let loc;

            if (p.url) {
              if (p.url.startsWith("@/")) {
                loc = this.siteUrl + p.url.slice(1);
              } else {
                loc = p.url;
              }
            } else {
              loc = this.siteUrl + "/" + p.page;
            }

            urls.push(`
  <url>
    <loc>${loc}</loc>
    ${p.date ? `<lastmod>${p.date}</lastmod>` : ""}
  </url>`);
          }

          for (const p of data.news) {
            let loc;

            loc = this.siteUrl +  p.url;

            urls.push(`
  <url>
    <loc>${loc}</loc>
    ${p.date ? `<lastmod>${p.date}</lastmod>` : ""}
  </url>`);
          }

          const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

          await fs.writeFile(outputPath, sitemap);

          logger.info(`Wrote sitemap → ${outputPath} (${urls.length} urls)`);
        } catch (err) {
          console.error(err);
          throw err;
        }
      },
    );
  }
}

module.exports = GenerateSitemapPlugin;
