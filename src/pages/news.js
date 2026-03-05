import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import {
  fetchContextArea,
  createDiv,
  renderFinish,
  createOrderedList,
  createListItem,
} from "@framework/dom";
import {
  fetchJson,
  setPageTitle,
  setMeta,
  isAbsoluteUrl,
  getLongMonthName,
} from "@framework/utils";
const { SITE_TITLE, SITE_ADDRESS } = require("@components/constants");

import data from "@data/pages/news.json";
import menu from "@data/generated/menu.json";

const newsItemUrl = "news";

setupMenuCommands("page-news",menu);
console.log("Rending news");
renderNews(data);

function renderNews(data) {
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");

  if (
    window.MY_NEWS_ITEM &&
    window.MY_NEWS_ITEM.json &&
    window.MY_NEWS_ITEM.year === "0" &&
    window.MY_NEWS_ITEM.month === "0"
  ) {
    let jsonUrl = window.MY_NEWS_ITEM.json;
    renderSingleNewsItem(sectionsdiv, jsonUrl);
  } else if (
    window.MY_NEWS_ITEM &&
    window.MY_NEWS_ITEM.json &&
    (window.MY_NEWS_ITEM.year !== "0" || window.MY_NEWS_ITEM.month !== "0")
  ) {
    const newUrl = window.MY_NEWS_ITEM.json;
    //const newholderdiv = createDiv(sectionsdiv);
    if (window.MY_NEWS_ITEM.year && window.MY_NEWS_ITEM.month !== "0") {
      renderNewsBreadline(
        sectionsdiv,
        window.MY_NEWS_ITEM.year,
        window.MY_NEWS_ITEM.month,
        "month",
      );
    } else if (window.MY_NEWS_ITEM.year && window.MY_NEWS_ITEM.month === "0") {
      renderNewsBreadline(sectionsdiv, window.MY_NEWS_ITEM.year, 0, "year");
    }

    fetchJson(newUrl)
      .then((news_items) => {
        news_items.forEach((news_section) => {
          fetchNews(
            sectionsdiv,
            news_section,
            window.MY_NEWS_ITEM.year,
            window.MY_NEWS_ITEM.month,
          );
        });
      })
      .then(renderFinish());
  } else {
    const newUrl = data.newsUrl;
    
    renderNewsBreadline(sectionsdiv, 0, 0, "none");
    fetchJson(newUrl)
      .then((news_items) => {
        news_items.forEach((news_section) => {
          fetchNews(sectionsdiv, news_section);
        });
      })
      .then(renderFinish());
  }
}

function fetchNews(parent, news_section, year = null, month = null) {
  console.log("Fetching news: ");
  console.log(news_section);
  const url = news_section.url;
  const urlJson = news_section.urlJson;
  if (!urlJson || !url) return;
  renderNewsItem(parent, urlJson, url);
}

function renderNewsItem(parent, urlJson, url) {
  console.log("Fetching news item: ");
  const newholderdiv = createDiv(parent);
  fetchJson(urlJson).then((news) => {
    console.log("Processing news: ");
    console.log(news);
    let showhide = news.showhide ?? true;
    if (showhide) renderSection(newholderdiv, news, url, "sectionline", {}, true);
  });
}

function renderSingleNewsItem(parent, urlJson) {
  console.log("Fetching news item: ");
  urlJson = "\\" + urlJson;
  fetchJson(urlJson).then((news) => {
    console.log("Processing news: ");
    console.log(news);
    const date = new Date(news.date);

    let year = date.getUTCFullYear();
    let month = date.getUTCMonth() + 1;

    renderNewsBreadline(parent, year, month);
    renderSection(parent, news, "", "sectionline", {}, true);
    renderFinish();
  });
}

function renderNewsBreadline(parent, year, monthd, type = "yearmonth") {
  let month = monthd.toString().padStart(2, "0");
  let elNav = document.createElement("nav");
  elNav.setAttribute("aria-label", "breadcrumb");
  parent.appendChild(elNav);

  //http://localhost:8080/news/2026/02/car-park-fence-replacement
  let homeUrl = ""; //http://localhost:8080";
  let newsUrl = homeUrl + "/news/";
  let newsYearUrl = newsUrl + `${year}/`;
  let newsYearMonthUrl = newsYearUrl + `${month}/`;

  let ol = createOrderedList(elNav, "breadcrumb section");
  //createListItem(ol, "breadcrumb-item", `<a href="${homeUrl}">Home</a>`);
  switch (type) {
    case "yearmonth":
      createListItem(ol, "breadcrumb-item", `<a href="${newsUrl}">News</a>`);
      createListItem(
        ol,
        "breadcrumb-item",
        `<a href="${newsYearUrl}">${year}</a>`,
      );
      createListItem(
        ol,
        "breadcrumb-item",
        `<a href="${newsYearMonthUrl}">${getLongMonthName(month)}</a>`,
      );
      break;
    case "year":
      createListItem(ol, "breadcrumb-item", `<a href="${newsUrl}">News</a>`);
      createListItem(
        ol,
        "breadcrumb-item",
        `<a href="${newsYearUrl}">${year}</a>`,
      );
      break;
    case "month":
      createListItem(ol, "breadcrumb-item", `<a href="${newsUrl}">News</a>`);
      createListItem(
        ol,
        "breadcrumb-item",
        `<a href="${newsYearUrl}">${year}</a>`,
      );
      createListItem(
        ol,
        "breadcrumb-item",
        `<a href="${newsYearMonthUrl}">${getLongMonthName(month)}</a>`,
      );
      break;
    case "none":      
      createListItem(ol, "breadcrumb-item", `<a href="${newsUrl}">News</a>`);
      break;
  }
}
