// Add .Prerenderer to the end of the require
const Prerenderer =
  require("@prerenderer/prerenderer").Prerenderer ||
  require("@prerenderer/prerenderer");
const PuppeteerRenderer = require("@prerenderer/renderer-puppeteer");
const path = require("path");
const fs = require("fs");

async function run() {
  const distPath = path.join(__dirname, "dist");

  const prerenderer = new Prerenderer({
    staticDir: distPath,
    renderer: new PuppeteerRenderer({
      renderAfterDocumentEvent: "render-event",
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    }),
  });

  console.log("🚀 Starting Prerenderer...");

  await prerenderer.initialize();

  // Change 'render' to 'renderRoutes'
  const routes = [
    "/index.html",
    "/calendar.html",
    "/aboutus.html",
    "/gallery.html",
    "/club/history.html",
    "/club/rules.html",
    "/club/merch.html",
    "/club/leaderboard.html",
    "/club/weather.html",
  ];
  
  const renderedRoutes = await prerenderer.renderRoutes(routes); // <--- Fix is here

  for (const route of renderedRoutes) {
    // Note: in the core library, the property is route.html or route.content
    // and the path is route.route
    const outputPath = path.join(distPath, route.route);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, route.html);
    console.log(`✅ Prerendered: ${route.route}`);
  }

  await prerenderer.destroy();
  console.log("🏁 All done!");
}

run().catch(console.error);
