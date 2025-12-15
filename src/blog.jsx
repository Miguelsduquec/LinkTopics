// =============================
// blog.jsx — Blog dinâmico com HTML posts + SEO
// =============================
import React, {
  useMemo,
  Children,
  isValidElement,
  cloneElement,
  useEffect,
  useState,
} from "react";

import "./blog.css";

/* ----------------------------------------------------
   HEAD helpers
---------------------------------------------------- */
function setMeta(attr, key, value) {
  if (!value) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}
function setTitle(title) {
  if (title) document.title = title;
}
function setLink(rel, href, extra = {}) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  for (const k in extra) el.setAttribute(k, extra[k]);
}
function setJsonLd(id, data) {
  if (!data) return;
  let s = document.getElementById(id);
  if (!s) {
    s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    document.head.appendChild(s);
  }
  s.textContent = JSON.stringify(data);
}
function siteOrigin() {
  const SITE_URL = "https://www.linktopics.me";
  return SITE_URL;
}

/* ----------------------------------------------------
   Outgoing links (para resolver Ahrefs "no outgoing links")
---------------------------------------------------- */
const OUT_CHROME_URL =
  "https://chromewebstore.google.com/detail/bdilfiejpkdfbildemdncbkblegpejfb?utm_source=linktopics_blog";
const OUT_YOUTUBE_URL = "https://www.youtube.com/watch?v=L28hvycCQqc";
const OUT_X_URL = "https://x.com/miguelduquec";

/* ----------------------------------------------------
   BLOG SEO
---------------------------------------------------- */
function BlogListSeo() {
  const title =
    "Blog – LinkedIn Feed Filter Tips (Chrome Extension) | LinkTopics";
  const description =
    "Guides to clean your LinkedIn feed: hide ads/sponsored, mute keywords, highlight topics, and boost productivity with LinkTopics (Chrome extension).";

  // canonical estável, sem query params
  const url = siteOrigin() + "/blog";
  const image = siteOrigin() + "/1280x630_OG_image.png";

  // ✅ paginação: /blog?page=2+ => noindex,follow
  const isPaginated = useMemo(() => {
    if (typeof window === "undefined") return false;
    const p = new URLSearchParams(window.location.search).get("page");
    const n = Number(p);
    return Number.isFinite(n) && n >= 2;
  }, []);

  useEffect(() => {
    setTitle(title);
    setMeta("name", "description", description);
    setLink("canonical", url);

    setMeta("name", "robots", isPaginated ? "noindex,follow" : "index,follow");

    // Open Graph
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:site_name", "LinkTopics");

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);
    setMeta("name", "twitter:site", "@miguelduquec");

    // BreadcrumbList
    setJsonLd("ld-breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteOrigin() + "/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: url },
      ],
    });
  }, [title, description, url, image, isPaginated]);

  return null;
}

function BlogPostSeo({ post }) {
  const origin = siteOrigin();
  const url = `${origin}/blog/${post.slug}`;
  const title = `${post.title} | LinkTopics – LinkedIn Feed Filter`;
  const description =
    post.excerpt ||
    "Filter your LinkedIn feed: hide sponsored/promoted posts, mute keywords, and highlight topics with LinkTopics.";
  const image = post.cover
    ? post.cover.startsWith("http")
      ? post.cover
      : origin + post.cover
    : origin + "/1280x630_OG_image.png";

  const toISO = (d) => {
    try {
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? undefined : dt.toISOString();
    } catch {
      return undefined;
    }
  };
  const datePublished = post.dateISO || toISO(post.date);
  const dateModified = post.updatedISO || datePublished;
  const section = post.tags?.[0] || "LinkedIn";
  const tags = post.tags || [];

  useEffect(() => {
    setTitle(title);
    setMeta("name", "description", description);
    setLink("canonical", url);

    // ✅ posts: index,follow
    setMeta("name", "robots", "index,follow");

    // Open Graph (article)
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "article");
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:site_name", "LinkTopics");

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);
    setMeta("name", "twitter:site", "@miguelduquec");

    // Article meta
    if (datePublished) setMeta("property", "article:published_time", datePublished);
    if (dateModified) setMeta("property", "article:modified_time", dateModified);
    setMeta("property", "article:section", section);
    document.querySelectorAll('meta[property="article:tag"]').forEach((m) => m.remove());
    tags.forEach((t) => setMeta("property", "article:tag", t));

    // JSON-LD Article
    setJsonLd("ld-article", {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description,
      image: [image],
      url,
      datePublished,
      dateModified,
      author: { "@type": "Person", name: "Miguel Duque" },
      publisher: {
        "@type": "Organization",
        name: "LinkTopics",
        logo: {
          "@type": "ImageObject",
          url: origin + "/favicon-bg-180x180.png",
        },
      },
    });

    // Breadcrumbs
    setJsonLd("ld-breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: origin + "/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: origin + "/blog" },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    });
  }, [
    title,
    description,
    url,
    image,
    datePublished,
    dateModified,
    post.title,
    section,
    tags,
    origin,
  ]);

  return null;
}

/* ----------------------------------------------------
   Utils de conteúdo
---------------------------------------------------- */
const slugify = (str = "") =>
  String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

function collectText(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(collectText).join(" ");
  if (isValidElement(node)) return collectText(node.props.children);
  return "";
}

function walkNodes(nodes, visitor) {
  return Children.map(nodes, (child) => {
    if (!isValidElement(child)) return child;
    const updated = visitor(child);
    const kids = child.props?.children
      ? walkNodes(child.props.children, visitor)
      : child.props?.children;
    return cloneElement(updated, {}, kids);
  });
}

function enhanceContentAndHeadings(content) {
  const headings = [];
  const enhanced = walkNodes(content, (el) => {
    const t = el.type;
    if (t === "h2" || t === "h3") {
      const text = collectText(el.props.children);
      const id = el.props.id || slugify(text);
      headings.push({ id, text, level: t === "h2" ? 2 : 3 });
      return cloneElement(el, { id });
    }
    return el;
  });
  return { enhanced, headings };
}

function enhanceHtml(html = "") {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    const re = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi;
    const headings = [];
    let m,
      output = html;
    while ((m = re.exec(html))) {
      const level = Number(m[1]);
      const text = m[2].replace(/<[^>]+>/g, "").trim();
      const id = slugify(text);
      output = output.replace(m[0], (full) =>
        /id="/.test(full)
          ? full
          : full.replace(/<h[23]/, (x) => `${x} id="${id}"`)
      );
      headings.push({ id, text, level });
    }
    return { html: output, headings };
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const headings = [];
  doc.querySelectorAll("h2, h3").forEach((h) => {
    const text = h.textContent?.trim() || "";
    const id = h.id || slugify(text);
    h.id = id;
    headings.push({ id, text, level: h.tagName === "H2" ? 2 : 3 });
  });
  return { html: doc.body.innerHTML, headings };
}

function readingTimeFromText(text = "") {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/* ----------------------------------------------------
   Meta fixa para posts antigos (001–004)
---------------------------------------------------- */
const LEGACY_POSTS = {
  "001-focus-mode": {
    slug: "stay-focused-on-linkedin-with-linktopics",
    title: "Stay Focused on LinkedIn with LinkTopics",
    date: "Oct 12, 2025",
    dateISO: "2025-10-12T00:00:00.000Z",
    excerpt:
      "LinkedIn feed filter: cut noise, hide irrelevant posts, and keep only the topics that matter.",
    tags: ["guide", "productivity"],
  },
  "002-linkedin-vs-facebook": {
    slug: "is-linkedin-turning-into-facebook-not-anymore",
    title: "Is LinkedIn Turning Into Facebook? Not Anymore.",
    date: "Oct 11, 2025",
    dateISO: "2025-10-11T00:00:00.000Z",
    excerpt:
      "Why knowledge-first beats virality on LinkedIn — and how to adapt with filters and topic highlights.",
    tags: ["algorithms", "strategy"],
  },
  "003-remove-ads": {
    slug: "remove-ads-and-noise-on-linkedin",
    title: "Remove Ads & Noise on LinkedIn with LinkTopics",
    date: "Oct 10, 2025",
    dateISO: "2025-10-10T00:00:00.000Z",
    excerpt:
      "Hide sponsored/promoted posts, likes, and job spam. Clean your LinkedIn feed and focus on what matters.",
    tags: ["how-to", "filters"],
  },
  "004-hide-linkedin-ads": {
    slug: "hide-linkedin-ads",
    title: "How to remove ads from Linkedin",
    date: "Nov 21, 2025",
    dateISO: "2025-11-21T00:00:00.000Z",
    excerpt:
      "Hide sponsored/promoted posts, likes, and job spam. Clean your LinkedIn feed and focus on what matters.",
    tags: ["how-to", "filters", "productivity"],
  },
};

/* ----------------------------------------------------
   Loader dinâmico de posts em src/posts/*
---------------------------------------------------- */
const htmlModules = import.meta.glob("./posts/*/content*.html", {
  eager: true,
  as: "raw",
});

const coverModules = import.meta.glob("./posts/*/thumbnail.*", {
  eager: true,
});

function buildPosts() {
  const posts = [];

  Object.entries(htmlModules).forEach(([path, html]) => {
    const m = path.match(/\.\/posts\/([^/]+)\/content/i);
    if (!m) return;
    const folder = m[1];

    const legacy = LEGACY_POSTS[folder];

    const coverKeyPrefix = `./posts/${folder}/thumbnail.`;
    const coverKey = Object.keys(coverModules).find((k) =>
      k.startsWith(coverKeyPrefix)
    );

    let cover = null;
    if (coverKey) {
      const modCover = coverModules[coverKey];
      cover =
        typeof modCover === "string"
          ? modCover
          : typeof modCover?.default === "string"
          ? modCover.default
          : null;
    }

    let title = "";
    let slug = "";
    let excerpt = "";
    let date;
    let dateISO;
    let tags = ["LinkedIn", "how-to"];

    if (legacy) {
      ({ title, slug, excerpt, date, dateISO, tags } = legacy);
    } else {
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      const stripTags = (str = "") => str.replace(/<[^>]+>/g, "").trim();

      title = h1Match ? stripTags(h1Match[1]) : folder;
      excerpt = pMatch ? stripTags(pMatch[1]) : "";
      slug = slugify(title);

      const dMatch = folder.match(/^(\d{4}-\d{2}-\d{2})-/);
      if (dMatch) {
        dateISO = `${dMatch[1]}T00:00:00.000Z`;
        const dObj = new Date(dateISO);
        const opts = { year: "numeric", month: "short", day: "numeric" };
        date = dObj.toLocaleDateString("en-US", opts);
      } else {
        date = "Unknown date";
        dateISO = undefined;
      }
    }

    posts.push({
      folder,
      slug,
      title,
      date,
      dateISO,
      cover,
      excerpt,
      html,
      tags,
    });
  });

  posts.sort((a, b) => {
    const da = a.dateISO || "";
    const db = b.dateISO || "";
    return da < db ? 1 : da > db ? -1 : 0;
  });

  return posts;
}

const posts = buildPosts();

/* ----------------------------------------------------
   UI primitives
---------------------------------------------------- */
function SectionHeader({ title, subtitle }) {
  return (
    <div className="blog-sec-header">
      <h1 className="blog-h1">{title}</h1>
      {subtitle && <p className="blog-sub">{subtitle}</p>}
    </div>
  );
}

function Tag({ children }) {
  return <span className="blog-tag">{children}</span>;
}

function ShareBar({ title, slug }) {
  const url = `https://www.linktopics.me/blog/${slug}`;
  const text = encodeURIComponent(title);
  const shareUrl = encodeURIComponent(url);
  return (
    <div className="sharebar">
      <a
        className="sharebtn"
        href={`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Share on X
      </a>
      <a
        className="sharebtn"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Share on LinkedIn
      </a>
      <button
        className="sharebtn"
        onClick={() => navigator.clipboard?.writeText(url)}
      >
        Copy link
      </button>
    </div>
  );
}

/* ✅ bloco explícito de outgoing links (para Ahrefs) */
function OutgoingLinksBlock({ compact = false }) {
  return (
    <section
      className="outgoing-links"
      style={{
        marginTop: compact ? 16 : 28,
        padding: "14px 16px",
        border: "1px solid #e6e8ee",
        borderRadius: 14,
        background: "#f7f8fb",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 8 }}>
        Try LinkTopics (external links)
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <a href={OUT_CHROME_URL} target="_blank" rel="noopener noreferrer">
          Chrome Web Store
        </a>
        <a href={OUT_YOUTUBE_URL} target="_blank" rel="noopener noreferrer">
          Watch demo
        </a>
        <a href={OUT_X_URL} target="_blank" rel="noopener noreferrer">
          X
        </a>
      </div>

      <div style={{ marginTop: 10, opacity: 0.9 }}>
        Internal: <a href="/">Home</a> · <a href="/blog">Blog</a> ·{" "}
        <a href="/privacy-policy">Privacy</a> · <a href="/tos">Terms</a>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      {/* internal */}
      <a href="/">Home</a>
      <a href="/blog">Blog</a>
      <a href="/privacy-policy">Privacy</a>
      <a href="/tos">Terms</a>

      {/* outgoing */}
      <span className="site-footer-sep" aria-hidden="true">
        •
      </span>

      <a href={OUT_CHROME_URL} target="_blank" rel="noopener noreferrer">
        Chrome Web Store
      </a>
      <a href={OUT_YOUTUBE_URL} target="_blank" rel="noopener noreferrer">
        Watch demo
      </a>
      <a href={OUT_X_URL} target="_blank" rel="noopener noreferrer">
        X
      </a>
    </footer>
  );
}

function RelatedPosts({ currentPost, posts, max = 6 }) {
  const related = useMemo(() => {
    const curTags = new Set(
      (currentPost.tags || []).map((t) => String(t).toLowerCase())
    );

    const scored = posts
      .filter((p) => p.slug !== currentPost.slug)
      .map((p) => {
        const tags = (p.tags || []).map((t) => String(t).toLowerCase());
        const score = tags.reduce(
          (acc, t) => acc + (curTags.has(t) ? 1 : 0),
          0
        );
        return { post: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.post);

    const fallback = posts.filter((p) => p.slug !== currentPost.slug);

    const merged = [];
    for (const p of scored) if (!merged.find((x) => x.slug === p.slug)) merged.push(p);
    for (const p of fallback) if (!merged.find((x) => x.slug === p.slug)) merged.push(p);

    return merged.slice(0, max);
  }, [currentPost, posts, max]);

  if (!related.length) return null;

  return (
    <section className="related-posts">
      <h3 className="related-title">Related posts</h3>
      <div className="related-grid">
        {related.map((p) => (
          <a key={p.slug} className="related-card" href={`/blog/${p.slug}`}>
            <div className="related-card-title">{p.title}</div>
            <div className="related-card-meta">{p.date}</div>
          </a>
        ))}
      </div>
    </section>
  );
}

function TableOfContents({ headings }) {
  if (!headings?.length) return null;
  return (
    <aside className="toc" aria-label="Table of contents">
      <div className="toc-title">On this page</div>
      <nav>
        <ul>
          {headings.map((h) => (
            <li key={h.id} className={`lvl-${h.level}`}>
              <a href={`#${h.id}`}>{h.text}</a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

/* ----------------------------------------------------
   Page layouts
---------------------------------------------------- */
function BlogList() {
  const PAGE_SIZE = 6;

  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window === "undefined") return 1;
    const p = new URLSearchParams(window.location.search).get("page");
    const n = Number(p);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  });

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pagePosts = posts.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);

    const url = new URL(window.location.href);
    if (page === 1) url.searchParams.delete("page");
    else url.searchParams.set("page", String(page));
    window.history.pushState({}, "", url.toString());

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => ({
        type: "page",
        page: i + 1,
        key: `page-${i + 1}`,
      }));
    }

    const pages = new Set([1, totalPages, safePage]);
    if (safePage - 1 > 1) pages.add(safePage - 1);
    if (safePage + 1 < totalPages) pages.add(safePage + 1);

    const sorted = Array.from(pages).sort((a, b) => a - b);

    const items = [];
    for (let i = 0; i < sorted.length; i++) {
      const p = sorted[i];
      if (i > 0 && p - sorted[i - 1] > 1) {
        items.push({ type: "dots", key: `dots-${sorted[i - 1]}-${p}` });
      }
      items.push({ type: "page", page: p, key: `page-${p}` });
    }
    return items;
  };

  const paginationItems = getPaginationItems();

  return (
    <section className="blog-section">
      <BlogListSeo />
      <div className="container blog-container">
        <SectionHeader
          title="Latest posts"
          subtitle="Grow faster on LinkedIn with focus & smart filtering."
        />

        <div className="blog-grid">
          {pagePosts.map((p) => (
            <article key={p.slug} className="blog-card">
              <a className="blog-card-link" href={`/blog/${p.slug}`}>
                {p.cover && (
                  <div className="blog-card-cover">
                    <img src={p.cover} alt="" loading="lazy" />
                  </div>
                )}
                <div className="blog-card-body">
                  <div className="blog-date">{p.date}</div>
                  <h3 className="blog-card-title">{p.title}</h3>
                  <p className="blog-excerpt">{p.excerpt}</p>
                  <div className="blog-tags">
                    {p.tags?.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                </div>
              </a>
            </article>
          ))}

          {!posts.length && (
            <p style={{ marginTop: "2rem" }}>
              No posts found. Check that src/posts/*/content.html exists.
            </p>
          )}
        </div>

        {posts.length > PAGE_SIZE && (
          <nav className="blog-pagination" aria-label="Blog pagination">
            <button
              type="button"
              className="blog-page-nav"
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
            >
              ← Previous
            </button>

            {paginationItems.map((item) =>
              item.type === "dots" ? (
                <span key={item.key} className="blog-page-dots">
                  …
                </span>
              ) : (
                <button
                  key={item.key}
                  type="button"
                  className={
                    "blog-page-btn" +
                    (item.page === safePage ? " blog-page-btn-active" : "")
                  }
                  onClick={() => goToPage(item.page)}
                >
                  {item.page}
                </button>
              )
            )}

            <button
              type="button"
              className="blog-page-nav"
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
            >
              Next →
            </button>
          </nav>
        )}

        {/* ✅ garante outgoing links também na lista */}
        <OutgoingLinksBlock compact />

        <SiteFooter />
      </div>
    </section>
  );
}

function BlogPost({ post }) {
  const { enhancedNode, enhancedHtml, headings, reading } = useMemo(() => {
    if (post.html) {
      const { html, headings } = enhanceHtml(post.html);
      const tmp =
        typeof document !== "undefined" ? document.createElement("div") : null;
      if (tmp) tmp.innerHTML = html;
      const text = tmp?.textContent || "";
      return {
        enhancedNode: null,
        enhancedHtml: html,
        headings,
        reading: readingTimeFromText(text),
      };
    }
    const { enhanced, headings } = enhanceContentAndHeadings(post.content);
    return {
      enhancedNode: enhanced,
      enhancedHtml: null,
      headings,
      reading: readingTimeFromText(collectText(post.content)),
    };
  }, [post]);

  return (
    <article className="blog-article">
      <BlogPostSeo post={post} />
      <div className="container blog-container">
        <nav className="blog-breadcrumbs">
          <a href="/">Home</a>
          <span aria-hidden>›</span>
          <a href="/blog">Blog</a>
        </nav>

        <header className="blog-article-header">
          <h1 className="blog-article-title">{post.title}</h1>
          <div className="blog-meta">
            <span className="blog-date">{post.date}</span>
            <span aria-hidden>•</span>
            <span className="blog-reading">{reading} min read</span>
          </div>
          {post.tags?.length ? (
            <div className="blog-tags hdr">
              {post.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          ) : null}
        </header>

        {post.cover && (
          <div className="blog-hero">
            <img src={post.cover} alt="" />
          </div>
        )}

        <div className="blog-layout">
          <div className="blog-article-content prose">
            {post.html ? (
              <div dangerouslySetInnerHTML={{ __html: enhancedHtml }} />
            ) : (
              enhancedNode
            )}

            {/* ✅ internal links */}
            <RelatedPosts currentPost={post} posts={posts} max={6} />

            {/* ✅ outgoing links (para Ahrefs) */}
            <OutgoingLinksBlock />

            <ShareBar title={post.title} slug={post.slug} />
            <SiteFooter />
          </div>

          <TableOfContents headings={headings} />
        </div>
      </div>
    </article>
  );
}

/* ----------------------------------------------------
   Top-level router
---------------------------------------------------- */
export default function BlogPage() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/blog";

  const slug = useMemo(() => {
    const m = path.match(/^\/blog\/?(.+)?$/i);
    return m && m[1] ? m[1].replace(/\/+$/, "") : "";
  }, [path]);

  if (!slug) return <BlogList />;

  const post = posts.find((p) => p.slug === slug);
  if (!post) {
    return (
      <section className="blog-section">
        <div className="container blog-container">
          <SectionHeader title="Post not found" />
          <p>
            We couldn’t find that post. <a href="/blog">Go back to the blog.</a>
          </p>
          <SiteFooter />
        </div>
      </section>
    );
  }

  return <BlogPost post={post} />;
}
