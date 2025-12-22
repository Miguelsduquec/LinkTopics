// src/seo.js
const CANONICAL_ORIGIN = "https://www.linktopics.me";

export function setCanonical(pathname) {
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const href = `${CANONICAL_ORIGIN}${cleanPath}`;

  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}
