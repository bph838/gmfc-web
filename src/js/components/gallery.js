import {
  createDiv,
  createImage,
  fetchContextArea,
  createInput,
  createLabel,
  emptyDiv,
  createLink,
  createH3,
} from "@framework/dom";
import PhotoSwipeLightbox from "photoswipe/lightbox";

let Loaded_Gallery_Data = null;
let yearSections = [];
let external_Path = null;

export function setGalleryData(data, externalPath) {
  Loaded_Gallery_Data = data;
  external_Path = externalPath;
}

export function createClickImage(parent, data, tag = "tag") {
  if (!data.thumbnail || !data.image || !data.width || !data.height) {
    console.error("Unable to render createClickImage");
    return;
  }

  let id = `single_click_${tag}`;

  const holder = createDiv(parent, id, id);
  const alink = createLink(holder, data.image);
  alink.setAttribute("data-pswp-width", data.width);
  alink.setAttribute("data-pswp-height", data.height);
  createImage(alink, data.thumbnail, null, data.image, true);

  let lightbox = new PhotoSwipeLightbox({
    gallery: `#${id}`,
    children: "a",
    pswpModule: () => import("photoswipe"),
  });
  lightbox.init();
}

export function renderGallery(sections, type) {
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

  let imgPath = external_Path;
  let imgThumbNamePath = ""; //;
  if (directory.length > 1) {
    imgPath += directory + "/" + filename;
    imgThumbNamePath = `${external_Path}${directory}/thumbnails/${filename}`;
  } else {
    imgPath += "/" + filename;
    imgThumbNamePath = `${external_Path}/thumbnails/${filename}`;
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
