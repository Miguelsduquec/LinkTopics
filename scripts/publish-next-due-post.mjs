import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "src", "posts");
const SCHEDULED_DIR = path.join(ROOT, "src", "scheduled");

function todayInLisbon() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function currentHourInLisbon() {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Lisbon",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date())
  );
}

function slugify(input) {
  return String(input)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

function listDirNames(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function getDatePrefix(folderName) {
  return String(folderName).slice(0, 10);
}

function getScheduledSlot(folderName) {
  return String(folderName).startsWith(`${getDatePrefix(folderName)}-pm-`) ? "pm" : "am";
}

function resolvePublishSlot() {
  const explicit = String(process.env.PUBLISH_SLOT || "").trim().toLowerCase();
  if (explicit === "am" || explicit === "pm") return explicit;
  return currentHourInLisbon() >= 12 ? "pm" : "am";
}

function getHtmlTitle(html, fallback) {
  const h1Match = String(html || "").match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match?.[1]) return fallback;
  return h1Match[1].replace(/<[^>]+>/g, "").trim() || fallback;
}

function updatePublishDates(html, publishDateISO) {
  return String(html || "")
    .replace(/("datePublished"\s*:\s*")\d{4}-\d{2}-\d{2}(")/g, `$1${publishDateISO}$2`)
    .replace(/("dateModified"\s*:\s*")\d{4}-\d{2}-\d{2}(")/g, `$1${publishDateISO}$2`);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanupNestedPublishedFolders() {
  const cleaned = [];

  for (const folderName of listDirNames(POSTS_DIR)) {
    const outerDir = path.join(POSTS_DIR, folderName);
    const nestedDir = path.join(outerDir, folderName);
    if (!fs.existsSync(nestedDir) || !fs.statSync(nestedDir).isDirectory()) continue;

    const nestedHtml = path.join(nestedDir, "content.html");
    const nestedThumb = path.join(nestedDir, "thumbnail.jpeg");
    const outerHtml = path.join(outerDir, "content.html");
    const outerThumb = path.join(outerDir, "thumbnail.jpeg");

    if (!fs.existsSync(outerHtml) && fs.existsSync(nestedHtml)) {
      fs.renameSync(nestedHtml, outerHtml);
    }

    if (!fs.existsSync(outerThumb) && fs.existsSync(nestedThumb)) {
      fs.renameSync(nestedThumb, outerThumb);
    }

    fs.rmSync(nestedDir, { recursive: true, force: true });
    cleaned.push(folderName);
  }

  return cleaned;
}

function removeScheduledDuplicates() {
  const removed = [];
  const publishedFolders = new Set(listDirNames(POSTS_DIR));

  for (const folderName of listDirNames(SCHEDULED_DIR)) {
    if (!publishedFolders.has(folderName)) continue;
    fs.rmSync(path.join(SCHEDULED_DIR, folderName), { recursive: true, force: true });
    removed.push(folderName);
  }

  return removed;
}

function findNextDueScheduled(todayISO, slot) {
  return listDirNames(SCHEDULED_DIR).find((folderName) => {
    const prefix = getDatePrefix(folderName);
    return /^\d{4}-\d{2}-\d{2}$/.test(prefix) && prefix <= todayISO && getScheduledSlot(folderName) === slot;
  });
}

function fallbackSlugFromFolder(folderName) {
  const stem = String(folderName).slice(11);
  const withoutSlotPrefix = stem.startsWith("pm-") ? stem.slice(3) : stem;
  return slugify(withoutSlotPrefix);
}

function publishNextDuePost() {
  const todayISO = todayInLisbon();
  const slot = resolvePublishSlot();
  ensureDir(POSTS_DIR);
  ensureDir(SCHEDULED_DIR);

  const cleanedNested = cleanupNestedPublishedFolders();
  const removedDuplicates = removeScheduledDuplicates();
  const nextDueFolder = findNextDueScheduled(todayISO, slot);

  if (!nextDueFolder) {
    return {
      todayISO,
      slot,
      cleanedNested,
      removedDuplicates,
      published: false,
      reason: "no_due_unique_posts",
    };
  }

  const sourceDir = path.join(SCHEDULED_DIR, nextDueFolder);
  const sourceHtmlPath = path.join(sourceDir, "content.html");
  const html = fs.readFileSync(sourceHtmlPath, "utf8");
  const fallbackSlug = fallbackSlugFromFolder(nextDueFolder);
  const title = getHtmlTitle(html, fallbackSlug);
  const slug = slugify(title) || fallbackSlug;

  let targetFolder = `${todayISO}-${slug}`;
  let suffix = 2;
  while (fs.existsSync(path.join(POSTS_DIR, targetFolder))) {
    targetFolder = `${todayISO}-${slug}-${suffix}`;
    suffix += 1;
  }

  const targetDir = path.join(POSTS_DIR, targetFolder);
  fs.renameSync(sourceDir, targetDir);

  const targetHtmlPath = path.join(targetDir, "content.html");
  fs.writeFileSync(targetHtmlPath, updatePublishDates(html, todayISO), "utf8");

  return {
    todayISO,
    slot,
    cleanedNested,
    removedDuplicates,
    published: true,
    from: nextDueFolder,
    to: targetFolder,
    title,
  };
}

console.log(JSON.stringify(publishNextDuePost(), null, 2));
