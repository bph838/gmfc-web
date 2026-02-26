const path = require("path");
const fs = require("fs");

class UpdateStaticJsonPlugin {
  constructor(options) {
    this.filename = options.filename;
    this.jdblocation = options.jdblocation;

    this.filename = this.filename.replace("@data","./src/data");
    this.jdblocation = this.jdblocation.replace("@jdbpages","./src/data/pages");
  }

  apply(compiler) {
    compiler.hooks.environment.tap("UpdateStaticJsonPlugin", () => {
      // Look for the file in the /src directory relative to the project root
      const filePath = path.resolve(compiler.context, "", this.filename);

      if (!fs.existsSync(filePath)) return;

      try {
        const rawData = fs.readFileSync(filePath, "utf8");
        const data = JSON.parse(rawData);
        let hasChanged = false;

        data.pages.forEach((page) => {
          if (page.datetype === "filemodified" && page.jdb) {
            // Looking for jdb files inside /src
            let jdb = page.jdb;
            jdb = jdb.replace("@jdbpages", this.jdblocation);
            const targetFilePath = path.resolve(compiler.context, "", jdb);

            if (fs.existsSync(targetFilePath)) {
              const stats = fs.statSync(targetFilePath);
              const newDate = stats.mtime.toISOString();

              if (page.date_modified !== newDate) {
                page.date_modified = newDate;
                hasChanged = true;
              }
            }
          }
        });

        if (hasChanged) {
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          console.log(
            `[UpdateStaticJsonPlugin] Updated dates in ${this.filename}`,
          );
        }
      } catch (err) {
        console.error("[UpdateStaticJsonPlugin] Error:", err);
      }
    });
  }
}

// Crucial: Export the class
module.exports = UpdateStaticJsonPlugin;
