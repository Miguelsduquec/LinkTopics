// scripts/generate-sitemap.cjs
// Gera public/sitemap.xml a partir dos posts em src/posts
// ✅ Slugs geradas a partir do <h1> (mesma lógica do blog.jsx)
// ✅ Corrige typo legacy "hide-linkedin-adds" -> "hide-linkedin-ads"

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://www.linktopics.me";

// Páginas estáticas principais
const staticUrls = [
  { loc: `${BASE_URL}/`, priority: "1.0" },
  { loc: `${BASE_URL}/blog`, priority: "0.9" },
  { loc: `${BASE_URL}/privacy-policy`, priority: "0.5" },
  { loc: `${BASE_URL}/tos`, priority: "0.5" },
];

// Meta fixa para os posts antigos (sem prefixo de data na pasta)
const LEGACY_POSTS = {
  "001-focus-mode": {
    slug: "stay-focused-on-linkedin-with-linktopics",
    dateISO: "2025-10-12T00:00:00.000Z",
  },
  "002-linkedin-vs-facebook": {
    slug: "is-linkedin-turning-into-facebook-not-anymore",
    dateISO: "2025-10-11T00:00:00.000Z",
  },
  "003-remove-ads": {
    slug: "remove-ads-and-noise-on-linkedin",
    dateISO: "2025-10-10T00:00:00.000Z",
  },
  "004-hide-linkedin-ads": {
    slug: "hide-linkedin-ads", // ✅ FIXED (was hide-linkedin-adds)
    dateISO: "2025-11-21T00:00:00.000Z",
  },
};

function slugify(str = "") {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function stripTags(html = "") {
  return html.replace(/<[^>]+>/g, "");
}

function extractFirstHeading(html = "") {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? stripTags(m[1]).trim() : "";
}

function deriveDateFromFolder(folder) {
  // ex: 2025-11-25-remove-linkedin-ads
  const m = folder.match(/^(\d{4}-\d{2}-\d{2})-/);
  if (!m) return null;
  const isoBase = `${m[1]}T00:00:00.000Z`;
  const d = new Date(isoBase);
  if (isNaN(d.getTime())) return null;
  return isoBase;
}

// ✅ Match blog.jsx logic: slug from <h1> first
function deriveSlugFromFolder(folder, html) {
  // Prefer H1 (same as blog.jsx)
  const h1 = extractFirstHeading(html);
  if (h1) return slugify(h1);

  // Fallback: use folder suffix (strip leading YYYY-MM-DD-)
  const m = folder.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  if (m) return slugify(m[1]);

  // Final fallback: folder name
  return slugify(folder);
}

function formatDate(iso) {
  if (!iso) return null;
  return iso.slice(0, 10); // YYYY-MM-DD
}

function generate() {
  const postsDir = path.join(__dirname, "..", "src", "posts");
  const publicDir = path.join(__dirname, "..", "public");
  const sitemapPath = path.join(publicDir, "sitemap.xml");

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const today = new Date().toISOString().slice(0, 10);

  // Static URLs com lastmod = hoje
  const urls = staticUrls.map((u) => ({
    ...u,
    lastmod: today,
  }));

  // Posts do blog
  if (fs.existsSync(postsDir)) {
    const folders = fs
      .readdirSync(postsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    folders.forEach((folder) => {
      const folderPath = path.join(postsDir, folder);

      // procurar ficheiro content*.html
      const contentFile = fs
        .readdirSync(folderPath)
        .find((f) => /^content.*\.html$/i.test(f));

      if (!contentFile) {
        console.warn(`⚠ Sem content*.html em ${folderPath}, a ignorar`);
        return;
      }

      const html = fs.readFileSync(path.join(folderPath, contentFile), "utf8");

      const legacy = LEGACY_POSTS[folder];
      let slug;
      let dateISO;

      if (legacy) {
        slug = legacy.slug;
        dateISO = legacy.dateISO;
      } else {
        slug = deriveSlugFromFolder(folder, html);
        dateISO = deriveDateFromFolder(folder) || new Date().toISOString();
      }

      const lastmod = formatDate(dateISO) || today;

      urls.push({
        loc: `${BASE_URL}/blog/${slug}`,
        lastmod,
        priority: "0.8",
      });
    });
  }

  // Construir XML
  const xmlParts = [];
  xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlParts.push(
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  );

  urls.forEach((u) => {
    xmlParts.push("  <url>");
    xmlParts.push(`    <loc>${u.loc}</loc>`);
    if (u.lastmod) xmlParts.push(`    <lastmod>${u.lastmod}</lastmod>`);
    if (u.changefreq)
      xmlParts.push(`    <changefreq>${u.changefreq}</changefreq>`);
    if (u.priority) xmlParts.push(`    <priority>${u.priority}</priority>`);
    xmlParts.push("  </url>");
  });

  xmlParts.push("</urlset>");

  fs.writeFileSync(sitemapPath, xmlParts.join("\n") + "\n", "utf8");
  console.log(`✅ sitemap.xml gerado em ${sitemapPath}`);
}

generate();
