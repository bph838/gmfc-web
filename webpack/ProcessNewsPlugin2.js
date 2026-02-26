const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class ProcessNewsPlugin2 {
  constructor(options) {
    this.sourceFile = options.sourceFile || 'news.json';    
    this.postsFolderName = options.postsFolderName || 'posts';
  }

  apply(compiler) {
    compiler.hooks.environment.tap('ProcessNewsPlugin2', () => {
      const srcDir = path.resolve(compiler.context, '');
      const sourcePath = path.resolve(srcDir, this.sourceFile);
      const postsDir = path.resolve(srcDir, this.postsFolderName);
      
      if (!fs.existsSync(sourcePath)) return;

      if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir, { recursive: true });
      }

      try {
        const rawData = fs.readFileSync(sourcePath, 'utf8');
        let newsArray = JSON.parse(rawData);

        // 1. Sort by date (Newest First)
        newsArray.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 2. Deduplicate by hash (Keep first occurrence)
        const uniqueNews = newsArray.filter((item, index, self) =>
          index === self.findIndex((t) => t.hash === item.hash)
        );

        const processedSummary = uniqueNews.map(item => {
          const hash = item.hash;
          const fileName = `${hash}.json`;

          // 3. Create the specific structure you requested
          const postContent = {
            "content": {
              "hero": {
                "generatehero": true,
                "image": item.image || "https://siteimages.gmfc.uk/hero/hero-plane.jpg",
                "text": item.title,
                "weatherCoordinates": {
                  "latitude": 51.459563,
                  "longitude": -2.790968
                }
              },
              "sections": item.items || []
            }
          };

          const postFilePath = path.join(postsDir, fileName);
          const postJson = JSON.stringify(postContent, null, 2);

          // Only write individual file if changed
          if (!fs.existsSync(postFilePath) || fs.readFileSync(postFilePath, 'utf8') !== postJson) {
            fs.writeFileSync(postFilePath, postJson);
          }

          return {
            title: item.title,
            date: item.date,
            hash: hash,
            image: item.image,
            link: `/${this.postsFolderName}/${fileName}`
          };
        });

        // 4. Save main summary list to src/
        const summaryJson = JSON.stringify(processedSummary, null, 2);
        /*
        if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, 'utf8') !== summaryJson) {
          fs.writeFileSync(outputPath, summaryJson);
          console.log(`[ProcessNewsPlugin2] Processed ${processedSummary.length} unique news posts.`);
        }*/

      } catch (err) {
        console.error('[ProcessNewsPlugin2] Error processing news JSON:', err);
      }
    });
  }
}

module.exports = ProcessNewsPlugin2;