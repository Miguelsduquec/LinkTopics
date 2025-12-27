import fs from "node:fs";
import path from "node:path";

function slugify(str = "") {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function extractTitleFromHtml(html = "") {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return null;
  return m[1].replace(/<[^>]+>/g, "").trim() || null;
}

function normalizeUrl(url) {
  if (!url) return null;
  let u = url.startsWith("/") ? url : `/${url}`;
  // remove trailing slash (exceto "/")
  if (u.length > 1 && u.endsWith("/")) u = u.slice(0, -1);
  return u;
}

function makeUniqueUrl(url, used) {
  if (!used.has(url)) return url;

  // /blog/slug -> /blog/slug-2, /blog/slug-3, ...
  let i = 2;
  let candidate = `${url}-${i}`;
  while (used.has(candidate)) {
    i += 1;
    candidate = `${url}-${i}`;
  }
  return candidate;
}

export async function onBeforePrerenderStart() {
  // ⚠️ Não incluir "/" nem "/blog" aqui.
  // O Vike já prerenderiza as páginas estáticas automaticamente.
  // Este hook serve para listar rotas dinâmicas, ex: /blog/:slug

  const postsDir = path.resolve(process.cwd(), "src/posts");

  const folders = fs.existsSync(postsDir)
    ? fs
        .readdirSync(postsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    : [];

  const used = new Set();
  const routes = [];

  for (const folder of folders) {
    const folderPath = path.join(postsDir, folder);
    const files = fs.readdirSync(folderPath);

    const contentFile = files.find((f) => /^content.*\.html$/i.test(f));
    if (!contentFile) continue;

    const html = fs.readFileSync(path.join(folderPath, contentFile), "utf8");
    const title = extractTitleFromHtml(html);

    let slug = title ? slugify(title) : slugify(folder);
    if (!slug) slug = slugify(folder) || "post";

    let url = normalizeUrl(`/blog/${slug}`);

    // segurança extra: nunca devolver "/" (mesmo que algo corra mal)
    if (!url || url === "/") continue;

    url = makeUniqueUrl(url, used);

    used.add(url);
    routes.push(url);
  }

  // última segurança contra duplicados
  return [...new Set(routes)];
}
