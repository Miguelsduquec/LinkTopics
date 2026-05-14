import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "src", "posts");
const CALENDAR_CSV = path.join(ROOT, "docs", "linktopics-seo-geo-calendar.csv");
const SITE_ORIGIN = "https://www.linktopics.me";
const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/linktopics-%E2%80%93-linkedin-fee/bdilfiejpkdfbildemdncbkblegpejfb";
const PRICING_URL = `${SITE_ORIGIN}/#pricing`;

function getLisbonNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(new Date())
    .reduce((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const time = `${parts.hour}:${parts.minute}`;
  return { date, time, key: `${date}T${time}` };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (insideQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (!insideQuotes && char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (!insideQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);
      row = [];
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);

  const [header = [], ...body] = rows;
  return body.map((cells) =>
    Object.fromEntries(
      header.map((key, index) => [String(key).trim(), String(cells[index] ?? "").trim()])
    )
  );
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function listDirNames(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function normalizeTime(value) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "09:00";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function slugify(input) {
  return String(input || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

function titleCase(input) {
  return String(input || "")
    .split(/[-/\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sentenceCase(input) {
  const trimmed = String(input || "").trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function escapeHtml(input) {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(input) {
  return escapeHtml(input);
}

function toList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toOutline(value) {
  return String(value || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDisplayDate(dateISO) {
  const [year, month, day] = String(dateISO).split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Lisbon",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

function parseInternalLinks(value) {
  return toList(value).map((rawPath) => {
    const cleaned = rawPath.trim();
    const href = cleaned.startsWith("http")
      ? cleaned
      : cleaned === "/"
      ? SITE_ORIGIN
      : `${SITE_ORIGIN}${cleaned}`;

    let label = "Related LinkTopics page";
    if (cleaned === "/") {
      label = "LinkTopics home";
    } else {
      const lastSegment = cleaned.split("/").filter(Boolean).pop() || "guide";
      label = titleCase(lastSegment);
    }

    return { href, label };
  });
}

function extractSlugFromHtml(html, folderName) {
  const canonicalMatch = String(html).match(/<link[^>]+rel=["']canonical["'][^>]+href=["'][^"']*\/blog\/([^"'/?#]+)["']/i);
  if (canonicalMatch?.[1]) return canonicalMatch[1];
  const ogMatch = String(html).match(/<meta[^>]+property=["']og:url["'][^>]+content=["'][^"']*\/blog\/([^"'/?#]+)["']/i);
  if (ogMatch?.[1]) return ogMatch[1];
  return String(folderName).slice(11);
}

function extractTitleFromHtml(html) {
  const h1Match = String(html).match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match?.[1]) return "";
  return h1Match[1].replace(/<[^>]+>/g, "").trim();
}

function readPublishedIndex() {
  const publishedSlugs = new Set();
  const publishedTitles = new Set();

  for (const folderName of listDirNames(POSTS_DIR)) {
    const htmlPath = path.join(POSTS_DIR, folderName, "content.html");
    if (!fs.existsSync(htmlPath)) continue;

    const html = fs.readFileSync(htmlPath, "utf8");
    publishedSlugs.add(extractSlugFromHtml(html, folderName));
    const title = extractTitleFromHtml(html);
    if (title) publishedTitles.add(title.toLowerCase());
  }

  return { publishedSlugs, publishedTitles };
}

function normalizeRow(raw) {
  const publishDate = raw["Publish Date"];
  const publishTime = normalizeTime(raw.Time);
  const title = raw.Title;
  const slug = raw.Slug || slugify(title);

  return {
    publishDate,
    publishTime,
    publishKey: `${publishDate}T${publishTime}`,
    title,
    slug,
    folder: `${publishDate}-${slug}`,
    cluster: raw.Cluster || "",
    icp: raw.ICP || "LinkedIn professionals",
    searchIntent: raw["Search Intent"] || "",
    funnel: (raw.Funnel || "TOFU").toUpperCase(),
    primaryKeyword: raw["Primary Keyword"] || title,
    secondaryKeywords: toList(raw["Secondary Keywords"]),
    geoQueryTarget: raw["GEO Query Target"] || "",
    articleAngle: raw["Article Angle"] || "",
    outline: toOutline(raw["H2 Outline"]),
    cta: raw.CTA || "",
    leadMagnet: raw["Lead Magnet"] || "",
    meetingAngle: raw["Meeting Angle"] || "",
    internalLinks: parseInternalLinks(raw["Internal Links"]),
    schema: raw.Schema || "",
    status: raw.Status || "",
    priority: raw.Priority || "",
    wordCount: Number(raw["Est. Word Count"] || 1400),
  };
}

function readCalendarRows() {
  if (!fs.existsSync(CALENDAR_CSV)) {
    throw new Error(`Missing calendar CSV at ${CALENDAR_CSV}`);
  }

  return parseCsv(fs.readFileSync(CALENDAR_CSV, "utf8"))
    .map(normalizeRow)
    .filter((row) => row.publishDate && row.title && row.slug)
    .filter((row) => !row.status || !/^archived$/i.test(row.status))
    .sort((a, b) => a.publishKey.localeCompare(b.publishKey) || a.title.localeCompare(b.title));
}

function chooseDueRows(rows, published, now) {
  return rows.filter(
    (row) =>
      row.publishKey <= now.key &&
      !published.publishedSlugs.has(row.slug) &&
      !published.publishedTitles.has(row.title.toLowerCase())
  );
}

function seoTitleFor(row) {
  const title = row.title;
  const candidates = [
    `${title} for a Cleaner Feed | LinkTopics`,
    `${title}: Practical Guide | LinkTopics`,
    `${title} Guide | LinkTopics`,
    `${title} | LinkTopics`,
  ];

  const best =
    candidates.find((candidate) => candidate.length >= 50 && candidate.length <= 60) ||
    candidates.find((candidate) => candidate.length <= 60) ||
    candidates[0];

  return best;
}

function metaDescriptionFor(row) {
  const base = `${sentenceCase(
    row.primaryKeyword
  )} with LinkTopics for a cleaner LinkedIn feed. Reduce distractions, improve focus, and turn feed time into productive work.`;

  if (base.length >= 145 && base.length <= 155) return base;
  if (base.length < 145) {
    return `${base.slice(0, 154 - " every day.".length)} every day.`;
  }

  return `${base.slice(0, 152).replace(/\s+\S*$/, "")}...`;
}

function buildSummary(row, displayDate) {
  const angle = row.cluster
    ? `Practical guidance for ${row.cluster.toLowerCase()} on LinkedIn.`
    : "Practical guidance for a cleaner, more intentional LinkedIn feed.";
  return `${angle} Updated for ${displayDate}.`;
}

function pickCover(row) {
  const signal = `${row.cluster} ${row.icp} ${row.title} ${row.primaryKeyword}`.toLowerCase();
  const options = [
    {
      test: /(recruit|talent|hiring|job seeker|candidate|resume)/,
      url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
      prompt: "A bright modern recruiting team reviewing LinkedIn-style candidate profiles on laptops in a glass meeting room.",
    },
    {
      test: /(sales|founder|consultant|agency|lead|prospect)/,
      url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80",
      prompt: "A consulting or sales team discussing pipeline notes around a laptop in a modern office, editorial business photography.",
    },
    {
      test: /(profile|headline|content|creator|brand|network|power user)/,
      url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
      prompt: "Professional using a laptop to optimize a LinkedIn profile and content workflow, warm editorial desk scene.",
    },
    {
      test: /(developer|engineer|product|tech|knowledge worker)/,
      url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80",
      prompt: "Focused professional at a clean desk with code and productivity tools visible, optimized for a LinkedIn feed productivity article.",
    },
  ];

  const chosen = options.find((option) => option.test.test(signal)) || {
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
    prompt: "A calm professional workspace that suggests focus, reduced distractions, and productive LinkedIn usage.",
  };

  return {
    url: chosen.url,
    prompt: chosen.prompt,
    alt: `${row.title} - LinkTopics guide cover image`,
  };
}

function buildQuickAnswer(row) {
  const question = row.geoQueryTarget || row.primaryKeyword;
  return `Yes. ${sentenceCase(
    question.replace(/\?+$/, "")
  )} by reducing the types of feed cards LinkedIn inserts for reach, then using LinkTopics to visually filter promoted, liked-by, reacted-by, shared, and suggested posts. That gives you a cleaner, calmer feed without automating actions on your account, so you can focus on the work-related updates that actually matter.`;
}

function introParagraphs(row) {
  const paragraphs = [];
  paragraphs.push(
    `If you are researching ${row.primaryKeyword}, you are probably trying to make LinkedIn feel more useful and less noisy for ${row.icp.toLowerCase()}. The problem is rarely one post in isolation. It is the repeated pattern of feed interruptions that steals focus, pushes useful updates down, and makes LinkedIn harder to use with intent.`
  );

  if (row.articleAngle) {
    paragraphs.push(
      `${sentenceCase(
        row.articleAngle
      )} That is why the right workflow is not just “hide one post and move on.” It is understanding what LinkedIn is showing, which native controls help, and where a dedicated visual filter can save you time every single day.`
    );
  } else {
    paragraphs.push(
      `That is why the right workflow is not just “hide one post and move on.” It is understanding what LinkedIn is showing, which native controls help, and where a dedicated visual filter can save you time every single day.`
    );
  }

  if (/BOFU|MOFU/.test(row.funnel)) {
    paragraphs.push(
      `For people who already know the pain, LinkTopics is the most direct next step: it filters the categories that make LinkedIn feel busy, while keeping the feed more focused on the conversations, opportunities, and updates you actually opened LinkedIn to see.`
    );
  }

  return paragraphs;
}

function sectionParagraphs(row, heading, index) {
  const lower = heading.toLowerCase();
  const keyword = row.primaryKeyword;
  const icp = row.icp.toLowerCase();

  if (/(why|means|appear|shows|showing)/.test(lower)) {
    return [
      `LinkedIn feed ranking is built to maximize distribution, discovery, and engagement, which is why searches around ${keyword} keep showing up. The platform does not think in terms of “only show me what I explicitly asked for.” It blends direct network posts with recommendations, social proof, promoted content, and distribution experiments. That can be helpful in small doses, but it becomes a productivity problem when you use LinkedIn as a work tool.`,
      `For ${icp}, that difference matters. A feed that keeps drifting toward algorithmic noise makes it harder to stay in research mode, outreach mode, hiring mode, or job-search mode. Understanding why the pattern exists makes the solution clearer: you need a way to reduce the recurring category, not just react to one post at a time.`,
    ];
  }

  if (/(manual|controls|settings|options)/.test(lower)) {
    return [
      `LinkedIn does provide some native controls, but they are limited. You can hide individual cards, give feedback on a post, adjust some recommendation settings, and occasionally tune who or what you follow. Those tools are useful for exceptions, but they do not scale well when the same category of interruption keeps returning in slightly different forms.`,
      `That is the core limitation of manual cleanup: it is reactive. Each hide action handles one card, while the underlying feed pattern stays intact. If your goal is to improve focus consistently, native settings are only the first layer. You need a repeatable way to remove a whole class of feed noise without turning LinkedIn maintenance into its own daily task.`,
    ];
  }

  if (/(privacy|safe|safety|secure|local)/.test(lower)) {
    return [
      `If privacy is part of your evaluation, the important distinction is this: LinkTopics works as a visual filtering layer in your browser. It is designed to hide supported categories in the feed you see locally, rather than automate posting, messaging, or other account actions on your behalf.`,
      `That matters because many professionals want a cleaner LinkedIn experience without introducing risky workflow automation. The right way to think about it is as a productivity layer: you keep using LinkedIn normally, but the feed itself becomes calmer and easier to navigate. That is a practical difference for recruiters, sellers, founders, consultants, and anyone who opens LinkedIn multiple times a day.`,
    ];
  }

  if (/(extension|fix|workflow|setup|step|how to)/.test(lower)) {
    return [
      `A better workflow starts with deciding which type of feed noise you actually want to reduce. For some people, it is promoted posts. For others, it is “Liked by” and “Reacted by” activity, reshared posts, or suggested content that pushes the feed away from the people they deliberately follow. Once you name the category, the cleanup process gets much simpler.`,
      `That is where LinkTopics fits naturally. It is not positioned as a generic ad blocker or an “all or nothing” browser hack. It is a LinkedIn-specific filter layer that lets you reduce the exact feed categories that break focus. The result is a feed that still feels like LinkedIn, but with less friction and a higher signal-to-noise ratio for the work you are actually trying to do.`,
    ];
  }

  if (/(best|tips|optimi|profile|headline|content|network|recruit|lead|job)/.test(lower)) {
    return [
      `The best LinkedIn optimization advice is usually less about hacks and more about reducing friction. When your feed is calmer, it becomes easier to notice patterns, save stronger examples, reply to the right people, and use LinkedIn more intentionally for ${row.icp.toLowerCase()}. Cleaner input leads to better decisions about profile updates, outreach timing, content ideas, and network quality.`,
      `That is why “tips and tricks” only work when the environment supports them. If the feed is crowded with the wrong inputs, even smart professionals spend more time filtering mentally than acting strategically. The practical win is not just a cleaner screen. It is faster research, sharper attention, and more consistent use of LinkedIn for the goal that matters to you.`,
    ];
  }

  return [
    `This part of the workflow matters because ${keyword} is usually a symptom of a broader feed-quality problem. Professionals do not search for this topic because they want theory. They search because the current experience feels slower, noisier, and less intentional than it should. The goal is to remove friction, protect attention, and make LinkedIn more useful for the work you actually do.`,
    `The practical path is to separate what LinkedIn gives you natively from what a dedicated feed filter can improve. Once you do that, it becomes much easier to build a repeatable workflow: keep the updates you care about, reduce recurring interruptions, and spend more of your LinkedIn time on outreach, recruiting, research, reputation, or opportunity generation.`,
  ];
}

function buildHowLinkTopicsSection(row) {
  const proText =
    row.funnel === "TOFU"
      ? "If you start with the free version, you can immediately hide promoted posts and see a live hidden-post counter while you browse."
      : "If you need deeper control, Pro adds filters for liked-by/reacted-by posts, shared posts, and suggested or recommended posts.";

  return [
    `LinkTopics is built for professionals who want a cleaner LinkedIn feed without changing how they use LinkedIn. It works as a visual layer in your browser and helps reduce categories such as promoted posts, liked-by/reacted-by cards, shared posts, and suggested content.`,
    `${proText} That makes it useful as a productivity layer rather than a gimmick. You keep your normal LinkedIn workflow; the feed just becomes easier to use with focus.`,
  ];
}

function buildRelatedLinks(row) {
  if (!row.internalLinks.length) return "";
  const items = row.internalLinks
    .map(
      (link) =>
        `<li><a href="${escapeAttr(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
          link.label
        )}</a></li>`
    )
    .join("");

  return `
      <section>
        <h2>Related guides</h2>
        <p>Use these related resources to keep improving how you use LinkedIn for focused work.</p>
        <ul>
          ${items}
        </ul>
      </section>`;
}

function resolveCtaLink(row, final = false) {
  const text = `${row.cta} ${row.meetingAngle}`.toLowerCase();
  if (/pro|unlock|compare|pricing|team|demo|audit|book/.test(text)) {
    return { href: PRICING_URL, label: final ? "Unlock Pro for $29" : row.cta || "See Pro filters" };
  }
  return {
    href: CHROME_WEB_STORE_URL,
    label: final ? "Install LinkTopics Free" : row.cta || "Install LinkTopics Free",
  };
}

function buildCtaBlock(row, final = false) {
  const target = resolveCtaLink(row, final);
  const body =
    row.funnel === "BOFU"
      ? "If you already know this type of feed noise costs you time, the fastest next step is to install LinkTopics and use the filters that match your workflow."
      : row.funnel === "MOFU"
      ? "If you are comparing ways to clean up LinkedIn, this is the moment to see which filters are free and which ones are unlocked in Pro."
      : "If you want to start with less friction, install the free version and get a cleaner LinkedIn feed in a few seconds.";

  const extra = row.leadMagnet
    ? `<p><strong>Useful extra:</strong> ${escapeHtml(row.leadMagnet)}.</p>`
    : "";

  return `
      <section>
        <h2>${final ? "Next step" : "What to do next"}</h2>
        <p>${body}</p>
        ${extra}
        <p><a href="${escapeAttr(target.href)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(
          target.label
        )}</strong></a></p>
      </section>`;
}

function buildFaqs(row) {
  const keyword = row.primaryKeyword;
  const title = row.title;
  const faqs = [
    {
      question: `How do I ${keyword.replace(/\?+$/, "")}?`,
      answer: `Start by identifying which feed category is causing the problem, then use the native LinkedIn controls you can access. If the same pattern keeps coming back, a LinkedIn-specific visual filter like LinkTopics is the more scalable way to reduce it.`,
    },
    {
      question: `Can LinkedIn settings handle ${keyword} without an extension?`,
      answer: `Sometimes partially, but not reliably at scale. LinkedIn lets you hide individual posts and adjust some preferences, yet it does not offer a full category-level cleanup experience for most of the feed noise professionals complain about.`,
    },
    {
      question: `Is LinkTopics safe to use with LinkedIn?`,
      answer: `LinkTopics is positioned as a local visual filtering layer in your browser. It is designed to change what you see in the feed rather than automate posting, messaging, or other account actions on your behalf.`,
    },
    {
      question: `Which LinkTopics filters are free and which require Pro?`,
      answer: `The free version focuses on promoted posts and includes a live hidden-post counter. Pro expands control with filters for liked-by/reacted-by posts, shared or reshared posts, and suggested or recommended content.`,
    },
    {
      question: `Will filtering change what other people see on LinkedIn?`,
      answer: `No. Feed filtering changes your local browsing experience, not the content shown to other people. It is about reducing distractions in your own feed so LinkedIn feels more intentional and productive.`,
    },
    {
      question: `Who benefits most from ${title}?`,
      answer: `${sentenceCase(
        row.icp
      )} tend to benefit most because they use LinkedIn repeatedly for recruiting, outreach, research, content, or opportunity discovery and feel the cost of feed noise faster than occasional users.`,
    },
  ];

  return faqs.slice(0, 5);
}

function buildArticleSchema(row, canonicalUrl, metaDescription, coverUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: row.title,
    description: metaDescription,
    image: [coverUrl],
    author: { "@type": "Person", name: "Miguel Duque" },
    publisher: {
      "@type": "Organization",
      name: "LinkTopics",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_ORIGIN}/images/logo-linktopics.png`,
      },
    },
    datePublished: row.publishDate,
    dateModified: row.publishDate,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    keywords: [row.primaryKeyword, ...row.secondaryKeywords].filter(Boolean),
  };
}

function buildFaqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

function buildHowToSchema(row, canonicalUrl) {
  if (!/howto/i.test(row.schema)) return null;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: row.title,
    description: sentenceCase(row.geoQueryTarget || row.primaryKeyword),
    totalTime: "PT5M",
    tool: [
      {
        "@type": "HowToTool",
        name: "LinkTopics Chrome extension",
      },
    ],
    step: [
      {
        "@type": "HowToStep",
        name: "Install LinkTopics",
        url: canonicalUrl,
        text: "Install LinkTopics from the Chrome Web Store so you can apply LinkedIn-specific visual filters.",
      },
      {
        "@type": "HowToStep",
        name: "Open LinkedIn and identify the noise",
        url: canonicalUrl,
        text: "Open your feed and confirm which types of posts are interrupting your workflow.",
      },
      {
        "@type": "HowToStep",
        name: "Enable the relevant filters",
        url: canonicalUrl,
        text: "Use the filters that match your goal, such as promoted, liked-by/reacted-by, shared, or suggested post cleanup.",
      },
      {
        "@type": "HowToStep",
        name: "Review the cleaner feed",
        url: canonicalUrl,
        text: "Refresh LinkedIn and work from a calmer, more intentional feed experience.",
      },
    ],
  };
}

function buildArticle(row) {
  const canonicalUrl = `${SITE_ORIGIN}/blog/${row.slug}`;
  const seoTitle = seoTitleFor(row);
  const metaDescription = metaDescriptionFor(row);
  const displayDate = formatDisplayDate(row.publishDate);
  const summary = buildSummary(row, displayDate);
  const cover = pickCover(row);
  const quickAnswer = buildQuickAnswer(row);
  const intro = introParagraphs(row)
    .map((paragraph) => `        <p>${escapeHtml(paragraph)}</p>`)
    .join("\n");

  const outlineSections = row.outline
    .map((heading, index) => {
      const paragraphs = sectionParagraphs(row, heading, index)
        .map((paragraph) => `        <p>${escapeHtml(paragraph)}</p>`)
        .join("\n");
      return `
      <section>
        <h2>${escapeHtml(heading)}</h2>
${paragraphs}
      </section>`;
    })
    .join("\n");

  const howLinkTopics = buildHowLinkTopicsSection(row)
    .map((paragraph) => `        <p>${escapeHtml(paragraph)}</p>`)
    .join("\n");

  const faqs = buildFaqs(row);
  const faqHtml = faqs
    .map(
      (faq) => `
        <h3>${escapeHtml(faq.question)}</h3>
        <p>${escapeHtml(faq.answer)}</p>`
    )
    .join("\n");

  const schemas = [
    buildArticleSchema(row, canonicalUrl, metaDescription, cover.url),
    buildFaqSchema(faqs),
    buildHowToSchema(row, canonicalUrl),
  ]
    .filter(Boolean)
    .map(
      (schema) => `  <script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n  </script>`
    )
    .join("\n");

  const leadMagnet =
    row.leadMagnet && row.leadMagnet !== row.cta
      ? `
      <section>
        <h2>Bonus resource</h2>
        <p>${escapeHtml(row.leadMagnet)} can help you turn this cleanup tactic into a repeatable LinkedIn workflow for your team or role.</p>
      </section>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(seoTitle)}</title>
  <meta name="description" content="${escapeAttr(metaDescription)}" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="canonical" href="${escapeAttr(canonicalUrl)}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeAttr(seoTitle)}" />
  <meta property="og:description" content="${escapeAttr(metaDescription)}" />
  <meta property="og:url" content="${escapeAttr(canonicalUrl)}" />
  <meta property="og:site_name" content="LinkTopics" />
  <meta property="og:image" content="${escapeAttr(cover.url)}" />
  <meta property="og:image:alt" content="${escapeAttr(cover.alt)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeAttr(seoTitle)}" />
  <meta name="twitter:description" content="${escapeAttr(metaDescription)}" />
  <meta name="twitter:image" content="${escapeAttr(cover.url)}" />
  <meta name="twitter:image:alt" content="${escapeAttr(cover.alt)}" />
${schemas}
</head>
<body>
  <main>
    <article>
      <header>
        <h1>${escapeHtml(row.title)}</h1>
        <p><em>${escapeHtml(summary)}</em></p>
      </header>

      <section>
${intro}
      </section>

      <section>
        <h2>Quick answer</h2>
        <p>${escapeHtml(quickAnswer)}</p>
      </section>

      <!-- OG image prompt: ${escapeHtml(cover.prompt)} -->
      <figure>
        <img src="${escapeAttr(cover.url)}" alt="${escapeAttr(cover.alt)}" loading="lazy" />
      </figure>

${outlineSections}

      <section>
        <h2>How LinkTopics fits this workflow</h2>
${howLinkTopics}
      </section>

${buildCtaBlock(row)}
${leadMagnet}
${buildRelatedLinks(row)}

      <section>
        <h2>Frequently asked questions</h2>
${faqHtml}
      </section>

${buildCtaBlock(row, true)}
    </article>
  </main>
</body>
</html>`;
}

function publishDuePosts() {
  ensureDir(POSTS_DIR);
  const now = getLisbonNow();
  const published = readPublishedIndex();
  const rows = readCalendarRows();
  const dueRows = chooseDueRows(rows, published, now);

  if (!dueRows.length) {
    return {
      now,
      published: false,
      reason: "no_due_unpublished_rows",
    };
  }

  const created = [];
  const skipped = [];

  for (const row of dueRows) {
    const targetDir = path.join(POSTS_DIR, row.folder);
    if (fs.existsSync(targetDir)) {
      skipped.push({
        reason: "folder_already_exists",
        folder: row.folder,
        slug: row.slug,
        title: row.title,
      });
      continue;
    }

    ensureDir(targetDir);
    fs.writeFileSync(path.join(targetDir, "content.html"), buildArticle(row), "utf8");

    created.push({
      folder: row.folder,
      slug: row.slug,
      title: row.title,
      publishDate: row.publishDate,
      publishTime: row.publishTime,
    });
  }

  return {
    now,
    published: created.length > 0,
    createdCount: created.length,
    skippedCount: skipped.length,
    created,
    skipped,
  };
}

console.log(JSON.stringify(publishDuePosts(), null, 2));
