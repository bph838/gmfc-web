// Add .Prerenderer to the end of the require
const Prerenderer =
  require("@prerenderer/prerenderer").Prerenderer ||
  require("@prerenderer/prerenderer");
const PuppeteerRenderer = require("@prerenderer/renderer-puppeteer");
const path = require("path");
const fs = require("fs");

async function run() {
  const distPath = path.join(__dirname, "dist");
  const newsOutput = "./src/data/news.json";
  const newsData = JSON.parse(fs.readFileSync(newsOutput, "utf8"));
  const menuOutput = "./src/data/generated/menu.json";
  const menuData = JSON.parse(fs.readFileSync(menuOutput, "utf8"));

  // Change 'render' to 'renderRoutes'
  const routes = [
    "/index.html",
    "/calendar.html",
    "/aboutus.html",
    "/gallery.html",
    "/news.html",
    "/club/history.html",
    "/club/rules.html",
    "/club/merch.html",
    "/club/leaderboard.html",
    "/club/weather.html",
  ];

  newsData.forEach((element) => {
    if (element.url) {
      let newsUrl = element.url + ".html";
      routes.push(newsUrl);
    }
  });

  menuData.forEach((year) => {
    let newsUrl = `/news/${year.year}/index.html`;
    routes.push(newsUrl);

    year.months.forEach((month) => {
      let formattedMonth = month.month.toString().padStart(2, "0");
      let newsUrl = `/news/${year.year}/${formattedMonth}/index.html`;
      routes.push(newsUrl);
    });
  });

  const prerenderer = new Prerenderer({
    staticDir: distPath,
    renderer: new PuppeteerRenderer({
      renderAfterDocumentEvent: "render-event",
      headless: false,
      timeout: 120000,
      maxConcurrentRoutes: 4,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    }),
  });

  console.log("🚀 Starting Prerenderer...");

  await prerenderer.initialize();

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
