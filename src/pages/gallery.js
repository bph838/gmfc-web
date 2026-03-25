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
import { createLink, createH3, renderFinish } from "../js/framework/dom";
import { renderGallery, setGalleryData } from "@components/gallery";

const urls = ["/data/media/gallery_data.json", "/data/media/video_data.json"];

const externalPath = data.externalPath || "";
import menu from "@data/generated/menu.json";

setupMenuCommands("page-gallery", menu);
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

      setGalleryData(items, externalPath);
      renderGallery(sections, "gallery_all");
      renderFinish();
    } catch (err) {
      console.error(err);
    }
  })();
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
