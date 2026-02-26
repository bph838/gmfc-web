const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class ProcessAlertsPlugin {
  constructor(options) {
    this.sourceFile = options.sourceFile || 'alerts.json';
    this.outputFile = options.outputFile || 'alerts-processed.json';
  }

  apply(compiler) {
    compiler.hooks.environment.tap('ProcessAlertsPlugin', () => {
      const srcDir = path.resolve(compiler.context, '');
      const sourcePath = path.resolve(srcDir, this.sourceFile);
      const outputPath = path.resolve(srcDir, this.outputFile);

      if (!fs.existsSync(sourcePath)) {
        console.warn(`[ProcessAlertsPlugin] Source not found: ${sourcePath}`);
        return;
      }

      try {
        const rawData = fs.readFileSync(sourcePath, 'utf8');
        const data = JSON.parse(rawData);

        // Process each alert to add the hash
        const processedAlerts = data.alerts.map(alert => {
          // Combine the fields: date_from + date_to + title
          const hashString = `${alert.date_from}${alert.date_to}${alert.title}`;
          
          // Generate MD5 hash
          const hash = crypto
            .createHash('md5')
            .update(hashString)
            .digest('hex');

          return {
            ...alert,
            hash: hash
          };
        });

        const outputContent = JSON.stringify({ alerts: processedAlerts }, null, 2);

        // Avoid unnecessary writes to prevent Webpack watch loops
        if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, 'utf8') !== outputContent) {
          fs.writeFileSync(outputPath, outputContent);
          console.log(`[ProcessAlertsPlugin] Generated ${this.outputFile} with unique hashes.`);
        }
      } catch (err) {
        console.error('[ProcessAlertsPlugin] Error processing alerts:', err);
      }
    });
  }
}

module.exports = ProcessAlertsPlugin;