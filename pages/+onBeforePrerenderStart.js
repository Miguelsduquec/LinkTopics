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

export async function onBeforePrerenderStart() {
  // ✅ opção A: só prerender páginas que existem no Vike
  const routes = ["/", "/blog"];

  const postsDir = path.resolve(process.cwd(), "src/posts");
  const folders = fs.existsSync(postsDir)
    ? fs
        .readdirSync(postsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    : [];

  for (const folder of folders) {
    const folderPath = path.join(postsDir, folder);
    const files = fs.readdirSync(folderPath);
    const contentFile = files.find((f) => /^content.*\.html$/i.test(f));
    if (!contentFile) continue;

    const html = fs.readFileSync(path.join(folderPath, contentFile), "utf8");
    const title = extractTitleFromHtml(html);

    const slug = title ? slugify(title) : slugify(folder);
    routes.push(`/blog/${slug}`);
  }

  return routes;
}
