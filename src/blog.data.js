// src/blog.data.js
// ✅ módulo SEM React — apenas dados para SSR/prerender

const slugify = (str = "") =>
    String(str)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80);
  
  /* Meta fixa para posts antigos (mantém igual ao teu) */
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
  
  /* Loader dinâmico de posts em src/posts/* */
  const htmlModules = import.meta.glob("./posts/*/content*.html", {
    eager: true,
    query: "?raw",
    import: "default",
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
  
  export const posts = buildPosts();
  