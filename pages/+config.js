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

function getBlogUrls() {
  const postsDir = path.resolve(process.cwd(), "src/posts");

  const folders = fs.existsSync(postsDir)
    ? fs
        .readdirSync(postsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    : [];

  return Array.from(
    new Set(
      folders
        .map((f) => slugify(f))
        .filter(Boolean)
        .map((slug) => `/blog/${slug}`)
    )
  );
}

export default {
  prerender: {
    urls: getBlogUrls()
  }
};
