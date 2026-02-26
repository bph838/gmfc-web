import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { fetchContextArea, createDiv } from "@framework/dom";
import {
  fetchJson,
  setPageTitle,
  setMeta,
  isAbsoluteUrl,
} from "@framework/utils";
const { SITE_TITLE, SITE_ADDRESS } = require("@components/constants");

const newsUrl = "/data/pages/news.json";
const newsItemUrl = "news";

setupMenuCommands("page-news");
console.log("Rending news");
if (window.MY_NEWS_ITEM && window.MY_NEWS_ITEM.hash) {
  let hash = window.MY_NEWS_ITEM.hash;
  let jsonUrl = `/data/newsitems/${hash}.json`;
  renderNewsItem(jsonUrl);
} else {
  renderNews(newsUrl);
}

function renderNews(url) {
  fetchJson(url).then((data) => {
    console.log(`Looking for news ${url}`);

    if (!data) {
      console.log("No news to render");
    } else {
      renderClubNews(data);
    }
  });
}

function renderClubNews(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");

  //render the news
  if (data.content.sections && data.content.sections.length > 0) {
    const newsSections = data.content.sections;
    newsSections.sort(
      (a, b) =>
        new Date(b.date.replace(" ", "T")) - new Date(a.date.replace(" ", "T")),
    );

    data.content.sections.forEach((section) => {
      console.log("Check show hide");
      let showhide = section.showhide ?? true;
      if (showhide)
        renderSection(sectionsdiv, section, newsItemUrl, "sectionline");
    });
  }
}

function renderNewsItem(jsonUrl) {
  fetchJson(jsonUrl).then((data) => {
    console.log(`Looking for news ${jsonUrl}`);
    if (!data) {
    } else {
      // Render the news
      renderClubNews(data);
      if (data.content.sections.length === 1)
        setDiscoverables(data.content.sections[0]);
    }
  });
}

function setDiscoverables(data) {
  console.log("setDiscoverables");
  if (data.title) {
    setPageTitle(SITE_TITLE + " - " + data.title);
  }

  if (data.image) {
    let url = "";
    if (isAbsoluteUrl(data.image)) url = data.image;
    else url = SITE_ADDRESS + data.image;
    console.log("seting og:image");
    setMeta("og:image", url);
  }

  if (data.text) {
    let description = "";
    data.text.forEach((text) => {
      description += text;
    });
    setMeta("og:description", description);
  }
}
