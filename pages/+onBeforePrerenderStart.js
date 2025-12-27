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
  // garantir que começa com /
  let u = url.startsWith("/") ? url : `/${url}`;
  // remover trailing slash (exceto na raiz)
  if (u.length > 1 && u.endsWith("/")) u = u.slice(0, -1);
  return u;
}

function makeUniqueUrl(url, used) {
  // se já existir, acrescenta sufixo -2, -3, ...
  if (!used.has(url)) return url;

  const m = url.match(/^(.*?)(?:-(\d+))?$/);
  const base = m ? m[1] : url;

  let i = 2;
  let candidate = `${base}-${i}`;
  while (used.has(candidate)) {
    i += 1;
    candidate = `${base}-${i}`;
  }
  return candidate;
}

export async function onBeforePrerenderStart() {
  // ✅ páginas base
  const baseRoutes = ["/", "/blog"];

  const postsDir = path.resolve(process.cwd(), "src/posts");
  const folders = fs.existsSync(postsDir)
    ? fs
        .readdirSync(postsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    : [];

  const used = new Set();
  const routes = [];

  // adiciona as baseRoutes (normalizadas e únicas)
  for (const r of baseRoutes) {
    const url = normalizeUrl(r);
    if (!url) continue;
    if (!used.has(url)) {
      used.add(url);
      routes.push(url);
    }
  }

  for (const folder of folders) {
    const folderPath = path.join(postsDir, folder);
    const files = fs.readdirSync(folderPath);

    const contentFile = files.find((f) => /^content.*\.html$/i.test(f));
    if (!contentFile) continue;

    const html = fs.readFileSync(path.join(folderPath, contentFile), "utf8");
    const title = extractTitleFromHtml(html);

    // slug a partir do title, ou do nome da pasta
    let slug = title ? slugify(title) : slugify(folder);

    // se por algum motivo o slug ficar vazio, usa o folder
    if (!slug) slug = slugify(folder) || "post";

    // construir URL do post
    let postUrl = normalizeUrl(`/blog/${slug}`);

    // garantir que não colide com algo já gerado
    postUrl = makeUniqueUrl(postUrl, used);

    used.add(postUrl);
    routes.push(postUrl);
  }

  return routes;
}
