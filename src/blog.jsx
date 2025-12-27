// =============================
// blog.jsx — Blog dinâmico (Vike)
// =============================
import React, { useMemo, useEffect, useState } from "react";
import { SiGooglechrome } from "react-icons/si";

import "./blog.css";
import { posts } from "./blog.data.js";

export const allPostSlugs = posts.map((p) => p.slug);

const SITE_URL = "https://www.linktopics.me";
const APP_NAME = "LinkTopics";
const CHROME_URL =
  "https://chromewebstore.google.com/detail/bdilfiejpkdfbildemdncbkblegpejfb?utm_source=item-share-cb";

/* ----------------------------------------------------
   Helpers SEO
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
function setLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
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

/* ----------------------------------------------------
   Header (reutiliza classes exatas da landing)
---------------------------------------------------- */
function BlogHeader() {
  return (
    <header className="nav">
      <div className="container blog-container nav-inner">
        <a href="/" className="brand">
          <img
            src="/../favicon-bg-180x180.png"
            alt="LinkTopics"
            className="brand-logo"
          />
          <span>{APP_NAME}</span>
        </a>

        {/* ✅ igual landing, mas sem Pricing/FAQ */}
        <nav className="nav-center">
          <a href="/blog">Blog</a>
        </nav>

        <div className="nav-cta">
          <a
            className="btn btn-primary btn-chrome"
            href={CHROME_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <SiGooglechrome size={28} color="currentColor" aria-hidden="true" />
            <span>Add to Chrome</span>
          </a>
        </div>
      </div>
    </header>
  );
}

/* ----------------------------------------------------
   BLOG SEO
---------------------------------------------------- */
function BlogListSeo() {
  const title = "Blog – LinkedIn Feed Filter Tips | LinkTopics";
  const description =
    "Guides to clean your LinkedIn feed, hide ads, reduce noise and stay productive with LinkTopics.";

  const url = `${SITE_URL}/blog`;
  const image = `${SITE_URL}/1280x630_OG_image.png`;

  useEffect(() => {
    setTitle(title);
    setMeta("name", "description", description);
    setLink("canonical", url);

    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);

    setJsonLd("ld-breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: url },
      ],
    });
  }, []);

  return null;
}

function BlogPostSeo({ post }) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const title = `${post.title} | LinkTopics`;
  const description =
    post.excerpt || "Clean your LinkedIn feed and stay productive with LinkTopics.";

  const image = post.cover
    ? post.cover.startsWith("http")
      ? post.cover
      : SITE_URL + post.cover
    : `${SITE_URL}/1280x630_OG_image.png`;

  useEffect(() => {
    setTitle(title);
    setMeta("name", "description", description);
    setLink("canonical", url);

    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "article");
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);

    setJsonLd("ld-article", {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description,
      image: [image],
      url,
      author: { "@type": "Person", name: "Miguel Duque" },
      publisher: {
        "@type": "Organization",
        name: "LinkTopics",
        logo: {
          "@type": "ImageObject",
          url: SITE_URL + "/favicon-bg-180x180.png",
        },
      },
    });
  }, [post.slug]);

  return null;
}

/* ----------------------------------------------------
   Utils
---------------------------------------------------- */
function readingTimeFromHtml(html = "") {
  const text = html.replace(/<[^>]+>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/* ----------------------------------------------------
   LIST PAGE
---------------------------------------------------- */
function BlogList() {
  const PAGE_SIZE = 6;

  const [page, setPage] = useState(() => {
    if (typeof window === "undefined") return 1;
    const p = Number(new URLSearchParams(window.location.search).get("page"));
    return p >= 1 ? p : 1;
  });

  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const pagePosts = posts.slice(start, start + PAGE_SIZE);

  const go = (p) => {
    setPage(p);
    const url = new URL(window.location.href);
    if (p === 1) url.searchParams.delete("page");
    else url.searchParams.set("page", p);
    window.history.pushState({}, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="blog-section">
      <BlogListSeo />
      <div className="container blog-container">
        <h1 className="blog-h1">Latest posts</h1>

        <div className="blog-grid">
          {pagePosts.map((p) => (
            <article key={p.slug} className="blog-card">
              <a href={`/blog/${p.slug}`}>
                {p.cover && <img src={p.cover} alt="" />}
                <h3>{p.title}</h3>
                <p>{p.excerpt}</p>
              </a>
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="blog-pagination">
            <button disabled={page === 1} onClick={() => go(page - 1)}>
              ← Prev
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button disabled={page === totalPages} onClick={() => go(page + 1)}>
              Next →
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}

/* ----------------------------------------------------
   POST PAGE
---------------------------------------------------- */
function BlogPost({ post }) {
  const reading = useMemo(() => readingTimeFromHtml(post.html || ""), [post.html]);

  return (
    <article className="blog-article">
      <BlogPostSeo post={post} />

      <div className="container blog-container">
        <nav className="blog-breadcrumbs">
          <a href="/">Home</a> › <a href="/blog">Blog</a>
        </nav>

        <h1>{post.title}</h1>
        <div className="blog-meta">
          <span>{post.date}</span> · <span>{reading} min read</span>
        </div>

        {post.cover && <img src={post.cover} alt="" />}

        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </div>
    </article>
  );
}

/* ----------------------------------------------------
   ENTRY (Vike)
---------------------------------------------------- */
export default function BlogPage({ slug }) {
  if (!slug) {
    return (
      <>
        <BlogHeader />
        <BlogList />
      </>
    );
  }

  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <>
        <BlogHeader />
        <section className="blog-section">
          <div className="container">
            <h1>Post not found</h1>
            <p>
              <a href="/blog">← Back to blog</a>
            </p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <BlogHeader />
      <BlogPost post={post} />
    </>
  );
}

export { BlogList, BlogPost, posts };
