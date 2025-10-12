// =============================
// blog.jsx — SuperX-style + HTML posts (covers from thumbnails)
// =============================
import React, { useMemo, Children, isValidElement, cloneElement } from "react";
import "./blog.css";

// HTML posts (Vite ?raw) + covers (import imagem para o bundler)
import postIntroHtml from "./posts/001-focus-mode/content.html?raw";
import coverIntro from "./posts/001-focus-mode/thumbnail.jpeg";

import postFacebookHtml from "./posts/002-linkedin-vs-facebook/contentTurnToFacebook.html?raw";
import coverFacebook from "./posts/002-linkedin-vs-facebook/thumbnail.jpeg";

import postRemoveAdsHtml from "./posts/003-remove-ads/contentUseLinktopicsToRemoveAds.html?raw";
import coverRemoveAds from "./posts/003-remove-ads/thumbnail.jpeg";

/* --- UTILITIES --- */
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

// HTML: insere ids em <h2>/<h3> e extrai TOC
function enhanceHtml(html = "") {
  // SSR fallback simples
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    const re = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi;
    const headings = [];
    let m, output = html;
    while ((m = re.exec(html))) {
      const level = Number(m[1]);
      const text = m[2].replace(/<[^>]+>/g, "").trim();
      const id = slugify(text);
      output = output.replace(m[0], (full) =>
        /id="/.test(full) ? full : full.replace(/<h[23]/, (x) => `${x} id="${id}"`)
      );
      headings.push({ id, text, level });
    }
    return { html: output, headings };
  }
  // Cliente
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

function estimateReadingTime(content) {
  return readingTimeFromText(collectText(content));
}

/* --- POSTS (HTML only; add more as needed) --- */
const posts = [
  {
    slug: "stay-focused-on-linkedin-with-linktopics",
    title: "Stay Focused on LinkedIn with LinkTopics",
    date: "Oct 12, 2025",
    cover: coverIntro,
    excerpt:
      "Focus mode for LinkedIn: cut noise and keep only the topics that matter.",
    html: postIntroHtml, // ./posts/001-focus-mode/content.html
    tags: ["guide", "productivity"],
  },
  {
    slug: "is-linkedin-turning-into-facebook-not-anymore",
    title: "Is LinkedIn Turning Into Facebook? Not Anymore.",
    date: "Oct 11, 2025",
    cover: coverFacebook,
    excerpt:
      "Why knowledge-first beats virality on LinkedIn — and how to adapt.",
    html: postFacebookHtml, // ./posts/002-linkedin-vs-facebook/contentTurnToFacebook.html
    tags: ["algorithms", "strategy"],
  },
  {
    slug: "remove-ads-and-noise-on-linkedin",
    title: "Remove Ads & Noise on LinkedIn with LinkTopics",
    date: "Oct 10, 2025",
    cover: coverRemoveAds,
    excerpt:
      "Hide promoted posts, likes, and job spam. Make your feed useful again.",
    html: postRemoveAdsHtml, // ./posts/003-remove-ads/contentUseLinktopicsToRemoveAds.html
    tags: ["how-to", "filters"],
  },
];

/* --- SMALL UI PRIMITIVES --- */
function SectionHeader({ eyebrow, title, subtitle }) {
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

function Callout({ icon = "💡", label = "Tip", children }) {
  return (
    <div className="callout">
      <div className="callout-icon" aria-hidden>
        {icon}
      </div>
      <div className="callout-body">
        <div className="callout-label">{label}</div>
        <div>{children}</div>
      </div>
    </div>
  );
}

function TipBox({ title, children }) {
  return (
    <div className="tipbox">
      <div className="tipbox-title">{title}</div>
      <div className="tipbox-body">{children}</div>
    </div>
  );
}

function ShareBar({ title, slug }) {
  const url =
    typeof window !== "undefined" ? window.location.origin + "/blog/" + slug : "";
  const text = encodeURIComponent(title);
  const shareUrl = encodeURIComponent(url);
  return (
    <div className="sharebar">
      <a
        className="sharebtn"
        href={`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`}
        target="_blank"
        rel="noreferrer"
      >
        Share on X
      </a>
      <a
        className="sharebtn"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
        target="_blank"
        rel="noreferrer"
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

/* --- PAGE LAYOUTS --- */
function BlogList() {
  return (
    <section className="blog-section">
      <div className="container blog-container">
        <SectionHeader
          eyebrow="Blog"
          title="Latest posts"
          subtitle="Grow faster on LinkedIn with focus & smart filtering."
        />
        <div className="blog-grid">
          {posts.map((p) => (
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
        </div>
      </div>
    </section>
  );
}

function BlogPost({ post }) {
  // Suporta HTML (post.html) e JSX (post.content)
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
      reading: estimateReadingTime(post.content),
    };
  }, [post]);

  return (
    <article className="blog-article">
      <div className="container blog-container">
        <nav className="blog-breadcrumbs">
          <a href="/blog" aria-label="Back to blog">
            ← Back
          </a>
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
            <ShareBar title={post.title} slug={post.slug} />
          </div>
          <TableOfContents headings={headings} />
        </div>
      </div>
    </article>
  );
}

/* --- TOP-LEVEL PAGE: decides between list or detail --- */
export default function BlogPage() {
  const path =
    typeof window !== "undefined" ? window.location.pathname : "/blog";
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
          <SectionHeader eyebrow="Blog" title="Post not found" />
          <p>
            We couldn’t find that post. <a href="/blog">Go back to the blog.</a>
          </p>
        </div>
      </section>
    );
  }
  return <BlogPost post={post} />;
}
