import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { fetchContextArea, createDiv, renderFinish } from "@framework/dom";
import {
  fetchJson,
  setPageTitle,
  setMeta,
  isAbsoluteUrl,
} from "@framework/utils";
const { SITE_TITLE, SITE_ADDRESS } = require("@components/constants");
import data from "@data/pages/news.json";

const newsItemUrl = "news";

setupMenuCommands("page-news");
console.log("Rending news");
renderNews(data);

function renderNews(data) {
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");

  if (window.MY_NEWS_ITEM && window.MY_NEWS_ITEM.json) {
    let jsonUrl = window.MY_NEWS_ITEM.json;
    renderSingleNewsItem(sectionsdiv, jsonUrl);
  } else {
    const newUrl = data.newsUrl;

    fetchJson(newUrl)
      .then((news_items) => {
        news_items.forEach((news_section) => {
          const newholderdiv = createDiv(sectionsdiv);
          fetchNews(newholderdiv, news_section);
        });
      })
      .then(renderFinish());
  }
}

function fetchNews(parent, news_section) {
  console.log("Fetching news: ");
  console.log(news_section);
  const url = news_section.url;
  const urlJson = news_section.urlJson;
  if (!urlJson || !url) return;
  renderNewsItem(parent, urlJson, url);
}

function renderNewsItem(parent, urlJson, url) {
  console.log("Fetching news item: ");
  fetchJson(urlJson).then((news) => {
    console.log("Processing news: ");
    console.log(news);
    let showhide = news.showhide ?? true;
    if (showhide) renderSection(parent, news, url, "sectionline", {}, true);
  });
}

function renderSingleNewsItem(parent, urlJson) {
  console.log("Fetching news item: ");
  urlJson = "\\" + urlJson;
  fetchJson(urlJson).then((news) => {
    console.log("Processing news: ");
    console.log(news);
    renderSection(parent, news, "", "sectionline", {}, true);
    renderFinish();
  });
}
