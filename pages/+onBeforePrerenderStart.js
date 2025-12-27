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

export async function onBeforePrerenderStart() {
  // ⚠️ Apenas rotas dinâmicas
  const postsDir = path.resolve(process.cwd(), "src/posts");

  const folders = fs.existsSync(postsDir)
    ? fs
        .readdirSync(postsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    : [];

  const routes = new Set();

  for (const folder of folders) {
    // 🔒 SLUG BASEADO APENAS NA PASTA (ID único)
    const slug = slugify(folder);
    if (!slug) continue;

    const url = `/blog/${slug}`;

    routes.add(url);
  }

  return Array.from(routes);
}
