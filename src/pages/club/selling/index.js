import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import {
  renderSection,
  renderSectionNoImage,
  renderSellingGallery,
} from "@components/section";
import {
  createDiv,
  fetchContextArea,
  renderFinish,
  createOrderedList,
  createListItem,
  createParagraph,
  createLink,
} from "@framework/dom";
import { fetchJson } from "@framework/utils";

import data from "@data/pages/club/selling/selling.json";
import menu from "@data/generated/menu.json";

const externalPath = data.externalPath;
const params = Object.fromEntries(
  window.location.hash
    .slice(1)
    .split("&")
    .map((p) => p.split("=")),
);
console.log(params.lot);

setupMenuCommands("page-clubselling", menu);
if (params.lot) renderClubSellingLot(data, params.lot);
else renderClubSelling(data);
renderFinish();

function renderClubSelling(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");
  data.content.sections?.forEach((section) => {
    console.log(section);
    renderSection(sectionsdiv, section);
  });

  const salediv = createDiv(sectionsdiv, "section-sales");

  //need to read _index.json
  let saleUrl = "/data/pages/club/selling/generated/_index.json";
  fetchJson(saleUrl).then((selling_items) => {
    let itemsFound = false;
    if (selling_items) {
      selling_items.forEach((item) => {
        const hash = item.hash;
        const title = item.title;
        const expires = new Date(item.expires);
        const now = new Date();
        if (expires >= new Date()) {
          itemsFound = true;
          const sellDiv = createDiv(salediv, "selling_item");
          const href = `/club/selling/index.html#lot=${hash}`;
          createLink(sellDiv, href, null, title, "_self");
        }
      });
    }

    if (!itemsFound) {
      createParagraph(salediv, "There are no items to list at the moment");
    }
  });

  
}

function renderClubSellingLot(data, lotHash) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");

  let saleUrl = `/data/pages/club/selling/generated/${lotHash}.json`;
  fetchJson(saleUrl).then((selling_item) => {
    if (selling_item.title) {
      let heroTitleDiv = document.getElementById("container-h1");
      let heroTitle = heroTitleDiv.getElementsByTagName("h1")[0];
      let CurrentTitle = heroTitle.textContent;
      heroTitle.textContent = `${CurrentTitle} - ${selling_item.title}`;
    }

    console.log("Processing selling item: ");
    console.log(selling_item);

    const textdiv = createDiv(sectionsdiv, "section");
    renderSectionNoImage(textdiv, selling_item);

    const gallerytdiv = createDiv(sectionsdiv, "section");
    renderSellingGallery(gallerytdiv, selling_item.images, externalPath);
  });
}
