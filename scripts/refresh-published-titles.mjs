import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "src", "posts");
const MAX_TITLE_LENGTH = 50;

const TITLE_OVERRIDES = {
  "2025-11-29-linkedin-productivity-guide": "LinkedIn Productivity for Work",
  "2025-12-01-Ways-LinkTopics-Helps-Busy-Professionals": "LinkTopics for Busy Professionals",
  "2025-12-06-How-to-build-a-strong-Linkedin-Network": "Build a Strong LinkedIn Network",
  "2025-12-10-One-Post-A-Month": "LinkedIn Posting Once a Month Fails",
  "2025-12-17-You-dont-need-to-be-a-content-creator-to-sell": "Sell on LinkedIn Without Posting",
  "2025-12-19-You-only-have-7-seconds-to-impress-recruiter": "Impress Recruiters on LinkedIn",
  "2026-01-01-Clean-feed-mannually": "Manual LinkedIn Feed Cleanup Guide",
  "2026-01-02-your-linkedin-feed-is-shaping-your-career-more-than-you-think":
    "Attract Recruiters With LinkedIn",
  "2026-01-03-Adblock-Plus-for-Linkedin": "Adblock Plus for LinkedIn Feed",
  "2026-01-04-uBlock-Origin-for-Linkedin": "uBlock Origin for LinkedIn Feed",
  "2026-01-05-if-candidates-ignore-your-messages": "Why LinkedIn Messages Get Ignored",
  "2026-01-07-Top-Performers-on-linkedin-share-one-habit": "LinkedIn Focus Habits for Work",
  "2026-01-09-My-feed-finally-makes-sense-again": "A LinkedIn Feed That Makes Sense",
  "2026-01-12-Recruiters-scan-a-profile-in-just-seconds": "Recruiters Scan LinkedIn Profiles",
  "2026-01-16-Most-people-scroll-Linkedin-but-very-few": "Use LinkedIn More Strategically",
  "2026-01-19-How-to-remove-Promoted-Posts-on-Linkedin": "Hide Promoted Posts on LinkedIn",
  "2026-01-21-how-to-remove-Liked-by-posts-on-Linkedin": "Hide Liked Posts on LinkedIn Fast",
  "2026-01-26-Linkedin-Feed-Cleaner": "Best LinkedIn Feed Cleaner Guide",
  "2026-01-27-No-Linkedin-Ads": "How to Block LinkedIn Feed Ads",
  "2026-02-05-Linktopics-vs-Linkoff": "LinkTopics vs LinkOff on LinkedIn",
  "2026-02-09-Linktopics-vs-Linkedin-Adblock-Alternatives":
    "LinkTopics vs LinkedIn Ad Blockers",
  "2026-02-11-why-linkedin-premium-dont-clean-your-feed": "Does LinkedIn Premium Clean Feed?",
  "2026-02-12-how-to-customize-your-linkedin-feed": "Customize Your LinkedIn Feed Fast",
  "2026-02-16-why-Linkedin-Ads-are-taking-over-your-feed": "Why LinkedIn Ads Take Over Feeds",
  "2026-02-17-What-are-promoted-posts-on-linkedin": "Why LinkedIn Shows Promoted Posts",
  "2026-02-20-why-you-keep-seeing-shared-and-reshared-post": "Why LinkedIn Shows Shared Posts",
  "2026-02-23-why-linkedin-shows-recommended-posts": "Why LinkedIn Shows Recommended Posts",
  "2026-02-24-why-linkedin-shows-suggested-posts": "Why LinkedIn Shows Suggested Posts",
  "2026-02-25-Remove-job-posts-linkedin-feed": "Why Job Posts Show on LinkedIn",
  "2026-02-26-Linkedin-feed-for-recruiters-how-to-remove-noise": "LinkedIn Feed for Recruiters",
  "2026-02-27-Why-recruiters-miss-great-candidates": "Recruiters Miss Talent on LinkedIn",
  "2026-03-02-How-recruiters-can-use-linkedin-more-effectively": "LinkedIn Recruiting Tips Guide",
  "2026-03-03-why-linkedin-feels-overwhelming-for-hr": "LinkedIn Feed for HR Professionals",
  "2026-03-04-how-a-noisy-linkedin-feed-affects": "Why LinkedIn Feed Noise Hurts HR",
  "2026-03-05-what-hr-teams-actually-need-to-see": "LinkedIn Feed Tips for HR Teams",
  "2026-03-06-linkedin-for-sales-how-to-focus-on-buying": "LinkedIn Feed for Sales Teams",
  "2026-03-09-why-linkedin-distracts-sales-reps-more-then-helps":
    "Why LinkedIn Distracts Sales Teams",
  "2026-03-10-signal-vs-noise-on-linkedin-what-salespeople":
    "LinkedIn Sales Signals That Matter",
  "2026-03-13-use-linkedin-as-a-research-tool-instead-of-an":
    "LinkedIn Research Beats Scrolling",
  "2026-03-16-why-employer-branding-content-gets-lost-on-linkedin":
    "Employer Branding Fails on LinkedIn",
  "2026-03-17-linkedin-employer-branding-how-feed-noise-damages":
    "LinkedIn Employer Branding Tips",
  "2026-03-18-authentic-employer-branding-on-linkedin": "LinkedIn Branding That Stands Out",
  "2026-03-19-your-linkedin-feed-is-shaping-how-you-think": "Your LinkedIn Feed Shapes Work",
  "2026-05-07-why-focus-is-becoming-a-competitive-advantage-on-linkedin":
    "LinkedIn Focus Starts With Feed",
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function replaceMetaContent(html, attrPattern, newValue) {
  return html.replace(
    new RegExp(
      `(<meta[^>]+${attrPattern}[^>]+content=["'])[^"']*(["'][^>]*>)`,
      "i"
    ),
    `$1${escapeHtml(newValue)}$2`
  );
}

let updated = 0;
const changed = [];

for (const entry of fs.readdirSync(POSTS_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const folder = entry.name;
  const nextTitle = TITLE_OVERRIDES[folder];
  if (!nextTitle) continue;

  if (nextTitle.length > MAX_TITLE_LENGTH) {
    throw new Error(`Title too long for ${folder}: ${nextTitle}`);
  }

  const htmlPath = path.join(POSTS_DIR, folder, "content.html");
  if (!fs.existsSync(htmlPath)) continue;

  let html = fs.readFileSync(htmlPath, "utf8");
  const currentTitleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const currentTitle = currentTitleMatch?.[1]?.replace(/<[^>]+>/g, "").trim() || "";

  if (!currentTitle || currentTitle === nextTitle) continue;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(nextTitle)}</title>`);
  html = replaceMetaContent(html, 'property=["\']og:title["\']', nextTitle);
  html = replaceMetaContent(html, 'name=["\']twitter:title["\']', nextTitle);
  html = html.replace(
    /("headline"\s*:\s*)"(?:[^"\\]|\\.)*"/i,
    (_, prefix) => `${prefix}${JSON.stringify(nextTitle)}`
  );
  html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, `<h1>${escapeHtml(nextTitle)}</h1>`);

  fs.writeFileSync(htmlPath, html, "utf8");
  updated += 1;
  changed.push({ folder, from: currentTitle, to: nextTitle });
}

console.log(JSON.stringify({ updated, changed }, null, 2));
