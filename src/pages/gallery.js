import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import {
  createDiv,
  createImage,
  fetchContextArea,
  createInput,
  createLabel,
  emptyDiv,
} from "@framework/dom";
import { fetchJson, loadMergedJson } from "@framework/utils";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import data from "@data/pages/gallery.json";
import { createLink, createH3 } from "../js/framework/dom";

const urls = ["/data/media/gallery_data.json", "/data/media/video_data.json"];

let yearSections = [];
let Loaded_Gallery_Data = null;
const externalPath = data.externalPath || "";
setupMenuCommands("page-gallery");
render(data);

function render(data) {
  console.log("Rendering Gallery");
  //If there is a hero image render it
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  contentarea.classList.add("gallery_with_date_picker");

  const gallery_container = createDiv(contentarea, "gallery_container");
  const gallery_date_picker = createDiv(
    contentarea,
    "gallery_date_picker",
    "gallery_date_picker",
  );

  const gallery_filter = createGalleryFilter(gallery_container);
  const sections = createDiv(
    gallery_container,
    "sections",
    "gallery_section_holder",
  );

  (async () => {
    try {
      const items = await loadMergedJson(
        urls,
        (a, b) => new Date(b.date) - new Date(a.date), // example sort newest first
      );

      Loaded_Gallery_Data = items;
      renderGallery(sections, "gallery_all");
    } catch (err) {
      console.error(err);
    }
  })();
}

function renderGallery(sections, type) {
  console.log(type);
  //clear the element out
  emptyDiv(sections);

  //create a div to hold the gallery
  const gallerydiv = createDiv(sections, "gallery");

  if (Loaded_Gallery_Data && Array.isArray(Loaded_Gallery_Data)) {
    Loaded_Gallery_Data.forEach((galleryItem) => {
      let isVideo = "youtubeurl" in galleryItem;
      let isImage = "name" in galleryItem;
      switch (type) {
        default:
        case "gallery_all":
          if (isImage) renderGalleryImage(galleryItem, gallerydiv);
          if (isVideo) renderGalleryVideo(galleryItem, gallerydiv);
          break;
        case "gallery_images":
          if (isImage) renderGalleryImage(galleryItem, gallerydiv);
          break;
        case "gallery_videos":
          if (isVideo) renderGalleryVideo(galleryItem, gallerydiv);
          break;
      }
    });
  }
  yearSections.forEach((yearDivId) => {
    //Initialize PhotoSwipe Lightbox
    let lightbox = new PhotoSwipeLightbox({
      gallery: `#${yearDivId}`,
      children: "a",
      pswpModule: () => import("photoswipe"),
    });
    lightbox.init();
  });
}

function checkGalleryYearDiv(parent, date) {
  let dateObj = new Date(date.replace(" ", "T"));
  let year = dateObj.getFullYear();

  let yearDiv = document.getElementById(`gallery-year-${year}`);
  if (!yearDiv) {
    const yearHolderDiv = createDiv(parent, "gallery-year-section");

    const yearHeader = createDiv(yearHolderDiv, "gallery-year-header");
    createH3(yearHeader, year);

    let yearId = `gallery-year-${year}`;
    yearDiv = createDiv(yearHolderDiv, "gallery-year-items", yearId);
    yearSections.push(yearDiv.id);
  }
  return yearDiv;
}

function renderGalleryImage(image, galleryDiv) {
  // Normalise slashes just in case (\ vs /)
  const normalised = image.name.replace(/\\/g, "/");

  let directory = "";
  let filename = normalised;

  if (normalised.includes("/")) {
    const parts = normalised.split("/");
    filename = parts.pop(); // last item = file name
    directory = parts.join("/"); // rest = directory
  }

  let imgPath = externalPath;
  let imgThumbNamePath = ""; //;
  if (directory.length > 1) {
    imgPath += directory + "/" + filename;
    imgThumbNamePath = `${externalPath}${directory}/thumbnails/${filename}`;
  } else {
    imgPath += "/" + filename;
    imgThumbNamePath = `${externalPath}/thumbnails/${filename}`;
  }

  let yearDiv = checkGalleryYearDiv(galleryDiv, image.date);

  const alink = createLink(yearDiv, imgPath);
  alink.setAttribute("data-pswp-width", image.width);
  alink.setAttribute("data-pswp-height", image.height);
  createImage(alink, imgThumbNamePath, null, image.name, true);
}

function renderGalleryVideo(video, galleryDiv) {
  console.log("Rendering video: " + video);
  let yearDiv = checkGalleryYearDiv(galleryDiv, video.date);
  let title = "";
  if (video.title) title = video.title;
  //let youTubeEmbed = `<iframe width='1335' height='751' src='https://www.youtube.com/embed/SAgHBWnJ4VA' title='Flyover Gordano Model Flying Club' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>`;
  let youTubeEmbed = `<iframe class='if_video' src='${video.youtubeurl}' title='${title}' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'  allowfullscreen></iframe>`;

  let innerDiv = createDiv(yearDiv, "gallery_video_holder");
  innerDiv.innerHTML = youTubeEmbed;
}

function createGalleryFilter(parent) {
  const filterDiv = createDiv(
    parent,
    "btn-group  mb-3 gallery_selector", //
    "mediaFilter",
    "group",
  );

  createInput(
    filterDiv,
    "radio",
    "btn-check",
    "mediaType",
    "gallery_all",
    "gallery_all",
    true,
  );
  createLabel(filterDiv, "btn btn-outline-primary", "gallery_all", "All");

  createInput(
    filterDiv,
    "radio",
    "btn-check",
    "mediaType",
    "gallery_images",
    "gallery_images",
  );
  createLabel(filterDiv, "btn btn-outline-primary", "gallery_images", "Images");

  createInput(
    filterDiv,
    "radio",
    "btn-check",
    "mediaType",
    "gallery_videos",
    "gallery_videos",
  );
  createLabel(filterDiv, "btn btn-outline-primary", "gallery_videos", "Videos");

  document.querySelectorAll('input[name="mediaType"]').forEach((input) => {
    input.addEventListener("change", (e) => {
      console.log("input changed:" + e.target.value);
      const type = e.target.value;
      let gallery_section_holder = document.getElementById(
        "gallery_section_holder",
      );
      if (gallery_section_holder) {
        renderGallery(gallery_section_holder, type);
      }
    });
  });

  return filterDiv;
}
