const fs = require("fs");
const path = require("path");

class NewsArchivePlugin {
  constructor(options = {}) {
    this.input = options.input;
    this.output = options.output || "news";
    this.writeToDisk = options.writeToDisk || false;
    this.verbose = options.verbose ?? true;
  }

  log(msg) {
    if (this.verbose) console.log(`[NewsArchivePlugin] ${msg}`);
  }

  apply(compiler) {
    const pluginName = "NewsArchivePlugin";

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      const { Compilation, sources } = compiler.webpack;

      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        () => {
          const inputPath = path.resolve(this.input);

          this.log(`Reading: ${inputPath}`);

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

          const writeJson = (relPath, data) => {
            const json = JSON.stringify(data, null, 2);

            if (this.writeToDisk) {
              // REAL filesystem write (works for src)
              const fullPath = path.resolve(relPath);

              fs.mkdirSync(path.dirname(fullPath), { recursive: true });
              fs.writeFileSync(fullPath, json);

              this.log(`Wrote → ${fullPath} (${data.length} items)`);
            } else {
              // normal webpack emit (dist)
              compilation.emitAsset(relPath, new sources.RawSource(json));

              const fullPath = path.resolve(
                compiler.options.output.path,
                relPath
              );

              this.log(`Emitted → ${fullPath} (${data.length} items)`);
            }
          };

          // years
          for (const [year, data] of byYear) {
            writeJson(path.join(this.output, year, "news.json"), data);
          }

          // months
          for (const [ym, data] of byMonth) {
            writeJson(path.join(this.output, ym, "news.json"), data);
          }

          this.log("Done");
        }
      );
    });
  }
}

module.exports = NewsArchivePlugin;