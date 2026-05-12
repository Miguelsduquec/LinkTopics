import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCHEDULED_DIR = path.join(ROOT, "src", "scheduled");
const POSTS_DIR = path.join(ROOT, "src", "posts");
const MANIFEST_PATH = path.join(ROOT, "docs", "linktopics-daily-queue-2026-2027.csv");

const END_DATE = "2027-12-31";
const MAX_TITLE_LENGTH = 50;
const IDEAL_TITLE_MIN = 30;
const IDEAL_TITLE_MAX = 40;

const CATEGORY_ORDER = [
  "ads",
  "reactions",
  "shares",
  "suggested",
  "persona",
  "comparison",
  "strategy",
];

const SECONDARY_CATEGORY_ORDER = [
  "professionTips",
  "profileTips",
  "networkingTips",
  "contentTips",
  "leadGenTips",
  "jobSearchTips",
  "personalBrandTips",
];

const TIPS_CATEGORIES = new Set(SECONDARY_CATEGORY_ORDER);

const IMAGE_BY_CATEGORY = {
  ads: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
  reactions: "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1400&q=80",
  shares: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
  suggested: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
  persona: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
  comparison: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
  strategy: "https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=1400&q=80",
  professionTips: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
  profileTips: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
  networkingTips: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1400&q=80",
  contentTips: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
  leadGenTips: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
  jobSearchTips: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80",
  personalBrandTips: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
};

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/linktopics/bdilfiejpkdfbildemdncbkblegpejfb";

const RELATED_SLUG_BY_CATEGORY = {
  ads: "/blog/hide-linkedin-ads",
  reactions: "/blog/hide-linkedin-ads",
  shares: "/blog/hide-linkedin-ads",
  suggested: "/blog/hide-linkedin-ads",
  persona: "/blog/remove-ads-and-noise-on-linkedin",
  comparison: "/blog/remove-ads-and-noise-on-linkedin",
  strategy: "/blog/remove-ads-and-noise-on-linkedin",
  professionTips: "/blog/remove-ads-and-noise-on-linkedin",
  profileTips: "/blog/remove-ads-and-noise-on-linkedin",
  networkingTips: "/blog/remove-ads-and-noise-on-linkedin",
  contentTips: "/blog/remove-ads-and-noise-on-linkedin",
  leadGenTips: "/blog/remove-ads-and-noise-on-linkedin",
  jobSearchTips: "/blog/remove-ads-and-noise-on-linkedin",
  personalBrandTips: "/blog/remove-ads-and-noise-on-linkedin",
};

const CATEGORY_CONTEXT = {
  ads: {
    label: "Promoted and Sponsored posts",
    short: "ads and promoted posts",
  },
  reactions: {
    label: "Liked and Reacted posts",
    short: "reaction-driven posts",
  },
  shares: {
    label: "Shared and Reshared posts",
    short: "shared and reposted posts",
  },
  suggested: {
    label: "Suggested and Recommended posts",
    short: "suggested content",
  },
  persona: {
    label: "feed noise for professionals",
    short: "LinkedIn feed noise",
  },
  comparison: {
    label: "feed-cleaning options",
    short: "LinkedIn feed-cleaning tools",
  },
  strategy: {
    label: "a cleaner LinkedIn workflow",
    short: "LinkedIn feed clarity",
  },
  professionTips: {
    label: "role-specific LinkedIn habits",
    short: "LinkedIn workflow tips",
  },
  profileTips: {
    label: "LinkedIn profile improvements",
    short: "LinkedIn profile tips",
  },
  networkingTips: {
    label: "LinkedIn networking habits",
    short: "LinkedIn networking tips",
  },
  contentTips: {
    label: "LinkedIn content habits",
    short: "LinkedIn content tips",
  },
  leadGenTips: {
    label: "LinkedIn lead generation workflows",
    short: "LinkedIn lead gen tips",
  },
  jobSearchTips: {
    label: "LinkedIn job search workflows",
    short: "LinkedIn job search tips",
  },
  personalBrandTips: {
    label: "LinkedIn personal brand habits",
    short: "LinkedIn personal brand tips",
  },
};

const PERSONAS = [
  "recruiters",
  "sales teams",
  "marketers",
  "founders",
  "consultants",
  "job seekers",
  "HR teams",
];

const COMPARISONS = [
  "LinkedIn Premium",
  "generic ad blockers",
  "manual feed cleanup",
  "native LinkedIn settings",
  "uBlock Origin",
  "AdBlock",
  "unfollowing everyone",
];

const REACTION_VARIANTS = [
  {
    keyword: "hide liked posts on LinkedIn",
    title: "Hide Liked Posts on LinkedIn",
    angle: "reaction-driven posts",
    pattern: "liked posts",
  },
  {
    keyword: "hide reacted posts on LinkedIn",
    title: "Hide Reacted Posts on LinkedIn",
    angle: "reaction-driven posts",
    pattern: "reacted posts",
  },
  {
    keyword: "why LinkedIn shows loves this posts",
    title: "Why LinkedIn Shows Loves This",
    angle: "reaction-driven posts",
    pattern: "“loves this” posts",
  },
  {
    keyword: "hide celebrates this on LinkedIn",
    title: "Hide Celebrates This on LinkedIn",
    angle: "reaction-driven posts",
    pattern: "“celebrates this” posts",
  },
  {
    keyword: "hide insightful posts on LinkedIn",
    title: "Hide Insightful Posts on LinkedIn",
    angle: "reaction-driven posts",
    pattern: "“finds this insightful” posts",
  },
  {
    keyword: "hide supports this on LinkedIn",
    title: "Hide Supports This on LinkedIn",
    angle: "reaction-driven posts",
    pattern: "“supports this” posts",
  },
  {
    keyword: "how to hide likes this posts on LinkedIn",
    title: "Hide Likes This Posts on LinkedIn",
    angle: "reaction-driven posts",
    pattern: "“likes this” posts",
  },
];

const SHARE_VARIANTS = [
  {
    keyword: "hide shared posts on LinkedIn",
    title: "Hide Shared Posts on LinkedIn",
    angle: "shared and reposted posts",
    pattern: "shared posts",
  },
  {
    keyword: "hide reshared posts on LinkedIn",
    title: "Hide Reshared Posts on LinkedIn",
    angle: "shared and reposted posts",
    pattern: "reshared posts",
  },
  {
    keyword: "hide reposted posts on LinkedIn",
    title: "Hide Reposted Posts on LinkedIn",
    angle: "shared and reposted posts",
    pattern: "reposted posts",
  },
  {
    keyword: "why LinkedIn shows reposts",
    title: "Why LinkedIn Shows Reposts",
    angle: "shared and reposted posts",
    pattern: "reposted posts",
  },
  {
    keyword: "why LinkedIn shows shared posts",
    title: "Why LinkedIn Shows Shared Posts",
    angle: "shared and reposted posts",
    pattern: "shared and reshared posts",
  },
];

const ADS_VARIANTS = [
  {
    keyword: "remove LinkedIn ads",
    title: "How to Remove LinkedIn Ads",
    angle: "LinkedIn ads",
  },
  {
    keyword: "hide promoted posts on LinkedIn",
    title: "How to Hide Promoted Posts on LinkedIn",
    angle: "promoted posts",
  },
  {
    keyword: "hide sponsored posts on LinkedIn",
    title: "Hide Sponsored Posts on LinkedIn",
    angle: "sponsored posts",
  },
  {
    keyword: "best LinkedIn ad blocker",
    title: "Best LinkedIn Ad Blocker",
    angle: "LinkedIn ad blockers",
  },
  {
    keyword: "block promoted posts LinkedIn",
    title: "Block Promoted Posts on LinkedIn",
    angle: "promoted posts",
  },
];

const SUGGESTED_VARIANTS = [
  {
    keyword: "hide suggested posts on LinkedIn",
    title: "Hide Suggested Posts on LinkedIn",
    angle: "suggested and recommended posts",
    pattern: "suggested posts",
  },
  {
    keyword: "hide recommended posts on LinkedIn",
    title: "Hide Recommended Posts on LinkedIn",
    angle: "suggested and recommended posts",
    pattern: "recommended posts",
  },
  {
    keyword: "why LinkedIn suggests posts",
    title: "Why LinkedIn Suggests Posts",
    angle: "suggested and recommended posts",
    pattern: "suggested posts",
  },
  {
    keyword: "why LinkedIn recommends posts",
    title: "Why LinkedIn Recommends Posts",
    angle: "suggested and recommended posts",
    pattern: "recommended posts",
  },
  {
    keyword: "hide recommended content on LinkedIn",
    title: "Hide LinkedIn Recommended Content",
    angle: "suggested and recommended posts",
    pattern: "recommended content",
  },
];

const PERSONA_VARIANTS = [
  {
    keyword: "LinkedIn feed for recruiters",
    title: "LinkedIn Feed for Recruiters",
    angle: "a cleaner LinkedIn feed for recruiters",
  },
  {
    keyword: "LinkedIn feed for sales teams",
    title: "LinkedIn Feed for Sales Teams",
    angle: "a cleaner LinkedIn feed for sales teams",
  },
  {
    keyword: "LinkedIn feed for marketers",
    title: "LinkedIn Feed for Marketers",
    angle: "a cleaner LinkedIn feed for marketers",
  },
  {
    keyword: "LinkedIn feed for founders",
    title: "LinkedIn Feed for Founders",
    angle: "a cleaner LinkedIn feed for founders",
  },
  {
    keyword: "LinkedIn feed for consultants",
    title: "LinkedIn Feed for Consultants",
    angle: "a cleaner LinkedIn feed for consultants",
  },
  {
    keyword: "LinkedIn feed for job seekers",
    title: "LinkedIn Feed for Job Seekers",
    angle: "a cleaner LinkedIn feed for job seekers",
  },
  {
    keyword: "LinkedIn feed for HR teams",
    title: "LinkedIn Feed for HR Teams",
    angle: "a cleaner LinkedIn feed for HR teams",
  },
];

const COMPARISON_VARIANTS = [
  {
    keyword: "LinkTopics vs LinkedIn Premium",
    title: "LinkTopics vs LinkedIn Premium",
    angle: "LinkTopics compared with LinkedIn Premium",
  },
  {
    keyword: "LinkTopics vs LinkedIn ad blockers",
    title: "LinkTopics vs LinkedIn Ad Blockers",
    angle: "LinkTopics compared with generic ad blockers",
  },
  {
    keyword: "feed cleaner vs manual cleanup",
    title: "Feed Cleaner vs Manual Cleanup",
    angle: "manual feed cleanup versus filtering",
  },
  {
    keyword: "uBlock Origin for LinkedIn",
    title: "uBlock Origin for LinkedIn",
    angle: "uBlock Origin on LinkedIn",
  },
  {
    keyword: "AdBlock for LinkedIn",
    title: "AdBlock on LinkedIn Feed",
    angle: "AdBlock on LinkedIn",
  },
  {
    keyword: "native LinkedIn settings vs feed cleaner",
    title: "LinkedIn Settings vs Feed Cleaner",
    angle: "native settings compared with a feed cleaner",
  },
];

const STRATEGY_VARIANTS = [
  {
    keyword: "clean LinkedIn feed",
    title: "Clean LinkedIn Feed for Focus",
    angle: "a clean LinkedIn feed",
  },
  {
    keyword: "LinkedIn feed productivity",
    title: "LinkedIn Feed for Productivity",
    angle: "LinkedIn productivity",
  },
  {
    keyword: "LinkedIn focus mode",
    title: "LinkedIn Focus Mode Guide",
    angle: "LinkedIn focus mode",
  },
  {
    keyword: "stop LinkedIn distractions",
    title: "Stop LinkedIn Distractions",
    angle: "reducing LinkedIn distractions",
  },
  {
    keyword: "LinkedIn feed cleaner",
    title: "What a LinkedIn Feed Cleaner Does",
    angle: "using a LinkedIn feed cleaner",
  },
  {
    keyword: "LinkedIn chrome extension",
    title: "LinkedIn Chrome Extension Guide",
    angle: "using a LinkedIn Chrome extension",
  },
];

const PROFESSION_TIPS_VARIANTS = [
  { keyword: "LinkedIn Tips for Recruiters", title: "LinkedIn Tips for Recruiters", angle: "LinkedIn tips for recruiters" },
  { keyword: "LinkedIn Tips for Sales Teams", title: "LinkedIn Tips for Sales Teams", angle: "LinkedIn tips for sales teams" },
  { keyword: "LinkedIn Tips for Marketers", title: "LinkedIn Tips for Marketers", angle: "LinkedIn tips for marketers" },
  { keyword: "LinkedIn Tips for Founders", title: "LinkedIn Tips for Founders", angle: "LinkedIn tips for founders" },
  { keyword: "LinkedIn Tips for Consultants", title: "LinkedIn Tips for Consultants", angle: "LinkedIn tips for consultants" },
  { keyword: "LinkedIn Tips for Job Seekers", title: "LinkedIn Tips for Job Seekers", angle: "LinkedIn tips for job seekers" },
  { keyword: "LinkedIn Tips for HR Teams", title: "LinkedIn Tips for HR Teams", angle: "LinkedIn tips for HR teams" },
  { keyword: "LinkedIn Tips for Developers", title: "LinkedIn Tips for Developers", angle: "LinkedIn tips for developers" },
  { keyword: "LinkedIn Tips for Designers", title: "LinkedIn Tips for Designers", angle: "LinkedIn tips for designers" },
  { keyword: "LinkedIn Tips for Lawyers", title: "LinkedIn Tips for Lawyers", angle: "LinkedIn tips for lawyers" },
];

const PROFILE_TIPS_VARIANTS = [
  { keyword: "LinkedIn Headline Tips", title: "LinkedIn Headline Tips", angle: "writing a stronger LinkedIn headline" },
  { keyword: "LinkedIn Profile Tips", title: "LinkedIn Profile Tips", angle: "improving a LinkedIn profile" },
  { keyword: "LinkedIn About Section Tips", title: "LinkedIn About Section Tips", angle: "improving the LinkedIn About section" },
  { keyword: "LinkedIn Banner Tips", title: "LinkedIn Banner Tips", angle: "using a better LinkedIn banner" },
  { keyword: "LinkedIn Featured Section Tips", title: "LinkedIn Featured Section Tips", angle: "using the LinkedIn Featured section" },
  { keyword: "LinkedIn Experience Section Tips", title: "LinkedIn Experience Tips", angle: "improving the LinkedIn Experience section" },
];

const NETWORKING_TIPS_VARIANTS = [
  { keyword: "LinkedIn Networking Tips", title: "LinkedIn Networking Tips", angle: "building a stronger LinkedIn network" },
  { keyword: "LinkedIn Connection Request Tips", title: "LinkedIn Connection Tips", angle: "sending better connection requests" },
  { keyword: "LinkedIn DM Tips", title: "LinkedIn DM Tips", angle: "writing better LinkedIn direct messages" },
  { keyword: "LinkedIn Follow-Up Tips", title: "LinkedIn Follow-Up Tips", angle: "following up better on LinkedIn" },
  { keyword: "LinkedIn Search Tips", title: "LinkedIn Search Tips", angle: "searching better on LinkedIn" },
  { keyword: "LinkedIn Outreach Tips", title: "LinkedIn Outreach Tips", angle: "doing warmer outreach on LinkedIn" },
];

const CONTENT_TIPS_VARIANTS = [
  { keyword: "LinkedIn Content Tips", title: "LinkedIn Content Tips", angle: "posting better content on LinkedIn" },
  { keyword: "LinkedIn Post Writing Tips", title: "LinkedIn Post Writing Tips", angle: "writing stronger LinkedIn posts" },
  { keyword: "LinkedIn Commenting Tips", title: "LinkedIn Commenting Tips", angle: "commenting more intentionally on LinkedIn" },
  { keyword: "LinkedIn Posting Tips", title: "LinkedIn Posting Tips", angle: "posting more consistently on LinkedIn" },
  { keyword: "LinkedIn Engagement Tips", title: "LinkedIn Engagement Tips", angle: "getting more useful engagement on LinkedIn" },
  { keyword: "LinkedIn Carousel Tips", title: "LinkedIn Carousel Tips", angle: "using LinkedIn carousel posts well" },
];

const LEADGEN_TIPS_VARIANTS = [
  { keyword: "LinkedIn Lead Gen Tips", title: "LinkedIn Lead Gen Tips", angle: "using LinkedIn for lead generation" },
  { keyword: "LinkedIn Prospecting Tips", title: "LinkedIn Prospecting Tips", angle: "prospecting better on LinkedIn" },
  { keyword: "LinkedIn Social Selling Tips", title: "LinkedIn Social Selling Tips", angle: "doing social selling on LinkedIn" },
  { keyword: "LinkedIn Inbound Tips", title: "LinkedIn Inbound Tips", angle: "creating more inbound demand from LinkedIn" },
  { keyword: "LinkedIn Sales Navigator Tips", title: "Sales Navigator Tips", angle: "using Sales Navigator better" },
  { keyword: "LinkedIn Discovery Call Tips", title: "LinkedIn Discovery Tips", angle: "turning LinkedIn conversations into calls" },
];

const JOB_SEARCH_TIPS_VARIANTS = [
  { keyword: "LinkedIn Job Search Tips", title: "LinkedIn Job Search Tips", angle: "using LinkedIn better during a job search" },
  { keyword: "LinkedIn Open to Work Tips", title: "Open to Work Tips", angle: "using Open to Work well on LinkedIn" },
  { keyword: "LinkedIn Interview Tips", title: "LinkedIn Interview Tips", angle: "using LinkedIn before interviews" },
  { keyword: "LinkedIn Resume Tips", title: "LinkedIn Resume Tips", angle: "aligning a resume with LinkedIn" },
  { keyword: "LinkedIn Application Tips", title: "LinkedIn Application Tips", angle: "applying more intentionally through LinkedIn" },
  { keyword: "LinkedIn Job Alert Tips", title: "LinkedIn Job Alert Tips", angle: "using LinkedIn job alerts better" },
];

const PERSONAL_BRAND_TIPS_VARIANTS = [
  { keyword: "LinkedIn Personal Brand Tips", title: "Personal Brand Tips", angle: "building a stronger LinkedIn personal brand" },
  { keyword: "LinkedIn Thought Leadership Tips", title: "Thought Leadership Tips", angle: "showing thought leadership on LinkedIn" },
  { keyword: "LinkedIn Visibility Tips", title: "LinkedIn Visibility Tips", angle: "improving visibility on LinkedIn" },
  { keyword: "LinkedIn Credibility Tips", title: "LinkedIn Credibility Tips", angle: "building more credibility on LinkedIn" },
  { keyword: "LinkedIn Authority Tips", title: "LinkedIn Authority Tips", angle: "building authority on LinkedIn" },
  { keyword: "LinkedIn Creator Tips", title: "LinkedIn Creator Tips", angle: "using LinkedIn more like a creator" },
];

const TITLE_SUFFIXES_BY_CATEGORY = {
  ads: [
    "",
    "Fast",
    "Today",
    "Now",
    "{year}",
    "on Chrome",
    "for Work",
    "Guide",
    "Tips",
    "Explained",
    "Quick Guide",
    "Setup",
    "Quick Fix",
    "Chrome Guide",
    "at Work",
    "Work Tips",
    "Feed Tips",
    "Less Noise",
    "Quick Tips",
    "Ad Guide",
    "Work Guide",
    "{month} {year}",
  ],
  reactions: [
    "",
    "Fast",
    "Today",
    "Now",
    "{year}",
    "on Chrome",
    "for Work",
    "Guide",
    "Tips",
    "Explained",
    "Quick Guide",
    "Setup",
    "Quick Fix",
    "Chrome Guide",
    "at Work",
    "{month} {year}",
  ],
  shares: [
    "",
    "Fast",
    "Today",
    "Now",
    "{year}",
    "on Chrome",
    "for Work",
    "Guide",
    "Tips",
    "Explained",
    "Quick Guide",
    "Setup",
    "Quick Fix",
    "Chrome Guide",
    "at Work",
    "{month} {year}",
  ],
  suggested: [
    "",
    "Fast",
    "Today",
    "Now",
    "{year}",
    "on Chrome",
    "for Work",
    "Guide",
    "Tips",
    "Explained",
    "Quick Guide",
    "Setup",
    "Quick Fix",
    "Chrome Guide",
    "at Work",
    "{month} {year}",
  ],
  persona: [
    "",
    "{year}",
    "for Work",
    "at Work",
    "Guide",
    "Tips",
    "Quick Guide",
    "Checklist",
    "Playbook",
    "Focus Guide",
    "Daily Tips",
    "Chrome Guide",
    "Today",
    "Now",
    "{month} {year}",
  ],
  comparison: [
    "",
    "Compared",
    "Guide",
    "Review",
    "{year}",
    "on Chrome",
    "Quick Guide",
    "Explained",
    "Side by Side",
    "Checklist",
    "Today",
    "Now",
    "at Work",
    "Chrome Guide",
    "{month} {year}",
  ],
  strategy: [
    "",
    "{year}",
    "for Work",
    "at Work",
    "Guide",
    "Tips",
    "Quick Guide",
    "Focus Guide",
    "Daily Tips",
    "Explained",
    "Today",
    "Now",
    "Chrome Guide",
    "Checklist",
    "{month} {year}",
  ],
  professionTips: [
    "",
    "{year}",
    "Guide",
    "Tips",
    "Playbook",
    "Checklist",
    "for Work",
    "Today",
    "{month} {year}",
  ],
  profileTips: [
    "",
    "{year}",
    "Guide",
    "Tips",
    "Checklist",
    "for Work",
    "Today",
    "{month} {year}",
  ],
  networkingTips: [
    "",
    "{year}",
    "Guide",
    "Tips",
    "Playbook",
    "Checklist",
    "Today",
    "{month} {year}",
  ],
  contentTips: [
    "",
    "{year}",
    "Guide",
    "Tips",
    "Checklist",
    "Today",
    "{month} {year}",
  ],
  leadGenTips: [
    "",
    "{year}",
    "Guide",
    "Tips",
    "Playbook",
    "Checklist",
    "Today",
    "{month} {year}",
  ],
  jobSearchTips: [
    "",
    "{year}",
    "Guide",
    "Tips",
    "Checklist",
    "Today",
    "{month} {year}",
  ],
  personalBrandTips: [
    "",
    "{year}",
    "Guide",
    "Tips",
    "Playbook",
    "Checklist",
    "Today",
    "{month} {year}",
  ],
};

const WHY_TITLE_SUFFIXES_BY_CATEGORY = {
  reactions: [
    "",
    "Today",
    "Now",
    "{year}",
    "Explained",
    "Guide",
    "Quick Guide",
    "for Work",
    "on Chrome",
    "at Work",
    "Quick Fix",
    "{month} {year}",
  ],
  shares: [
    "",
    "Today",
    "Now",
    "{year}",
    "Explained",
    "Guide",
    "Quick Guide",
    "for Work",
    "on Chrome",
    "at Work",
    "Quick Fix",
    "{month} {year}",
  ],
  suggested: [
    "",
    "Today",
    "Now",
    "{year}",
    "Explained",
    "Guide",
    "Quick Guide",
    "for Work",
    "on Chrome",
    "at Work",
    "Quick Fix",
    "{month} {year}",
  ],
  persona: [
    "",
    "{year}",
    "Guide",
    "Tips",
    "for Work",
    "at Work",
    "Quick Guide",
    "Checklist",
    "Focus Guide",
    "Today",
    "Now",
    "{month} {year}",
  ],
  strategy: [
    "",
    "{year}",
    "Guide",
    "Tips",
    "for Work",
    "at Work",
    "Quick Guide",
    "Focus Guide",
    "Today",
    "Now",
    "{month} {year}",
  ],
};

const COLON_SUFFIXES = new Set([
  "Guide",
  "Tips",
  "Review",
  "Setup",
  "Checklist",
  "Explained",
  "Quick Guide",
  "Chrome Guide",
  "Focus Guide",
  "Playbook",
  "Daily Tips",
  "Side by Side",
]);

function slugify(input) {
  return String(input)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

function monthNameFor(dateStr) {
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  return date.toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
}

function shortMonthNameFor(dateStr) {
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
}

function isoToPretty(dateStr) {
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function todayInLisbon() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDaysIso(dateStr, days) {
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function* dateRange(startISO, endISO) {
  const start = new Date(`${startISO}T00:00:00.000Z`);
  const end = new Date(`${endISO}T00:00:00.000Z`);
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    yield d.toISOString().slice(0, 10);
  }
}

function byCategory(category) {
  switch (category) {
    case "ads":
      return ADS_VARIANTS;
    case "reactions":
      return REACTION_VARIANTS;
    case "shares":
      return SHARE_VARIANTS;
    case "suggested":
      return SUGGESTED_VARIANTS;
    case "persona":
      return PERSONA_VARIANTS;
    case "comparison":
      return COMPARISON_VARIANTS;
    case "strategy":
      return STRATEGY_VARIANTS;
    case "professionTips":
      return PROFESSION_TIPS_VARIANTS;
    case "profileTips":
      return PROFILE_TIPS_VARIANTS;
    case "networkingTips":
      return NETWORKING_TIPS_VARIANTS;
    case "contentTips":
      return CONTENT_TIPS_VARIANTS;
    case "leadGenTips":
      return LEADGEN_TIPS_VARIANTS;
    case "jobSearchTips":
      return JOB_SEARCH_TIPS_VARIANTS;
    case "personalBrandTips":
      return PERSONAL_BRAND_TIPS_VARIANTS;
    default:
      throw new Error(`Unknown category: ${category}`);
  }
}

function isTipsCategory(category) {
  return TIPS_CATEGORIES.has(category);
}

function composeUniqueTitle(baseTitle, primarySuffix, secondarySuffix) {
  let title = baseTitle;

  if (primarySuffix) {
    if (COLON_SUFFIXES.has(primarySuffix)) {
      title = `${title}: ${primarySuffix}`;
    } else if (title.endsWith("?")) {
      title = `${title.slice(0, -1)} ${primarySuffix}?`;
    } else {
      title = `${title} ${primarySuffix}`;
    }
  }

  if (secondarySuffix) {
    if (title.toLowerCase().includes(secondarySuffix.toLowerCase())) return title;
    if (COLON_SUFFIXES.has(secondarySuffix)) {
      title = `${title}: ${secondarySuffix}`;
    } else if (title.endsWith("?")) {
      title = `${title.slice(0, -1)} ${secondarySuffix}?`;
    } else {
      title = `${title} ${secondarySuffix}`;
    }
  }

  return title;
}

function listScheduledDatePrefixes() {
  if (!fs.existsSync(SCHEDULED_DIR)) return [];

  return fs.readdirSync(SCHEDULED_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name.slice(0, 10))
    .filter((prefix) => /^\d{4}-\d{2}-\d{2}$/.test(prefix))
    .sort();
}

function listPostFolderNames() {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs.readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function removeScheduledDuplicates() {
  if (!fs.existsSync(SCHEDULED_DIR)) return [];

  const published = new Set(listPostFolderNames());
  const removed = [];

  for (const entry of fs.readdirSync(SCHEDULED_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!published.has(entry.name)) continue;

    fs.rmSync(path.join(SCHEDULED_DIR, entry.name), { recursive: true, force: true });
    removed.push(entry.name);
  }

  return removed.sort();
}

function resolveModifier(modifier, dateISO) {
  if (!modifier) return "";
  const year = String(dateISO).slice(0, 4);
  const month = monthNameFor(dateISO);
  return modifier.replaceAll("{year}", year).replaceAll("{month}", month);
}

function suffixesForTitle(category, baseTitle) {
  if (/^why\b/i.test(baseTitle)) {
    return WHY_TITLE_SUFFIXES_BY_CATEGORY[category] || TITLE_SUFFIXES_BY_CATEGORY[category] || [""];
  }

  return TITLE_SUFFIXES_BY_CATEGORY[category] || [""];
}

function titleScore(title) {
  const length = title.length;

  if (length > MAX_TITLE_LENGTH) return 10_000 + length;
  if (length >= IDEAL_TITLE_MIN && length <= IDEAL_TITLE_MAX) return Math.abs(35 - length);
  if (length < IDEAL_TITLE_MIN) return 500 + (IDEAL_TITLE_MIN - length);
  return 1_000 + (length - IDEAL_TITLE_MAX);
}

function buildTitleCandidates(category, baseTitle, dateISO) {
  const candidates = suffixesForTitle(category, baseTitle).map((suffix) =>
    composeUniqueTitle(baseTitle, resolveModifier(suffix, dateISO), "")
  );

  return Array.from(new Set(candidates))
    .map((title, index) => ({ title, index }))
    .sort((a, b) => {
      const scoreDiff = titleScore(a.title) - titleScore(b.title);
      return scoreDiff !== 0 ? scoreDiff : a.index - b.index;
    })
    .map((entry) => entry.title);
}

function chooseUniqueTitle({ category, baseTitle, dateISO, repeatIndex, usedTitles }) {
  const candidates = buildTitleCandidates(category, baseTitle, dateISO);
  for (const candidate of candidates) {
    if (!usedTitles.has(candidate) && candidate.length <= MAX_TITLE_LENGTH) {
      return candidate;
    }
  }

  const year = String(dateISO).slice(0, 4);
  const monthShort = shortMonthNameFor(dateISO);
  const day = String(Number(dateISO.slice(8, 10)));
  const datedFallbacks = [
    `${monthShort} ${year}`,
    `${monthShort} ${day}`,
    `${day} ${monthShort}`,
    `${monthShort} Guide`,
    `${monthShort} Tips`,
    `${monthShort} Update`,
    `${day} ${monthShort} ${year}`,
  ];

  for (const suffix of datedFallbacks) {
    const fallback = composeUniqueTitle(baseTitle, suffix, "");
    if (fallback.length <= MAX_TITLE_LENGTH && !usedTitles.has(fallback)) {
      return fallback;
    }
  }

  for (let attempt = repeatIndex + 2; attempt < 100; attempt += 1) {
    const fallback = composeUniqueTitle(baseTitle, `${monthShort} ${attempt}`, "");
    if (fallback.length <= MAX_TITLE_LENGTH && !usedTitles.has(fallback)) {
      return fallback;
    }
  }

  throw new Error(`Unable to generate a unique compact title for "${baseTitle}"`);
}

function pickVariant(category, dayIndex, dateISO, usedTitles) {
  const variants = byCategory(category);
  const variant = variants[dayIndex % variants.length];
  const repeatIndex = Math.floor(dayIndex / variants.length);
  const title = chooseUniqueTitle({
    category,
    baseTitle: variant.title,
    dateISO,
    repeatIndex,
    usedTitles,
  });

  return {
    ...variant,
    title,
  };
}

function buildMetaDescription(title, category) {
  const normalizedTitle = String(title).replace(/[.?!]+$/, "");
  if (isTipsCategory(category)) {
    return `${normalizedTitle}. Practical LinkedIn advice for better profiles, networking, content, visibility, and day-to-day workflow.`;
  }
  return `${normalizedTitle}. Learn why it appears in the LinkedIn feed, what native settings can and cannot do, and how LinkTopics helps reduce feed noise.`;
}

function buildIntro({ category, keyword, angle, pattern }) {
  const focusPattern = pattern || angle;

  if (isTipsCategory(category)) {
    return `If you are searching for ${keyword}, you are probably trying to use LinkedIn with more intention instead of relying on random habits, noisy scrolling, or generic advice that does not match your real workflow.`;
  }

  switch (category) {
    case "ads":
      return `If you are searching for ${keyword}, you are probably trying to stop promoted content from interrupting the part of LinkedIn that should feel most useful and relevant.`;
    case "reactions":
      return `If you are searching for ${keyword}, you are probably trying to stop ${focusPattern} from pushing more relevant updates out of view.`;
    case "shares":
      return `If you are searching for ${keyword}, you are probably trying to reduce ${focusPattern} without muting people you still want to learn from.`;
    case "suggested":
      return `If you are searching for ${keyword}, you are probably trying to get back to a feed led by your network instead of algorithmic insertions.`;
    case "persona":
      return `If you are searching for ${keyword}, you are probably trying to make LinkedIn feel more useful during real work instead of letting feed noise shape your attention.`;
    case "comparison":
      return `If you are comparing ${keyword}, you are probably trying to work out which option actually removes recurring LinkedIn feed noise instead of only offering cosmetic cleanup.`;
    case "strategy":
      return `If you are searching for ${keyword}, you are probably looking for a more intentional way to use LinkedIn without wasting attention on low-value feed patterns.`;
    default:
      return `If you are searching for ${keyword}, you are probably trying to reduce ${angle} and make LinkedIn feel calmer, more relevant, and easier to use with intent.`;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function standfirstFor({ category, keyword, angle }) {
  if (isTipsCategory(category)) {
    return `LinkedIn works better when the feed, profile, and day-to-day habits support your actual goals. Here is a practical take on ${angle} without generic advice or empty productivity clichés.`;
  }

  switch (category) {
    case "ads":
      return "LinkedIn keeps inserting promoted content into a feed that should be about work. Here is how to understand ads and promoted posts, and reduce them with less manual cleanup.";
    case "reactions":
      return `Reaction-driven updates like “likes this”, “loves this”, and “celebrates this” often create more noise than value. Here is how to understand ${angle} and keep your feed focused.`;
    case "shares":
      return `Shared and reshared updates can quickly dominate a professional feed. Here is how to reduce ${angle} without muting people you still want to follow.`;
    case "suggested":
      return `LinkedIn increasingly pushes recommendations into the feed. Here is how to understand ${angle} and reduce them when they stop being useful.`;
    case "persona":
      return `If you care about signal over noise on LinkedIn, feed quality matters more than most people realise. Here is how to think about ${angle} in a more practical way.`;
    case "comparison":
      return `Not every LinkedIn cleanup tool solves the same problem. Here is how to evaluate ${angle} and choose the option that actually improves feed quality.`;
    case "strategy":
      return `A calmer feed can change how you use LinkedIn day to day. Here is a practical look at ${angle} and why cleaner inputs lead to better outcomes.`;
    default:
      return `If you are searching for how to ${keyword}, you are probably trying to reduce ${angle} and get a cleaner LinkedIn experience.`;
  }
}

function subjectFor({ angle, pattern }) {
  return pattern || angle;
}

function headlinePattern(pattern) {
  return String(pattern || "")
    .replace(/\b[a-z]/g, (char) => char.toUpperCase())
    .replace(/\bPosts\b/g, "Posts");
}

function labelPhrase(pattern) {
  return String(pattern || "").replace(/\s+posts?$/i, "");
}

function whyHeadingFor({ category, pattern }) {
  if (isTipsCategory(category)) {
    return "Why Better LinkedIn Habits Still Matter";
  }

  switch (category) {
    case "ads":
      return "Why LinkedIn Keeps Showing Promoted and Sponsored Posts";
    case "reactions":
      return `Why LinkedIn Keeps Showing ${headlinePattern(pattern || "reaction posts")}`;
    case "shares":
      return `Why LinkedIn Keeps Showing ${headlinePattern(pattern || "reposted posts")}`;
    case "suggested":
      return `Why LinkedIn Keeps Showing ${headlinePattern(pattern || "suggested posts")}`;
    case "persona":
      return "Why Feed Noise Starts Hurting Your Workflow";
    case "comparison":
      return "Why People Compare LinkedIn Feed-Cleaning Options";
    case "strategy":
      return "Why LinkedIn Feed Quality Matters";
    default:
      return "Why This Pattern Keeps Appearing in LinkedIn";
  }
}

function exampleLabelsFor({ category }) {
  switch (category) {
    case "ads":
      return ["Promoted", "Sponsored"];
    case "reactions":
      return ["likes this", "loves this", "celebrates this", "supports this", "finds this insightful"];
    case "shares":
      return ["reposted this", "shared this", "reshared this"];
    case "suggested":
      return ["Suggested", "Suggested for you", "Recommended", "Because you follow"];
    default:
      return [];
  }
}

function whyLinkedInShowsSection({ category, angle, pattern }) {
  const subject = subjectFor({ angle, pattern });

  if (isTipsCategory(category)) {
    return `LinkedIn can be useful for visibility, research, hiring, sales, and job discovery, but most people never shape the platform around their real goals. They react to whatever the feed gives them instead of building a workflow that makes LinkedIn more relevant and less noisy.`;
  }

  switch (category) {
    case "ads":
      return "LinkedIn inserts ads and promoted posts directly into the main feed because they are part of the platform's revenue model. The result is a browsing experience where commercial posts compete with real updates from your network.";
    case "reactions":
      return `LinkedIn boosts updates marked with labels like ${labelPhrase(subject)} because engagement is treated as a relevance signal. When someone in your network reacts to a post, LinkedIn assumes that social proof is enough reason to show it to you too.`;
    case "shares":
      return `LinkedIn amplifies ${subject} because reposts and shares extend distribution without requiring original content. This helps the platform keep the feed active, even when the content itself is not directly relevant to you.`;
    case "suggested":
      return `LinkedIn surfaces ${subject} to increase discovery and keep the feed feeling active. Instead of showing only updates from people and companies you follow, the algorithm adds posts it believes might hold your attention.`;
    case "persona":
      return `The problem with ${angle} is rarely one single post. It is the cumulative effect of reactions, reposts, ads, and recommendations slowly replacing the updates you actually opened LinkedIn to see.`;
    case "comparison":
      return "People compare LinkedIn feed-cleaning options because the platform mixes ads, reactions, reposts, and recommendations into one stream. The real question is which option removes recurring feed noise reliably instead of only offering cosmetic relief.";
    case "strategy":
      return `The reason ${angle} matters is simple: LinkedIn now mixes network updates, engagement bait, recommendations, and ads in the same stream. Without some filtering, that mix slowly erodes focus.`;
    default:
      return `LinkedIn uses engagement and discovery signals to decide what appears in the feed, which is why ${angle} keeps showing up more often than many users expect.`;
  }
}

function nativeControlsSection({ category, angle, pattern }) {
  const subject = subjectFor({ angle, pattern });

  if (isTipsCategory(category)) {
    return "LinkedIn gives you plenty of features, but it does not tell you how to combine them into a calm, repeatable workflow. Native controls help with profile edits, notifications, and individual post cleanup, yet they still leave most people with too much noise and too little structure.";
  }

  switch (category) {
    case "comparison":
      return "LinkedIn gives you basic controls such as Hide this post, unfollow, and feed sorting, but it does not provide recurring category-level filtering. That is why Premium, native settings, and generic blockers are not the same thing as a dedicated LinkedIn feed cleaner.";
    case "strategy":
      return `Native controls help a little: you can hide a post, unfollow a source, or change your feed view. But they do not solve recurring patterns at scale, which is why people looking to improve ${angle} usually end up repeating the same actions again and again.`;
    default:
      return `LinkedIn lets you hide specific posts and adjust some feed preferences, but those controls do not remove ${subject} globally. In practice, manual cleanup helps for a moment and then the same pattern returns in a slightly different form.`;
  }
}

function linkTopicsSection({ category }) {
  const label = CATEGORY_CONTEXT[category]?.label || "feed noise";

  if (isTipsCategory(category)) {
    return "LinkTopics fits into this workflow by cleaning the feed layer first. When promoted posts, reaction-driven cards, reshared content, and suggestions stop competing for attention, it becomes much easier to apply better profile, networking, content, and research habits consistently.";
  }

  switch (category) {
    case "comparison":
      return "LinkTopics is built specifically for LinkedIn feed cleanup. Instead of behaving like a generic blocker or an account-upgrade bundle, it targets native feed categories directly, which makes comparison articles easier to answer in practical terms.";
    case "strategy":
      return "LinkTopics is built specifically for LinkedIn feed cleanup. That matters because strategy around attention only works when the tool can actually remove the patterns that keep breaking focus.";
    default:
      return `LinkTopics is built specifically for LinkedIn feed cleanup. Instead of behaving like a generic blocker, it targets categories such as ${label}, so your feed becomes calmer, more relevant, and easier to use with intent.`;
  }
}

function headerSummaryFor() {
  return "Practical guidance for a cleaner, more intentional LinkedIn feed.";
}

function quickAnswerFor({ category, angle, pattern }) {
  const subject = subjectFor({ angle, pattern });

  if (isTipsCategory(category)) {
    return `Quick answer: the best LinkedIn advice is usually operational, not motivational. Build a cleaner feed first, then improve the profile, networking, content, or outreach habit that matches your real objective.`;
  }

  switch (category) {
    case "ads":
      return "Quick answer: LinkedIn does not provide a global switch to remove promoted or sponsored feed ads. You can hide them one by one, but the scalable approach is a LinkedIn-specific filter that hides native ad cards automatically.";
    case "reactions":
      return `Quick answer: LinkedIn does not provide a global setting to remove ${subject}. Manual hiding works temporarily, but a LinkedIn-specific feed filter is the practical way to keep this pattern out of sight.`;
    case "shares":
      return `Quick answer: there is no native global toggle for ${subject}. If you want a cleaner feed, you either hide them one by one or use a feed filter that recognises repost and reshare patterns automatically.`;
    case "suggested":
      return `Quick answer: LinkedIn does not give you a native global option to turn off ${subject}. The platform keeps reinserting them, so manual cleanup helps only briefly.`;
    case "persona":
      return `Quick answer: if LinkedIn is part of your daily workflow, reducing feed noise is not cosmetic. It changes how quickly you find relevant updates and how often you get pulled into low-value scrolling.`;
    case "comparison":
      return "Quick answer: LinkedIn Premium, native settings, and generic blockers each help with something, but a LinkedIn-specific filter usually gives better feed control because it recognises native feed patterns rather than only classic ad elements.";
    case "strategy":
      return "Quick answer: cleaner inputs create better decisions. When the LinkedIn feed becomes less noisy, it is easier to research, prioritise, and act on the posts that actually matter.";
    default:
      return `Quick answer: if you want to reduce ${angle}, native LinkedIn controls only go part of the way. A more intentional feed usually requires a dedicated filtering workflow.`;
  }
}

function keyTakeawaysFor({ category, keyword, angle, pattern }) {
  const subject = subjectFor({ angle, pattern });

  if (isTipsCategory(category)) {
    return [
      "Good LinkedIn results usually come from systems, not from checking the feed more often.",
      "A cleaner feed makes profile, networking, content, and outreach tactics easier to execute consistently.",
      `${keyword} is usually a search for more useful professional habits, not just vanity metrics.`,
      "Practical LinkedIn improvement starts by reducing noise and clarifying what the platform is for in your workflow.",
    ];
  }

  switch (category) {
    case "ads":
      return [
        "LinkedIn feed ads are native placements, not classic side-banner ads.",
        "Hiding one promoted post does not stop the next one from appearing.",
        `Searches like “${keyword}” usually come from people who want feed control, not just fewer ads.`,
        "A LinkedIn-specific filter scales better than manual hiding.",
      ];
    case "reactions":
      return [
        "LinkedIn shows these posts because reactions act as distribution signals.",
        "There is no native global setting to disable this category of feed noise.",
        "Manual hiding is repetitive because the same pattern keeps returning.",
        "A dedicated LinkedIn filter can remove these cards more consistently.",
      ];
    case "shares":
      return [
        "Reposts multiply the same content across different parts of your network.",
        "Muting one person rarely removes the broader repost pattern.",
        `Searches like “${keyword}” are usually about restoring feed relevance.`,
        "A category-level filter works better than one-post-at-a-time cleanup.",
      ];
    case "suggested":
      return [
        `${subject.charAt(0).toUpperCase()}${subject.slice(1)} are designed to increase discovery and engagement.`,
        "LinkedIn does not offer a native global switch to turn them off.",
        "These cards often crowd out updates from the people and companies you follow.",
        "A LinkedIn-focused filter is the fastest way to reduce them consistently.",
      ];
    case "persona":
      return [
        "Feed quality affects how useful LinkedIn feels during real work.",
        "Noise compounds across ads, suggestions, reactions, and reposts.",
        `${keyword} is really a search for better relevance, not just fewer distractions.`,
        "Cleaner inputs usually lead to faster, more confident decisions.",
      ];
    case "comparison":
      return [
        "Not every blocker solves native LinkedIn feed noise.",
        "Generic ad blockers often miss reactions, reposts, and recommendation cards.",
        "The right comparison is about feed control, not just feature count.",
        "LinkedIn-specific tools tend to match native feed structures more reliably.",
      ];
    case "strategy":
      return [
        "A cleaner feed is a productivity lever, not just a preference.",
        "Less noise means fewer interruptions and faster scanning.",
        `Queries like “${keyword}” usually reflect a need for better signal-to-noise ratio.`,
        "A repeatable filtering system works better than reactive cleanup.",
      ];
    default:
      return [
        "LinkedIn feed noise usually comes from recurring patterns, not one isolated post.",
        "Native cleanup helps, but it rarely solves the problem at category level.",
        "Better feed quality improves focus and relevance.",
        "A dedicated LinkedIn filtering workflow scales better over time.",
      ];
  }
}

function supportedFeatureList() {
  return [
    "Free: hide Sponsored and Promoted posts in the main feed.",
    "Pro: hide Liked and Reacted posts such as “likes this”, “loves this”, and “celebrates this”.",
    "Pro: hide Shared and Reshared posts.",
    "Pro: hide Suggested and Recommended posts.",
    "Each category can be controlled from the extension popup while you browse LinkedIn on desktop Chrome.",
  ];
}

function extraSectionFor({ category, keyword, angle, pattern }) {
  const subject = subjectFor({ angle, pattern });

  if (isTipsCategory(category)) {
    return {
      title: "A Simple Way to Apply This in Real Work",
      body: `
        <p>The easiest way to make ${escapeHtml(angle)} useful is to connect it to a weekly routine instead of treating it like one more productivity idea.</p>
        <ol>
          <li>Clean the feed so research and updates are easier to scan.</li>
          <li>Decide what LinkedIn is for this week: hiring, prospecting, content, job search, or networking.</li>
          <li>Use one focused habit that supports that goal instead of trying to do everything at once.</li>
          <li>Review what actually created better conversations, visibility, or opportunities.</li>
        </ol>
      `,
    };
  }

  switch (category) {
    case "comparison":
      return {
        title: "How the Main Options Differ",
        body: `
          <p>The real comparison is not only about price or brand recognition. It is about how much native LinkedIn feed noise each option can actually remove.</p>
          <table style="min-width: 75px;">
            <colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup>
            <tbody>
              <tr><th><p>Option</p></th><th><p>What It Helps With</p></th><th><p>Main Limitation</p></th></tr>
              <tr><td><p>LinkedIn native controls</p></td><td><p>Hide individual posts</p></td><td><p>No category-level filtering</p></td></tr>
              <tr><td><p>Generic blockers</p></td><td><p>Some ads and cosmetic cleanup</p></td><td><p>Often miss native feed patterns</p></td></tr>
              <tr><td><p>LinkTopics</p></td><td><p>LinkedIn-specific feed categories</p></td><td><p>Focused on LinkedIn desktop workflow</p></td></tr>
            </tbody>
          </table>
        `,
      };
    case "persona":
      return {
        title: "Why This Matters in Practice",
        body: `
          <p>For many professionals, the issue is not simply distraction. It is the opportunity cost of checking LinkedIn and finding less of what matters.</p>
          <ul>
            <li>Recruiters lose time scanning around low-signal social activity.</li>
            <li>Sales teams get dragged away from buyer-relevant updates.</li>
            <li>Marketers see more viral noise and less useful market observation.</li>
            <li>Founders and consultants spend more effort filtering before they can think.</li>
          </ul>
          <p>That is why ${escapeHtml(keyword)} is really about building a more usable professional feed.</p>
        `,
      };
    case "strategy":
      return {
        title: "A Better LinkedIn Workflow in Practice",
        body: `
          <p>One of the simplest ways to make LinkedIn more useful is to treat the feed like an input system instead of an entertainment stream.</p>
          <ol>
            <li>Reduce recurring noise categories first.</li>
            <li>Protect the space where useful network updates appear.</li>
            <li>Check LinkedIn with a purpose instead of default scrolling.</li>
            <li>Let cleaner inputs shape better decisions over time.</li>
          </ol>
        `,
      };
    default:
      return {
        title: "How to Reduce It Without Breaking Your Workflow",
        body: `
          <p>If your goal is to reduce ${escapeHtml(subject)} without turning LinkedIn into a maintenance project, the key is to remove the recurring pattern rather than reacting to each post one by one.</p>
          <p>That is where a LinkedIn-specific feed filter becomes more useful than manual cleanup. You do the setup once and stop repeating the same action every time the platform reinserts similar cards.</p>
        `,
      };
  }
}

function faqEntriesFor({ category, keyword, angle, pattern }) {
  const subject = subjectFor({ angle, pattern });

  if (isTipsCategory(category)) {
    return [
      {
        q: `Why do ${keyword} matter in practice?`,
        a: "Because LinkedIn becomes much more useful when your profile, content, networking, and feed habits actually support a clear professional goal instead of default scrolling.",
      },
      {
        q: "Do I need to post every day to get value from LinkedIn?",
        a: "No. Most people benefit more from a cleaner feed, a clearer profile, and more intentional interactions than from posting frequently without a system.",
      },
      {
        q: "Why does feed quality matter for LinkedIn tips?",
        a: "Because even good tactics are harder to apply when the feed keeps interrupting attention with low-signal content. Cleaner inputs make better habits easier to sustain.",
      },
      {
        q: "Where should I start if LinkedIn feels noisy and unfocused?",
        a: "Start by reducing recurring feed noise, then improve the one LinkedIn habit that matters most right now: profile positioning, networking, content, lead generation, or job search.",
      },
    ];
  }

  switch (category) {
    case "ads":
      return [
        {
          q: "Can I disable ads on LinkedIn using native settings?",
          a: "No. LinkedIn does not provide a global setting to turn off promoted or sponsored posts in the feed. You can hide individual ads, but new ones will continue to appear.",
        },
        {
          q: "Why do promoted posts keep returning on LinkedIn?",
          a: "Promoted posts are native feed placements tied to LinkedIn’s advertising model. Hiding one ad does not stop the platform from inserting the next one.",
        },
        {
          q: "Does a generic ad blocker remove LinkedIn feed ads reliably?",
          a: "Not always. Many generic blockers focus on classic ad slots, while LinkedIn feed ads are embedded as native cards inside the main feed.",
        },
        {
          q: "What is the fastest way to reduce ads and promoted posts in the LinkedIn feed?",
          a: "The fastest option is to use a LinkedIn-specific filtering tool that recognises ads and promoted posts directly in the feed and hides them automatically as you scroll.",
        },
      ];
    case "reactions":
      return [
        {
          q: "Can I disable 'likes this' or 'celebrates this' posts on LinkedIn?",
          a: "LinkedIn does not provide a native setting to disable reaction-driven posts globally. You can hide them one by one, but the pattern keeps coming back.",
        },
        {
          q: "Why does LinkedIn show me posts just because someone reacted to them?",
          a: "LinkedIn treats reactions as engagement signals and uses them to expand distribution. That is why a single reaction can pull an unrelated post into your feed.",
        },
        {
          q: "Are 'loves this' and 'celebrates this' posts different from 'likes this' posts?",
          a: "They are variations of the same feed pattern: social activity from another person or page is used as the reason to show you the underlying post.",
        },
        {
          q: `What is the easiest way to remove ${subject}?`,
          a: `A LinkedIn-specific extension such as LinkTopics can recognise ${subject} in the feed and hide them automatically, which is much faster than hiding them manually one by one.`,
        },
      ];
    case "shares":
      return [
        {
          q: "Can I turn off reposted or reshared posts on LinkedIn?",
          a: "Not globally. LinkedIn lets you hide individual items, but there is no built-in toggle to disable shared or reposted posts as a category.",
        },
        {
          q: "Why do reposted posts feel so repetitive on LinkedIn?",
          a: "Because the same content can be distributed repeatedly through different people in your network, which makes the feed feel more repetitive than informative.",
        },
        {
          q: "Will muting one connection solve the repost problem?",
          a: "Usually not. Reposted content often comes through many people, so muting one source rarely removes the underlying pattern.",
        },
        {
          q: `What is the easiest way to reduce ${subject}?`,
          a: "A LinkedIn-specific feed filter can hide shared and reposted cards automatically, which is more reliable than manually hiding them every time they appear.",
        },
      ];
    case "suggested":
      return [
        {
          q: "Can I turn off Suggested Posts on LinkedIn?",
          a: "No. LinkedIn does not offer a global setting to disable Suggested or Recommended posts in the feed.",
        },
        {
          q: "Why does LinkedIn keep recommending posts I never asked to see?",
          a: "The platform uses discovery and engagement goals to fill the feed with content it believes may keep you scrolling, even when it is only loosely relevant.",
        },
        {
          q: "Are Suggested Posts the same as Sponsored Posts?",
          a: "No. Sponsored posts are paid placements, while Suggested posts are algorithmic recommendations inserted into the feed.",
        },
        {
          q: `What is the fastest way to reduce ${subject}?`,
          a: `The simplest approach is to use a LinkedIn-focused filtering extension that can identify Suggested and Recommended cards directly in the feed and hide them automatically.`,
        },
      ];
    case "persona":
      return [
        {
          q: `Why does ${keyword} matter in practice?`,
          a: "Because a noisy feed costs time, weakens focus, and makes research less deliberate. For professionals who depend on LinkedIn, those small interruptions compound quickly.",
        },
        {
          q: "Can native LinkedIn settings create a cleaner role-specific feed?",
          a: "Only partially. You can hide some posts and adjust what you follow, but the platform still injects ads, recommendations, and engagement-driven content.",
        },
        {
          q: "Why does feed quality matter more for some professionals than others?",
          a: "People who use LinkedIn for recruiting, prospecting, research, or hiring depend on relevance more heavily, so low-signal posts create a bigger productivity cost.",
        },
        {
          q: "What is the easiest way to make LinkedIn more focused?",
          a: "Most users get the biggest improvement by combining intentional following choices with a feed-specific filtering tool that removes recurring categories of noise.",
        },
      ];
    case "comparison":
      return [
        {
          q: "Is LinkedIn Premium the same as a feed cleaner?",
          a: "No. LinkedIn Premium adds features around visibility, search, and messaging, but it does not clean the feed or remove recurring noisy post categories.",
        },
        {
          q: "Are generic ad blockers enough for LinkedIn feed cleanup?",
          a: "Usually not. Generic blockers often miss native LinkedIn feed elements such as reaction-driven posts, suggestions, and reshared cards.",
        },
        {
          q: "What should I compare when choosing a LinkedIn feed cleaner?",
          a: "Look at category coverage, reliability against LinkedIn’s native feed cards, ease of use, and whether the tool focuses specifically on LinkedIn rather than acting as a generic blocker.",
        },
        {
          q: "Why do many users still feel noisy feeds after installing a generic blocker?",
          a: "Because feed noise is not only about ads. It also comes from recommendations, reactions, reposts, and other native LinkedIn patterns that generic tools often ignore.",
        },
      ];
    case "strategy":
      return [
        {
          q: "Why does a cleaner LinkedIn feed improve productivity?",
          a: "Because it lowers scrolling friction, reduces interruptions, and makes relevant updates easier to spot quickly.",
        },
        {
          q: "Can manual feed cleanup scale over time?",
          a: "Usually not. Manual hiding works post by post, while the underlying categories of noise keep returning.",
        },
        {
          q: "Is feed quality really a strategic advantage?",
          a: "Yes. Better inputs improve how you research, learn, and decide what deserves attention, which makes LinkedIn more useful as a professional tool.",
        },
        {
          q: "What is the simplest way to keep LinkedIn more intentional?",
          a: "Use a combination of deliberate following choices and a LinkedIn-specific filtering tool that removes the categories of content that repeatedly distract you.",
        },
      ];
    default:
      return [
        {
          q: `Can I control ${angle} directly on LinkedIn?`,
          a: "Only partially. Native controls help on a post-by-post basis, but they do not remove recurring feed categories globally.",
        },
        {
          q: `Why does ${angle} keep returning?`,
          a: "Because the feed is continuously recalculated using engagement and discovery signals, so the same pattern reappears even after manual cleanup.",
        },
        {
          q: "Will a generic blocker solve the problem?",
          a: "Not always. Native LinkedIn feed elements are harder to remove with generic tools than with a LinkedIn-specific filter.",
        },
        {
          q: `What is the easiest way to reduce ${angle}?`,
          a: "A LinkedIn-focused filtering tool is usually the fastest and most reliable option.",
        },
      ];
  }
}

function renderHtml({ title, slug, dateISO, category, keyword, angle, pattern }) {
  const prettyDate = isoToPretty(dateISO);
  const image = IMAGE_BY_CATEGORY[category];
  const description = buildMetaDescription(title, category);
  const intro = buildIntro({ category, keyword, angle, pattern });
  const standfirst = standfirstFor({ category, keyword, angle });
  const context = CATEGORY_CONTEXT[category] || CATEGORY_CONTEXT.strategy;
  const relatedSlug = RELATED_SLUG_BY_CATEGORY[category] || "/blog";
  const faqs = faqEntriesFor({ category, keyword, angle, pattern });
  const quickAnswer = quickAnswerFor({ category, keyword, angle, pattern });
  const keyTakeaways = keyTakeawaysFor({ category, keyword, angle, pattern });
  const extraSection = extraSectionFor({ category, keyword, angle, pattern });
  const headerSummary = headerSummaryFor();
  const examples = exampleLabelsFor({ category, pattern });
  const faqJson = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
    null,
    2
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="canonical" href="https://www.linktopics.me/blog/${slug}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="https://www.linktopics.me/blog/${slug}" />
  <meta property="og:site_name" content="LinkTopics" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": ${JSON.stringify(title)},
    "description": ${JSON.stringify(description)},
    "author": { "@type": "Person", "name": "Miguel Duque" },
    "publisher": {
      "@type": "Organization",
      "name": "LinkTopics",
      "logo": { "@type": "ImageObject", "url": "https://www.linktopics.me/images/logo-linktopics.png" }
    },
    "datePublished": "${dateISO}",
    "dateModified": "${dateISO}",
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://www.linktopics.me/blog/${slug}" }
  }
  </script>
  <script type="application/ld+json">
  ${faqJson}
  </script>
</head>
<body>
  <main>
    <article>
      <header>
        <h1>${title}</h1>
        <p><em>${headerSummary} Updated for ${prettyDate}.</em></p>
      </header>

      <section>
        <p>${escapeHtml(standfirst)}</p>
        <p>${escapeHtml(intro)}</p>
      </section>

      <section>
        <h2>Quick Answer</h2>
        <p>${escapeHtml(quickAnswer)}</p>
      </section>

      ${
        examples.length
          ? `
      <section>
        <h2>Common Labels You May See in the Feed</h2>
        <ul>
          ${examples.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
        <p>These labels often appear in the small context line above the main post card, which is the part many people want to remove from the feed first.</p>
      </section>`
          : ""
      }

      <section>
        <h2>Key Takeaways</h2>
        <ul>
          ${keyTakeaways.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>

      <figure>
        <img src="${image}" alt="${escapeHtml(title)}" loading="lazy" />
      </figure>

      <section>
        <h2>${escapeHtml(whyHeadingFor({ category, pattern }))}</h2>
        <p>${escapeHtml(whyLinkedInShowsSection({ category, angle, pattern }))}</p>
        <p>LinkedIn pushes more than just posts from people you follow. It also injects promoted content, social activity, recommendations, and repeated distribution patterns that make the feed harder to use intentionally.</p>
        <p>For people who rely on LinkedIn for recruiting, sales, research, hiring, or professional visibility, this extra noise adds up quickly.</p>
      </section>

      <section>
        <h2>Why This Pattern Becomes a Feed Problem</h2>
        <ul>
          <li>It pushes relevant updates further down the feed.</li>
          <li>It increases scrolling friction and weakens focus.</li>
          <li>It rewards engagement patterns more than professional relevance.</li>
          <li>It makes LinkedIn feel busier without making it more useful.</li>
        </ul>
        <p>This is one reason users search for terms such as <strong>${escapeHtml(keyword)}</strong> rather than generic social media advice.</p>
      </section>

      <section>
        <h2>Why Native Controls Usually Fall Short</h2>
        <p>${escapeHtml(nativeControlsSection({ category, angle, pattern }))}</p>
        <p>That is why manual cleanup feels repetitive: the same type of distraction keeps reappearing in slightly different forms.</p>
      </section>

      <section>
        <h2>What a Better LinkedIn Feed Should Do</h2>
        <ul>
          <li>Reduce the types of posts that break concentration.</li>
          <li>Keep the feed more relevant to your work and goals.</li>
          <li>Preserve useful content from your real network.</li>
          <li>Lower the amount of feed friction you deal with every day.</li>
        </ul>
      </section>

      <section>
        <h2>How LinkTopics Fits In</h2>
        <p>${escapeHtml(linkTopicsSection({ category }))}</p>
        <p>That makes it more useful when your goal is not just to block ads, but to shape a feed that is calmer, more relevant, and easier to use with intent.</p>
        <p><a href="${CHROME_STORE_URL}" target="_blank" rel="noopener noreferrer">👉 Install LinkTopics for free on the Chrome Web Store</a></p>
      </section>

      <section>
        <h2>What LinkTopics Can Hide Today</h2>
        <ul>
          ${supportedFeatureList().map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
        <p>This matters for credibility: feed cleanup only works well when a tool clearly targets the categories it actually supports.</p>
      </section>

      <section>
        <h2>How to Reduce This Type of Feed Noise</h2>
        <ol>
          <li>Install LinkTopics from the Chrome Web Store.</li>
          <li>Open LinkedIn and refresh your feed.</li>
          <li>Click the LinkTopics icon in your browser toolbar.</li>
          <li>Enable the filter that matches the type of noise you want to remove.</li>
          <li>Keep your feed focused on updates that actually matter to your work.</li>
        </ol>
        <p><strong>Mid-article CTA:</strong></p>
        <p><a href="${CHROME_STORE_URL}" target="_blank" rel="noopener noreferrer">👉 Clean your LinkedIn feed with LinkTopics in under 10 seconds</a></p>
      </section>

      <section>
        <h2>${extraSection.title}</h2>
        ${extraSection.body}
      </section>

      <section>
        <h2>Final Thought</h2>
        <p>If your search starts with <strong>${escapeHtml(keyword)}</strong>, the real problem is usually not one single post. It is the cumulative effect of recurring feed patterns that chip away at focus.</p>
        <p>A cleaner feed gives you a better chance of using LinkedIn as a tool instead of letting the feed use your attention.</p>
        <p>Related topic: <a href="${relatedSlug}">See another LinkTopics guide about cleaning your LinkedIn feed</a></p>
      </section>

      <section>
        <h2>Frequently Asked Questions</h2>
        ${faqs
          .map(
            (faq) => `
        <h3>${escapeHtml(faq.q)}</h3>
        <p>${escapeHtml(faq.a)}</p>`
          )
          .join("")}
      </section>
    </article>
  </main>
</body>
</html>
`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function buildQueue() {
  const items = [];
  let primaryDayIndex = 0;
  let secondaryDayIndex = 0;
  const todayISO = todayInLisbon();
  const removedScheduledDuplicates = removeScheduledDuplicates();
  const startDate = addDaysIso(todayISO, 1);
  const categoryCounts = {};
  const usedTitles = new Set();

  for (const dateISO of dateRange(startDate, END_DATE)) {
    const primaryCategory = CATEGORY_ORDER[primaryDayIndex % CATEGORY_ORDER.length];
    const primaryCategoryIndex = categoryCounts[primaryCategory] || 0;
    const primaryVariant = pickVariant(primaryCategory, primaryCategoryIndex, dateISO, usedTitles);
    const primaryTitle = primaryVariant.title;
    items.push({
      dateISO,
      slot: "am",
      track: "core",
      category: primaryCategory,
      keyword: primaryVariant.keyword,
      title: primaryTitle,
      slug: slugify(primaryTitle),
      angle: primaryVariant.angle,
      pattern: primaryVariant.pattern || "",
    });
    usedTitles.add(primaryTitle);
    categoryCounts[primaryCategory] = primaryCategoryIndex + 1;
    primaryDayIndex += 1;

    const secondaryCategory = SECONDARY_CATEGORY_ORDER[secondaryDayIndex % SECONDARY_CATEGORY_ORDER.length];
    const secondaryCategoryIndex = categoryCounts[secondaryCategory] || 0;
    const secondaryVariant = pickVariant(secondaryCategory, secondaryCategoryIndex, dateISO, usedTitles);
    const secondaryTitle = secondaryVariant.title;
    items.push({
      dateISO,
      slot: "pm",
      track: "tips",
      category: secondaryCategory,
      keyword: secondaryVariant.keyword,
      title: secondaryTitle,
      slug: slugify(secondaryTitle),
      angle: secondaryVariant.angle,
      pattern: secondaryVariant.pattern || "",
    });
    usedTitles.add(secondaryTitle);
    categoryCounts[secondaryCategory] = secondaryCategoryIndex + 1;
    secondaryDayIndex += 1;
  }

  return { items, startDate, removedScheduledDuplicates, todayISO };
}

function writeManifest(items) {
  ensureDir(path.dirname(MANIFEST_PATH));
  const csv = [
    "date,slot,track,title,slug,category,keyword",
    ...items.map((item) =>
      [
        item.dateISO,
        item.slot,
        item.track,
        JSON.stringify(item.title),
        item.slug,
        item.category,
        JSON.stringify(item.keyword),
      ].join(",")
    ),
  ].join("\n");
  fs.writeFileSync(MANIFEST_PATH, `${csv}\n`, "utf8");
}

function writeScheduledPosts(items) {
  ensureDir(SCHEDULED_DIR);
  let created = 0;
  let updated = 0;

  const existingFolders = fs.existsSync(SCHEDULED_DIR)
    ? fs.readdirSync(SCHEDULED_DIR).filter((name) => fs.statSync(path.join(SCHEDULED_DIR, name)).isDirectory())
    : [];

  for (const item of items) {
    const folderName = item.slot === "pm"
      ? `${item.dateISO}-pm-${slugify(item.title)}`
      : `${item.dateISO}-${slugify(item.title)}`;
    const existingFolderName = existingFolders
      .filter((name) => {
        if (!name.startsWith(`${item.dateISO}-`)) return false;
        if (item.slot === "pm") return name.startsWith(`${item.dateISO}-pm-`);
        return !name.startsWith(`${item.dateISO}-pm-`);
      })
      .sort()[0];
    const folderPath = path.join(SCHEDULED_DIR, existingFolderName || folderName);
    const htmlPath = path.join(folderPath, "content.html");

    if (fs.existsSync(folderPath)) {
      fs.writeFileSync(
        htmlPath,
        renderHtml({
          title: item.title,
          slug: item.slug,
          dateISO: item.dateISO,
          category: item.category,
          keyword: item.keyword,
          angle: item.angle,
          pattern: item.pattern,
        }),
        "utf8"
      );
      updated += 1;
      continue;
    }

    ensureDir(folderPath);
    fs.writeFileSync(
      htmlPath,
      renderHtml({
        title: item.title,
        slug: item.slug,
        dateISO: item.dateISO,
        category: item.category,
        keyword: item.keyword,
        angle: item.angle,
        pattern: item.pattern,
      }),
      "utf8"
    );
    created += 1;
  }

  return { created, updated };
}

const queue = buildQueue();
const result = writeScheduledPosts(queue.items);
writeManifest(queue.items);

const titleStats = queue.items.reduce(
  (stats, item) => {
    const length = item.title.length;
    stats.max = Math.max(stats.max, length);
    if (length < IDEAL_TITLE_MIN) stats.under30 += 1;
    else if (length <= IDEAL_TITLE_MAX) stats.between30and40 += 1;
    else if (length <= MAX_TITLE_LENGTH) stats.between41and50 += 1;
    else stats.over50 += 1;
    return stats;
  },
  { max: 0, under30: 0, between30and40: 0, between41and50: 0, over50: 0 }
);

console.log(
  JSON.stringify(
    {
      today: queue.todayISO,
      removedScheduledDuplicates: queue.removedScheduledDuplicates.length,
      range: { start: queue.startDate, end: END_DATE },
      totalPlanned: queue.items.length,
      created: result.created,
      updated: result.updated,
      manifest: path.relative(ROOT, MANIFEST_PATH),
      titleStats,
    },
    null,
    2
  )
);
