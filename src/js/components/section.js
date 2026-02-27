import {
  createDiv,
  createSection,
  createH2,
  createSpan,
  createLink,
  createImage,
  createParagraph,
  createOrderedList,
  createListItem,
} from "@framework/dom";
import { initaliseCarousel, onRotate } from "@framework/carousel3d";
import { sanitizeString } from "@framework/utils";
import { fetchAndRenderWeatherForecast } from "@components/weatherforcast";

export function renderSection(
  parent,
  data,
  pageurl = "",
  extraclass = "",
  extraData = {},
  isNews = false,
) {
  if (!data) {
    console.error("There is no data to render");
    return;
  }
  if (!data.type) {
    console.error("There is no section type to render");
    return;
  }

  if (process.env.NODE_ENV === "development") {
    if (data.title) {
      console.log(`Rendering Section ${data.title}`);
    }
  }

  let id = "";
  if (data.id) id = data.id;

  let section = createSection(parent, "rawsection", id);

  let section_inner = null;
  if (data.customsection) {
    section_inner = createDiv(
      section,
      data.customsection + " sectionbreak " + extraclass,
      id,
    );
  } else {
    section_inner = createDiv(
      section,
      "section sectionbreak " + extraclass,
      id,
    );
  }

  const contentdiv = createDiv(section_inner, "section_content");

  //render title
  if (data.title) {
    const titlediv = createDiv(contentdiv, "section_title");
    const titleText = createH2(titlediv, data.title);
  }

  //check if for news updates

  //render header
  if (data.date) {
    const date = new Date(data.date);
    const text = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);

    const headerdiv = createDiv(contentdiv, "section_header");
    createSpan(headerdiv, "section_date", text);

    console.log("a");
    //a link can be added with a hash as the anchor
    if (data.hash && pageurl.length > 1) {
      const url = `/news/${date.getFullYear()}/${date.getMonth() + 1}/${sanitizeString(data.title)}`;
      section.id = url;
      createLink(
        headerdiv,
        url,
        "sectionlink",
        "<i class='fa-solid fa-link'></i>",
        "",
      );
    }
  }

  //check if it a news type render
  if (data.items) {
    console.log("Render news typ items");
    renderSectionItems(contentdiv, data);
  } else {
    let renderedDiv = null;
    switch (data.type) {
      default:
        console.error("Unable to render " + data.type);
        break;
      case "wrappedTextLeft":
        renderedDiv = renderWrappedTextLeftSection(contentdiv, data);
        break;
      case "noImage":
        renderedDiv = renderSectionNoImage(contentdiv, data);
        break;
      case "carousel":
        renderCarousel(contentdiv, data);
        break;
      case "imageLeft":
        renderedDiv = renderImageLeft(contentdiv, data);
        break;
      case "imageRight":
        renderedDiv = renderImageRight(contentdiv, data);
        break;
      case "imagesLeft":
        renderedDiv = renderImagesLeft(contentdiv, data);
        break;
      case "imagesRight":
        renderedDiv = renderImagesRight(contentdiv, data);
        break;
      case "pano":
        renderPanoImage(contentdiv, data);
        break;
      case "weatherForecast":
        fetchAndRenderWeatherForecast(contentdiv, data, extraData);
        break;
    }

    //If there are any pdf links to render
    renderPDFLinks(renderedDiv, data);
  }

  return section;
}

function renderWrappedTextLeftSection(parent, data) {
  if (!data.text || !data.image) {
    console.error("Unable to render renderSectionWrappedTextLeft");
    return;
  }

  let sticker = data.imagesticker ?? "none";

  const innerdiv = createDiv(parent, "section_inner_wrap_left");
  createImage(innerdiv, data.image);

  data.text.forEach((text) => {
    createParagraph(innerdiv, text);
  });

  renderSectionSticker(parent, sticker);

  return innerdiv;
}

export function renderPDFLinks(pageSection, data) {
  console.log("Checking for PDF links to render");
  if (data.pdfs && data.pdfs.length > 0) {
    const pdfsDiv = document.createElement("div");
    pdfsDiv.className = "pdfLinks";
    pageSection.appendChild(pdfsDiv);

    data.pdfs.forEach((pdf) => {
      const pdfDiv = document.createElement("div");
      pdfDiv.className = "pdfdoc";
      pdfsDiv.appendChild(pdfDiv);

      const pdfLink = document.createElement("a");
      pdfLink.href = pdf.url;
      pdfLink.target = "_blank";
      pdfDiv.appendChild(pdfLink);

      const imgPDF = document.createElement("img");
      imgPDF.src = "https://siteimages.gmfc.uk/icons/pdf.png";
      imgPDF.class = "pdfimage";
      pdfLink.appendChild(imgPDF);

      const spanPDF = document.createElement("span");
      spanPDF.innerHTML = pdf.text;
      spanPDF.class = "pdfimagedesc";
      pdfLink.appendChild(spanPDF);
    });
  }
}

function renderSectionNoImage(pageSection, data) {
  if (!data.text) {
    console.error("Unable to render renderSectionNoImage");
    return;
  }

  const sectiondiv = createDiv(pageSection, "sectionTextDiv");

  if (data.text.length >= 1) {
    data.text.forEach((text) => {
      createParagraph(sectiondiv, text);
    });
  }
  return sectiondiv;
}

function renderCarousel(pageSection, data) {
  if (!data.images) {
    console.error("Unable to render renderCarousel");
    return;
  }

  const carouseldiv = createDiv(pageSection, "carousel3D", "carousel3D");

  data.images.forEach((image) => {
    const carouselitemdiv = createDiv(carouseldiv, "element3D");
    let alt = "";
    if (image.alt) alt = image.alt;
    createImage(carouselitemdiv, image.src, "carouselImage", alt);
  });
  initaliseCarousel("carousel3D");
}

function renderImageLeft(parent, data) {
  if (!data.text || !data.image) {
    console.error("Unable to render renderImageLeft");
    return;
  }
  const innerdiv = createDiv(parent, "section_inner_image_left row");

  const leftdiv = createDiv(innerdiv, "section_left");
  createImage(leftdiv, data.image);

  const rightdiv = createDiv(innerdiv, "section_right col");
  data.text.forEach((text) => {
    createParagraph(rightdiv, text);
  });
  return innerdiv;
}

function renderImageRight(parent, data) {
  if (!data.text || !data.image) {
    console.error("Unable to render renderImageRight");
    return;
  }

  const innerdiv = createDiv(parent, "section_inner_image_right row");

  const leftdiv = createDiv(innerdiv, "section_left col");
  data.text.forEach((text) => {
    createParagraph(leftdiv, text);
  });

  const rightdiv = createDiv(innerdiv, "section_right");
  createImage(rightdiv, data.image);
  return innerdiv;
}

function createImages(parent, images) {
  images.forEach((image) => {
    createImage(parent, image.src);
  });
}

function addScriptToMakeAcive(className) {
  document.querySelectorAll(`.${className} img`).forEach((img) => {
    img.addEventListener("click", () => {
      document
        .querySelectorAll(`.${className} img`)
        .forEach((i) => i.classList.remove("active"));

      img.classList.add("active");
    });
  });
}

function renderImagesLeft(parent, data) {
  if (!data.text || !data.images) {
    console.error("Unable to render renderImagesLeft");
    return;
  }

  const innerdiv = createDiv(parent, "section_inner_images_row");

  const leftdiv = createDiv(innerdiv, "section_images_left");
  createImages(leftdiv, data.images);

  data.text.forEach((text) => {
    createParagraph(innerdiv, text);
  });

  addScriptToMakeAcive("section_images_left");
  return innerdiv;
}

function renderImagesRight(parent, data) {
  if (!data.text || !data.images) {
    console.error("Unable to render renderImagesLeft");
    return;
  }

  const innerdiv = createDiv(parent, "section_inner_images_row");

  const leftdiv = createDiv(innerdiv, "section_images_right");
  createImages(leftdiv, data.images);

  data.text.forEach((text) => {
    createParagraph(innerdiv, text);
  });

  addScriptToMakeAcive("section_images_right");
  return innerdiv;
}

function renderPanoImage(parent, data) {
  if (!data.image) {
    console.error("Unable to render pano image");
    return;
  }

  const pano_wrap = createDiv(parent, "pano-wrap");
  const pano = createImage(pano_wrap, data.image, "pano");

  window.addEventListener("scroll", () => {
    const maxScroll = document.body.scrollHeight - innerHeight;
    const percent = scrollY / maxScroll;

    pano.style.transform = `translateX(-${percent * (pano.scrollWidth - innerWidth)}px)`;
  });
}

function renderListItems(parent, items) {
  if (!parent || !items || items.length === 0) {
    return;
  }
  const list = createOrderedList(parent, "section_list");
  items.forEach((item) => {
    createListItem(list, "section_list_item", item);
  });
}

function renderSectionSticker(parent, sticker) {
  if (sticker == "none") return;
  let url = "";
  let from = "https://gmfc-images-siteimages.s3.eu-west-2.amazonaws.com";
  from = "https://siteimages.gmfc.uk";
  if (sticker == "cancelled") {
    url = from + "/stickers/cancelled.png";
  }
  const stickerDiv = createDiv(parent, "sticker");
  createImage(stickerDiv, url);
}

function renderSectionItems(parent, data) {
  console.log("YYY");
  let renderedDiv = null;
  switch (data.type) {
    default:
      console.error("Unable to render " + data.type);
      break;
    case "wrappedTextLeft":
      renderedDiv = renderWrappedTextLeftSectionNews(parent, data);
      break;
  }
  return renderedDiv;
}

function renderWrappedTextLeftSectionNews(parent, data) {
  if (!data.image) {
    console.error("Unable to render renderWrappedTextLeftSectionNews");
    return;
  }

  let sticker = data.imagesticker ?? "none";

  const innerdiv = createDiv(parent, "section_inner_wrap_left");
  createImage(innerdiv, data.image);

  data.items.forEach((item) => {
    renderSectionItem(innerdiv, item);
  });

  renderSectionSticker(parent, sticker);

  return innerdiv;
}

function renderSectionItem(parent, data) {
  switch (data.itemtype) {
    default:
      break;
    case "text":
      data.text.forEach((text) => {
        createParagraph(parent, text);
      });
      break;
    case "list":
      renderListItems(parent, data.listitems);
      break;
  }
}
