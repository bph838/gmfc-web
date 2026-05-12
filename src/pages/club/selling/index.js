import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
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

setupMenuCommands("page-clubselling", menu);
renderClubSelling(data);
renderFinish();

function renderClubSelling(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");

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
          const sellDiv = createDiv(sectionsdiv, "selling_item");
          const href = `/club/selling/index.html#item=${hash}`;
          createLink(sellDiv, href, null, title);
        }
      });
    }

    if (!itemsFound) {
      createParagraph(sectionsdiv, "There are no items to list at the moment");
    }
  });

  /*
  data.content.sections?.forEach((section) => {
    console.log(section);
    renderSection(sectionsdiv, section);
  });*/
}
