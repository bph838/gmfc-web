export function initCopyrightYear() {
  const el = document.getElementById("copyright-year");
  if (!el) return;

  el.textContent = new Date().getFullYear();
}

export function initMenuName(name) {
  const el = document.getElementById("navbar-brand-site-name");
  if (!el) return;

  el.textContent = name;
}
