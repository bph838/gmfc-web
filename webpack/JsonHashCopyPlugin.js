const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

class JsonHashCopyPlugin {
  constructor(options) {
    this.inputDir = options.inputDir;
    this.outputDir = options.outputDir;
  }

  apply(compiler) {
    compiler.hooks.environment.tap("JsonHashCopyPlugin", () => {
      const srcDir = path.resolve(compiler.context, "");
      const inputPath = path.resolve(srcDir, this.inputDir);
      const outputPath = path.resolve(srcDir, this.outputDir);

      if (!fs.existsSync(inputPath)) {
        console.warn(`[JsonHashCopyPlugin] Input directory not found: ${inputPath}`);
        return;
      }

      if (fs.existsSync(outputPath)) {
        fs.rmSync(outputPath, { recursive: true, force: true });
      }
      fs.mkdirSync(outputPath, { recursive: true });

      const files = fs.readdirSync(inputPath).filter((f) => {
        return f.endsWith(".json") && !f.startsWith("_");
      });

      let processed = 0;
      const index = [];

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      files.forEach((file) => {
        const filePath = path.join(inputPath, file);

        try {
          const raw = fs.readFileSync(filePath, "utf8");
          const data = JSON.parse(raw);

          let expiryDate = null;
          if (data.date && data.period != null) {
            const expiry = new Date(data.date);
            expiry.setDate(expiry.getDate() + Number(data.period));
            expiryDate = expiry.toISOString().split("T")[0];
            if (now > expiry) {
              console.log(`[JsonHashCopyPlugin] Skipping expired: ${file}`);
              return;
            }
          }

          const hashSource = `${data.date || ""}${data.title || ""}`;
          const hash = crypto.createHash("md5").update(hashSource).digest("hex");

          const enriched = { ...data, hash };
          const outJson = JSON.stringify(enriched, null, 2);
          const outFile = path.join(outputPath, `${hash}.json`);

          fs.writeFileSync(outFile, outJson);

          index.push({ hash, title: data.title || null, expires: expiryDate });
          processed++;
        } catch (err) {
          console.error(`[JsonHashCopyPlugin] Error processing ${file}:`, err.message);
        }
      });

      fs.writeFileSync(path.join(outputPath, "_index.json"), JSON.stringify(index, null, 2));

      console.log(`[JsonHashCopyPlugin] Processed ${processed} of ${files.length} files → ${outputPath}`);
    });
  }
}

module.exports = JsonHashCopyPlugin;
