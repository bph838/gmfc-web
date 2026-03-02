// ExcelToCsvAndJsonPlugin.js
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

class ExcelToCsvAndJsonPlugin {
  /**
   * @param {Object} options
   * @param {string} options.input - Path to the Excel file
   * @param {string} options.sheetName - Sheet name to convert
   * @param {string} options.csvOutput - Path to save CSV file
   * @param {string} options.jsonOutput - Path to save JSON file
   
   */
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.afterCompile.tapAsync(
      "ExcelToCsvAndJsonPlugin",
      (compilation, callback) => {
        const { input, sheetName, csvOutput, jsonOutput, mode } = this.options;

        if (!mode) return callback();

        if (!fs.existsSync(input)) {
          compilation.errors.push(new Error(`Excel file not found: ${input}`));
          return callback();
        }

        try {
          // 1. Read Excel
          const workbook = XLSX.readFile(input);

          if (!workbook.SheetNames.includes(sheetName)) {
            compilation.errors.push(
              new Error(`Sheet "${sheetName}" not found in ${input}`),
            );
            return callback();
          }

          const worksheet = workbook.Sheets[sheetName];

          // 2. Convert to CSV
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          const csvPath = path.resolve(process.cwd(), csvOutput);
          fs.mkdirSync(path.dirname(csvPath), { recursive: true });
          fs.writeFileSync(csvPath, csv, "utf8");
          console.log(`[ExcelToCsvAndJsonPlugin] Saved CSV: ${csvPath}`);

          // 3. Convert CSV to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            defval: null,
          });
          const jsonPath = path.resolve(process.cwd(), jsonOutput);
          fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
          fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), "utf8");
          console.log(`[ExcelToCsvAndJsonPlugin] Saved JSON: ${jsonPath}`);
        } catch (err) {
          compilation.errors.push(err);
        }

        callback();
      },
    );
  }
}

module.exports = ExcelToCsvAndJsonPlugin;
