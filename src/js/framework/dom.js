export function fetchContextArea(data) {
  let contentarea = document.getElementById("contentarea");
  if (!contentarea) {
    console.error("There is no contentarea id to render to");
    return null;
  }
  if (!data) {
    console.error("There is no data content to render from");
    return null;
  }
  return contentarea;
}

/**
 * Create a div component and return it
 * @param {*} parent
 * @param {*} className
 * @param {*} id
 * @returns
 */
export function createDiv(parent, className = null, id = null, role = null) {
  let el = document.createElement("div");
  if (className) el.className = className;
  if (id) el.id = id;
  if (role) el.role = role;
  parent.appendChild(el);
  return el;
}

export function createSection(parent, className = null, id = null) {
  let el = document.createElement("section");
  if (className) el.className = className;
  if (id) el.id = id;
  parent.appendChild(el);
  return el;
}

export function createH1(parent, innerHTML, className = null, id = null) {
  return createHeader(parent, innerHTML, className, id, 1);
}
export function createH2(parent, innerHTML, className = null, id = null) {
  return createHeader(parent, innerHTML, className, id, 2);
}
export function createH3(parent, innerHTML, className = null, id = null) {
  return createHeader(parent, innerHTML, className, id, 2);
}

export function createInput(
  parent,
  type,
  className = null,
  name = null,
  id = null,
  value = null,
  checked = false,
) {
  let el = document.createElement("input");
  el.type = type;
  if (className) el.className = className;
  if (name) el.name = name;
  if (id) el.id = id;
  if (value) el.value = value;
  if (checked) {
    console.log("a");
    el.checked = checked;
  }

  parent.appendChild(el);
  return el;
}

export function createLabel(
  parent,
  className = null,
  forName = null,
  innerHTML = null,
) {
  let el = document.createElement("label");
  if (className) el.className = className;
  if (forName) el.htmlFor = forName;
  if (innerHTML) el.innerHTML = innerHTML;

  parent.appendChild(el);
  return el;
}

function createHeader(
  parent,
  innerHTML,
  className = null,
  id = null,
  type = 1,
) {
  let el = null;
  switch (type) {
    case 3:
      el = document.createElement("h3");
      break;
    case 2:
      el = document.createElement("h2");
      break;
    default:
      el = document.createElement("h1");
      break;
  }

  if (className) el.className = className;
  if (id) el.id = id;
  if (innerHTML) el.innerHTML = innerHTML;
  parent.appendChild(el);
  return el;
}

export function createSpan(parent, className = null, innerHTML = "") {
  let el = document.createElement("span");
  if (className) el.className = className;
  el.innerHTML = innerHTML;
  parent.appendChild(el);
  return el;
}

export function createLink(
  parent,
  href = null,
  className = null,
  innerHTML = "",
  target = "_blank",
) {
  let el = document.createElement("a");
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  if (href) el.href = href;
  el.target = target;

  parent.appendChild(el);
  return el;
}

export function emptyDiv(el) {
  if (!el) return;
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export function createCanvas(parent, className = null, id = null) {
  let el = document.createElement("canvas");
  if (className) el.className = className;
  if (id) el.id = id;
  parent.appendChild(el);
  return el;
}

export function createImage(
  parent,
  src = null,
  className = null,
  alt = null,
  lazyload = false,
) {
  let el = document.createElement("img");
  if (className) el.className = className;
  if (src) el.src = src;
  if (alt) el.alt = alt;
  if (lazyload === true) {
    el.loading = "lazy";
  }

  parent.appendChild(el);
  return el;
}

export function createParagraph(parent, innerHTML = null, className = null) {
  if (typeof innerHTML !== "string") return;

  let el = document.createElement("p");
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;

  parent.appendChild(el);
  return el;
}

export function createOrderedList(parent, className = null) {
  let el = document.createElement("ol");
  if (className) el.className = className;

  parent.appendChild(el);
  return el;
}

export function createListItem(parent, className = null, innerHTML = null) {
  let el = document.createElement("li");
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;

  parent.appendChild(el);
  return el;
}

export function injectScript(url) {
  return new Promise((resolve, reject) => {
    // already loaded?
    const existing = document.querySelector(`script[src="${url}"]`);
    if (existing) {
      // if already finished loading, resolve immediately
      if (existing.dataset.loaded === "true") {
        resolve();
      } else {
        existing.addEventListener("load", resolve);
        existing.addEventListener("error", reject);
      }
      return;
    }

    // create script
    const script = document.createElement("script");
    script.src = url;
    script.async = true;

    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });

    script.addEventListener("error", reject);

    document.head.appendChild(script);
  });
}
