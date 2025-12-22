import React, { useState, useEffect } from "react";
import { SiGooglechrome } from "react-icons/si";
import BlogPage from "./blog.jsx";
import "./App.css";

const APP_NAME = "LinkTopics";
const CHROME_URL =
  "https://chromewebstore.google.com/detail/bdilfiejpkdfbildemdncbkblegpejfb?utm_source=item-share-cb";
const VIDEO_URL = "https://www.youtube.com/watch?v=L28hvycCQqc";
const CONTACT_MAILTO = "mailto:miguel.duquec@gmail.com?subject=Support%20request";

/* >>> LINKS DO STRIPE */
const STRIPE_MONTHLY_URL = "https://buy.stripe.com/dRm8wPceS5C57RddcAbsc04";
const STRIPE_YEARLY_URL = "https://buy.stripe.com/3cI6oHfr4c0t5J51tSbsc05";

// --- LICENÇA / PRO ---
const API_VERIFY_URL = "/api/stripe-verify";
const LICENSE_STORAGE_KEY = "ltp_license";

// util: ler querystring
const getQuery = (key) => new URLSearchParams(window.location.search).get(key);

// guardar licença local + avisar extensão
function setLicense(token) {
  try {
    if (token) localStorage.setItem(LICENSE_STORAGE_KEY, token);
    // Notifica a extensão (content/options escutam esta msg)
    window.postMessage({ type: "LTP_LICENSE_UPDATE", token }, "*");
  } catch (e) {
    /* no-op */
  }
}

function getLicense() {
  try {
    return localStorage.getItem(LICENSE_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export default function AppRouter() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/";

  if (path === "/privacy-policy") return <LegalPage kind="privacy" />;
  if (path === "/tos" || path === "/terms" || path === "/terms-of-service")
    return <LegalPage kind="tos" />;

  if (path.startsWith("/blog"))
    return (
      <main className="ltp-root" data-page="blog">
        {/* ✅ blog.jsx gere SEO por lista e por post */}
        <StyleTag />
        <Header />
        <BlogPage />
        <Footer />
      </main>
    );

  return <LandingPage />;
}



function LandingPage() {
  const [annual, setAnnual] = useState(true);
  const [proActive, setProActive] = useState(!!getLicense());
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Scroll suave para #hash
  useEffect(() => {
    const scrollToHash = () => {
      const h = decodeURIComponent(window.location.hash || "").replace("#", "");
      if (!h) return;
      requestAnimationFrame(() => {
        const el = document.getElementById(h);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  // Quando voltamos do Stripe: ?session_id=cs_test_...
  useEffect(() => {
    const sid = typeof window !== "undefined" ? getQuery("session_id") : null;
    if (!sid) return;

    const verify = async () => {
      try {
        setVerifying(true);
        setErrorMsg("");
        const res = await fetch(
          `${API_VERIFY_URL}?session_id=${encodeURIComponent(sid)}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );
        if (!res.ok) throw new Error("Verification failed");
        const data = await res.json(); // { ok:true, token:"<jwt>", plan:"monthly|yearly" }
        if (data?.ok && data?.token) {
          setLicense(data.token);
          setProActive(true);
          // limpa o session_id da barra (para não repetir chamadas ao recarregar)
          const url = new URL(window.location.href);
          url.searchParams.delete("session_id");
          window.history.replaceState({}, "", url.toString());
        } else {
          throw new Error(data?.error || "Invalid response");
        }
      } catch (e) {
        setErrorMsg(
          "We couldn't activate Pro automatically. Please contact support."
        );
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, []);

  return (
    <main className="ltp-root">
      {/* ✅ Home: pode ter FAQ + SoftwareApplication */}
      <Seo
        canonical="https://www.linktopics.me/"
        includeFAQ
        includeSoftware
      />
      <StyleTag />
      <Header />

      {/* Banner de estado Pro */}
      {verifying && (
        <div style={{ background: "#fef3c7", color: "#78350f", padding: "10px 0" }}>
          <div className="container">Activating Pro… one moment.</div>
        </div>
      )}
      {!verifying && proActive && (
        <div style={{ background: "#ecfeff", color: "#064e3b", padding: "10px 0" }}>
          <div className="container">
            ✅ Pro is active on this browser. Open LinkedIn with LinkTopics to enjoy all features.
          </div>
        </div>
      )}
      {errorMsg && (
        <div style={{ background: "#fee2e2", color: "#7f1d1d", padding: "10px 0" }}>
          <div className="container">⚠️ {errorMsg}</div>
        </div>
      )}

      <Hero />
      <SocialProof />
      <Pricing annual={annual} setAnnual={setAnnual} />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}

/* =====================================================
   SEO (agora parametrizável) — CORRIGIDO com cleanup
===================================================== */
export function Seo({
  canonical,
  title,
  description,
  includeFAQ = false,
  includeSoftware = false,
}) {
  const _title =
    title || "LinkTopics — LinkedIn Feed Cleaner (Hide Ads & “Liked by” Posts)";

  const _description =
    description ||
    "Clean your LinkedIn feed automatically: hide promoted posts, “Liked by/Reacted” posts, reshared content, and distractions. Runs locally.";

  const url = canonical || "https://www.linktopics.me/";
  const ogImage = "https://www.linktopics.me/1280x630_OG_image.png";
  const siteName = "LinkTopics";

  const jsonLdSoftware = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    applicationCategory: "BrowserExtension",
    operatingSystem: "Chrome, Edge",
    url,
    installUrl: CHROME_URL,
    image: ogImage,
    offers: [
      { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free" },
      { "@type": "Offer", price: "4.99", priceCurrency: "USD", name: "Pro (monthly)" },
      { "@type": "Offer", price: "48", priceCurrency: "USD", name: "Pro (yearly)" },
    ],
    description: _description,
  };

  const jsonLdFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is my data safe?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Everything runs locally in your browser. No risky automations.",
        },
      },
      {
        "@type": "Question",
        name: "Which browsers are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Chrome, Brave and Edge (Chromium). Firefox on the roadmap.",
        },
      },
    ],
  };

  useEffect(() => {
    const ensureCharset = () => {
      let c = document.head.querySelector("meta[charset]");
      if (!c) {
        c = document.createElement("meta");
        c.setAttribute("charset", "utf-8");
        document.head.prepend(c);
      }
    };

    const setMeta = (attr, key, value) => {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    const linkRel = (rel, href, extra = {}) => {
      // ✅ canonical deve ser único (substitui sempre o existente)
      if (rel === "canonical") {
        let existing = document.head.querySelector('link[rel="canonical"]');
        if (!existing) {
          existing = document.createElement("link");
          existing.setAttribute("rel", "canonical");
          document.head.appendChild(existing);
        }
        existing.setAttribute("href", href);
        for (const k in extra) existing.setAttribute(k, extra[k]);
        return;
      }

      let l = Array.from(document.head.querySelectorAll(`link[rel="${rel}"]`)).find(
        (x) => x.getAttribute("href") === href
      );
      if (!l) {
        l = document.createElement("link");
        l.setAttribute("rel", rel);
        l.setAttribute("href", href);
        for (const k in extra) l.setAttribute(k, extra[k]);
        document.head.appendChild(l);
      }
    };

    const scriptJson = (id, data) => {
      let s = document.getElementById(id);
      if (!data) {
        if (s) s.remove();
        return;
      }
      if (!s) {
        s = document.createElement("script");
        s.type = "application/ld+json";
        s.id = id;
        document.head.appendChild(s);
      }
      s.textContent = JSON.stringify(data);
    };

    document.documentElement.lang = "en";
    document.title = _title;
    ensureCharset();

    // Essentials
    setMeta("name", "description", _description);
    setMeta("name", "viewport", "width=device-width, initial-scale=1, viewport-fit=cover");
    setMeta("name", "theme-color", "#ffffff");
    setMeta("name", "robots", "index,follow,max-image-preview:large");
    setMeta("name", "referrer", "origin-when-cross-origin");

    // Open Graph
    setMeta("property", "og:title", _title);
    setMeta("property", "og:description", _description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:site_name", siteName);

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", _title);
    setMeta("name", "twitter:description", _description);
    setMeta("name", "twitter:image", ogImage);
    setMeta("name", "twitter:site", "@miguelduquec");

    // Links
    linkRel("canonical", url);
    linkRel("preconnect", "https://fonts.gstatic.com", { crossorigin: "" });
    linkRel("preconnect", "https://fonts.googleapis.com");
    linkRel(
      "stylesheet",
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
    );
    linkRel("preconnect", "https://www.youtube.com");
    linkRel("preconnect", "https://i.ytimg.com");
    linkRel("icon", "/favicon-32x32.png", { sizes: "32x32", type: "image/png" });
    linkRel("icon", "/favicon-16x16.png", { sizes: "16x16", type: "image/png" });
    linkRel("apple-touch-icon", "/apple-touch-icon.png");
    linkRel("manifest", "/site.webmanifest");
    linkRel("sitemap", "/sitemap.xml", { type: "application/xml" });

    // ✅ Structured Data
    scriptJson("ld-software", includeSoftware ? jsonLdSoftware : null);
    scriptJson("ld-faq", includeFAQ ? jsonLdFAQ : null);

    // ✅ Cleanup (IMPORTANTE em SPA):
    // remove JSON-LD ao sair desta página para não contaminar /blog ou /legal
    return () => {
      const s1 = document.getElementById("ld-software");
      if (s1) s1.remove();
      const s2 = document.getElementById("ld-faq");
      if (s2) s2.remove();
    };
  }, [url, _title, _description, includeFAQ, includeSoftware]);

  return null;
}


/* =====================================================
   StyleTag e UI (igual ao teu)
===================================================== */
export function StyleTag() {
  return (
    <style>{`
      :root { color-scheme: light; --bg:#ffffff; --fg:#0b0b0f; --muted:#6b7280; --card:#f7f8fb; --border:#e6e8ee; --primary:#2563eb; --shadow:0 10px 25px rgba(0,0,0,.08); }
      html, body, #root, .ltp-root { scroll-behavior: smooth; }
      html { color-scheme: light; background: var(--bg); color: var(--fg); }
      body { background: var(--bg); color: var(--fg); font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      section { scroll-margin-top: 64px; }
      @media (min-width:900px){ section { scroll-margin-top: 80px; } }
      .container { max-width:1160px; margin:0 auto; padding:0 20px; }
      @media (max-width:480px){ .container { padding:0 16px; } }
      .section { padding:56px 0; }
      @media (min-width:900px){ .section { padding:72px 0; } }
      .grid-2 { display:grid; grid-template-columns:1fr; gap:36px; }
      @media (min-width:1024px){ .grid-2{ grid-template-columns:1.1fr 1fr; } }
      .nav { position:sticky; top:0; z-index:40; backdrop-filter:saturate(180%) blur(8px); background:rgba(255,255,255,.75); }
      .nav-inner { height:56px; display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:10px; }
      @media (min-width:900px){ .nav-inner { height:64px; } }
      .brand { display:flex; align-items:center; gap:12px; font-weight:700; text-decoration:none; color:inherit; }
      .brand .dot { width:28px; height:28px; border-radius:10px; background:linear-gradient(135deg,var(--primary),#3b82f6); box-shadow:var(--shadow); }
      .nav-center { display:none; justify-content:center; gap:22px; align-items:center; font-size:14px; }
      @media (min-width:900px){ .nav-center{ display:flex; } }
      .nav a { color: inherit; text-decoration: none; }
      .nav a:hover { text-decoration: none; opacity: .85; }
      .btn { display:inline-flex; align-items:center; justify-content:center; gap:10px; border-radius:999px; font-weight:700; letter-spacing:.2px; padding:14px 20px; text-decoration:none; transition:transform .12s ease, box-shadow .12s ease, opacity .12s ease; min-height:44px; }
      .btn:active { transform:translateY(1px); }
      .btn-primary { background:var(--primary); color:#fff; box-shadow:0 10px 22px rgba(37,99,235,.25); }
      .btn-primary, .btn-primary * { color:#fff !important; }
      .btn-primary svg { fill: currentColor; }
      .btn-primary:hover { box-shadow:0 14px 28px rgba(37,99,235,.33); transform:translateY(-1px); }
      .btn[disabled]{background:#e5e7eb;color:#6b7280;box-shadow:none;cursor:not-allowed;transform:none;}
      .btn-chrome{ display:inline-flex; align-items:center; gap:10px; color:#fff; }
      .btn-chrome svg{ width:32px; height:32px; }
      @media (max-width:480px){ .btn-chrome span{ font-size:14px; } .btn-chrome svg{ width:26px;height:26px; } }
      .btn-secondary { border:1px solid var(--border); color:var(--fg); background:#fff; }
      .btn-secondary:hover { background:#f9fafb; }

      /* HERO */
      .hero { padding:40px 0; }
      @media (min-width:900px){ .hero { padding:72px 0; } }
      .hero h1 { font-size:clamp(34px,4.2vw,56px); line-height:1.05; margin:0 0 12px; }
      .hero p.sub { font-size:clamp(16px,2.1vw,20px); color:var(--muted); margin:0 0 22px; }
      .hero-ctas { display:flex; flex-wrap:wrap; gap:12px; margin-top:18px; }
      .hero-badges { display:flex; align-items:center; gap:10px; font-size:13px; color:var(--muted); margin-top:14px; }
      .badge { display:inline-flex; align-items:center; gap:8px; font-size:12px; padding:6px 10px; border-radius:999px; }
      .badge.dark { color:#fff; background:#111; }
      .hero-visual { display:flex; flex-direction:column; gap:16px; }
      .video-wrap { aspect-ratio:16/9; width:100%; border-radius:16px; overflow:hidden; box-shadow:var(--shadow); background:#000; }
      @media (max-width:480px){ .video-wrap{ border-radius:12px; } }

      /* PRICING */
      .pricing-grid { display:grid; gap:18px; grid-template-columns:1fr; }
      @media (min-width:1000px){ .pricing-grid{ grid-template-columns:repeat(2,1fr); } }
      .price-card { border:1px solid var(--border); border-radius:16px; padding:22px; background:var(--card); display:flex; flex-direction:column; }
      .price-card.pop { background:linear-gradient(180deg,#f5f3ff,#f8fafc); border-color:#c4b5fd; }
      .price-title { font-size:20px; font-weight:700; }
      .price-amount { font-size:30px; font-weight:700; margin-top:8px; }
      .price-sub{ color:var(--muted); font-size:16px; margin-left:6px; }
      .price-list { margin-top:12px; font-size:14px; }
      .price-list li{ position:relative; padding-left:22px; margin:8px 0; }
      .price-list li::before{ content:"✓"; position:absolute; left:0; top:0.15em; line-height:1; color:currentColor; font-weight:800; }
      .price-list li.em::before{ color:var(--primary); }
      .price-em{ color:var(--primary); font-weight:800; }
      .price-cta { margin-top:auto; padding-top:16px; }
      .billing-toggle { display:grid; grid-auto-flow:column; gap:6px; border:1px solid var(--border); border-radius:999px; padding:4px; width:fit-content; margin:0 auto 22px; align-items:center; }
      @media (max-width:480px){ .billing-toggle{ font-size:14px; } .billing-toggle button{ padding:8px 12px; } }
      .billing-toggle button { border-radius:999px; padding:8px 16px; font-weight:700; }
      .billing-toggle .active { background:#111; color:#fff; }

      /* FAQ */
      .faq-grid { display:grid; gap:12px; grid-template-columns:1fr; }
      @media (min-width:1000px){ .faq-grid{ grid-template-columns:repeat(2,1fr); } }
      .faq-item { border:1px solid var(--border); border-radius:16px; background:var(--card); }
      .faq-q { width:100%; text-align:left; background:none; border:none; padding:14px 16px; font-weight:700; display:flex; justify-content:space-between; align-items:center; }
      .faq-a { padding:0 16px 16px; color:var(--muted); font-size:14px; }

      /* FINAL */
      .final { padding:72px 0; }
      .final-card { border:1px solid var(--border); border-radius:24px; padding:36px; text-align:center; background:linear-gradient(135deg,#ecfeff,#faf5ff); }

      footer { border-top:1px solid var(--border); }
      .footer-inner { padding:26px 0; display:flex; flex-wrap:wrap; align-items:center; gap:16px; }
      @media (max-width:640px){ .footer-inner{ gap:12px; } }
      .footer-center{ flex:1; text-align:center; }
      .links a { color:inherit; text-decoration:none; opacity:.8; }
      .links a:hover { opacity:1; }
      .footer-legal{ flex:1; text-align:center; }
      .footer-legal h5{ margin:0 0 6px; font-size:12px; letter-spacing:.2em; color:var(--muted); }
      .footer-legal a{ display:block; text-decoration:none; color:inherit; opacity:.85; margin:4px 0; }
      .footer-legal a:hover{ opacity:1; text-decoration:underline; }

      .social-top { display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:18px; }
      .rating { display:flex; align-items:center; gap:10px; font-weight:700; }
      .stars { display:inline-flex; gap:4px; }
      .stars svg { width:18px; height:18px; fill:#f59e0b; }
      .carousel { position:relative; overflow:hidden; padding:8px 0 12px; }
      .carousel-track { display:flex; gap:16px; padding-bottom:10px; width:max-content; animation:carousel-marquee 40s linear infinite; will-change: transform; align-items:stretch; }
      .slide{ scroll-snap-align:start; display:flex; }
      .carousel:hover .carousel-track{ animation-play-state:paused; }
      @keyframes carousel-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } } 
      .slide { flex:0 0 260px; }
      @media (min-width:640px){ .slide{ flex-basis:300px; } }
      @media (min-width:900px){ .slide{ flex-basis:340px; } }
      .review { border:1px solid var(--border); border-radius:16px; background:var(--card); padding:10px 12px; display:flex; flex-direction:column; max-width:340px; width:100%; min-height:75px; }
      .review blockquote { margin:0 0 4px; font-size:14px; line-height:1.35; }
      .review .meta { color:var(--muted); font-size:12px; margin-top:8px; }

      .prose h1, .prose h2, .prose h3 { margin: 16px 0 8px; }
      .prose p, .prose li { color: var(--fg); line-height:1.6; }
      .prose ul { padding-left: 18px; }
      .section--tight{ padding-bottom:18px; }
      @media (min-width:900px){ .section--tight{ padding-bottom:24px; } }

      /* --- Botão CTA amarelo (mesmo estilo do Add to Chrome) --- */
      .btn-gold {
        background:#fde047; color:#111; box-shadow:0 10px 22px rgba(253,224,71,.35);
        display:inline-flex; align-items:center; justify-content:center; gap:10px;
        border-radius:999px; font-weight:700; letter-spacing:.2px; padding:14px 20px;
        min-height:44px; text-decoration:none; transition:transform .12s ease, box-shadow .12s ease, opacity .12s ease;
        border:none;
      }
      .btn-gold, .btn-gold * { color:#111 !important; }
      .btn-gold:hover { box-shadow:0 14px 28px rgba(253,224,71,.45); transform:translateY(-1px); }
      .btn-gold:active { transform:translateY(1px); }
    `}</style>
  );
}

export function Header() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="/" className="brand">
          <img
            src="/../favicon-bg-180x180.png"
            alt="LinkTopics"
            className="brand-logo"
          />
          <span>{APP_NAME}</span>
        </a>
        <nav className="nav-center">
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <a href="/blog">Blog</a>
        </nav>
        <div className="nav-cta">
          <PrimaryCTA />
        </div>
      </div>
    </header>
  );
}

function PrimaryCTA() {
  const href = CHROME_URL && CHROME_URL.trim() ? CHROME_URL : CONTACT_MAILTO;
  return (
    <a
      className="btn btn-primary btn-chrome"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <SiGooglechrome size={28} color="currentColor" aria-hidden="true" />
      <span>Add to Chrome</span>
    </a>
  );
}

function SecondaryCTA({ label = "See Pro features" }) {
  return (
    <a className="btn btn-secondary" href="#pricing">
      {label}
    </a>
  );
}

function getEmbedUrl(url) {
  try {
    if (!url) return "";
    let out = url;
    if (out.includes("/embed/")) return out;
    if (out.includes("watch?v=")) out = out.replace("watch?v=", "embed/");
    if (out.includes("youtu.be/"))
      out = out.replace("youtu.be/", "www.youtube.com/embed/");
    if (!/^https?:\/\//i.test(out)) out = "https://" + out;
    return out;
  } catch {
    return url;
  }
}

function VideoEmbed({ url, title = "Video" }) {
  const src = getEmbedUrl(url);
  return (
    <div className="video-wrap">
      <iframe
        title={title}
        width="100%"
        height="100%"
        src={src}
        loading="lazy"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function Hero() {
  return (
    <section id="home" className="hero">
      <div className="container">
        <div className="grid-2" style={{ alignItems: "center" }}>
          <div>
            <h1>A Smarter LinkedIn Feed</h1>
            <p className="sub">
            Filter ads, reactions, and distractions — automatically.
            </p>
            <div className="hero-ctas">
              <PrimaryCTA />
              <SecondaryCTA />
            </div>
            <div className="hero-badges">
              <span className="badge dark">Runs locally</span>
              <span>• No risky automations • Not affiliated with LinkedIn</span>
            </div>
          </div>
          <div className="hero-visual">
            <VideoEmbed url={VIDEO_URL} title="Demo" />
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const reviews = [
    {
      q: "I liked this first version, Miguel told me next version will have things I asked for ;)",
      a: "— Rachel, HR Lead",
    },
    { q: "Instaled and approved!", a: "— Tommy, Business Analyst" },
    { q: "Saved me 10–15 minutes every morning.", a: "— Pedro, DevOps Engineer" },
    { q: "Topics > keywords. My LinkedIn is useful again.", a: "— Joana, Product Manager" },
    { q: "Exactly what I needed to stay focused while hiring.", a: "— Rui, Tech Recruiter" },
    { q: "My feed finally surfaces the posts I care about.", a: "— Sofia, Data Scientist" },
    { q: "Great for filtering noise while prospecting.", a: "— Marco, SDR" },
    { q: "Simple setup and it just works.", a: "— Laura, Software Engineer" },
  ];

  const Stars = () => (
    <div className="stars">
      {[...Array(5)].map((_, i) => (
        <svg key={i} viewBox="0 0 20 20">
          <path d="M10 1.8l2.5 5.1 5.6.8-4 3.9.9 5.6L10 14.7 4.9 17.2 5.8 11.6 1.8 7.7l5.6-.8L10 1.8z" />
        </svg>
      ))}
    </div>
  );

  return (
    <section className="section section--tight">
      <div className="container">
        <div className="social-top">
          <div className="rating">
            <Stars /> 4.9/5 from early users
          </div>
        </div>
        <div className="carousel" aria-label="User reviews">
          <div className="carousel-track">
            {[...reviews, ...reviews].map((r, idx) => (
              <div key={idx + ":" + r.q} className="slide">
                <div className="review">
                  <blockquote>“{r.q}”</blockquote>
                  <div className="meta">{r.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing({ annual, setAnnual }) {
  return (
    <section id="pricing" className="section">
      <div className="container">
        <SectionHeader eyebrow="Pricing" title="Clear, honest plans" />
        <div className="billing-toggle" role="tablist" aria-label="Billing period">
          <button
            onClick={() => setAnnual(false)}
            className={!annual ? "active" : ""}
            aria-pressed={!annual}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={annual ? "active" : ""}
            aria-pressed={annual}
          >
            Yearly
          </button>
        </div>
        <div className="pricing-grid">
          <div className="price-card">
            <div className="price-title">Free</div>
            <div className="price-amount">$0</div>
            <ul className="price-list">
              <li>Hide Promoted posts</li>
              <li>Counters (On Page/Total)</li>
            </ul>
            <div className="price-cta">
              <PrimaryCTA />
            </div>
          </div>

          <div className="price-card pop">
            <div className="price-title">Pro</div>
            <div className="price-amount">
              {annual ? (
                <>
                  <span>$3.99</span>{" "}
                  <span className="price-sub">/month billed as $48 per year</span>
                </>
              ) : (
                <>
                  $4.99 <span className="price-sub">/month</span>
                </>
              )}
            </div>
            <ul className="price-list">
              {annual && (
                <li className="em">
                  <span className="price-em">Save $12</span>
                </li>
              )}
              <li>Hide Promoted posts</li>
              <li>Hide Liked/Reacted Posts</li>
              <li>Hide Shared/Reshared posts</li>
              <li>Hide Suggested/Recommended Posts</li>
              <li>Counters (On Page/Total)</li>
              <li>Priority support</li>
            </ul>
            <div className="price-cta" style={{ display: "flex", gap: 10 }}>
              <a
                className="btn btn-gold"
                href={annual ? STRIPE_YEARLY_URL : STRIPE_MONTHLY_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Start Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="section-header">
      {eyebrow && (
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          {eyebrow}
        </div>
      )}
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

function FAQ() {
  const items = [
    {
      q: "Does it violate LinkedIn’s ToS?",
      a: "We’re read-only on the page (hide/highlight/reorder UI). No mass actions or automations. Use responsibly; not affiliated with LinkedIn.",
    },
    {
      q: "Is my data safe?",
      a: "We process everything locally in your browser. No third-party trackers by default. You can delete your data anytime.",
    },
    { q: "Will it slow down my LinkedIn?", a: "It’s lightweight and you can pause per-site or per-session anytime." },
    { q: "Which browsers are supported?", a: "Chrome, Brave, Edge (Chromium). Firefox on the roadmap." },
    { q: "What’s the difference vs. generic filters?", a: "Topics (semantic), measurable ROI (time saved), Focus scheduling, and safe-by-design." },
  ];

  return (
    <section id="faq" className="section">
      <div className="container">
        <SectionHeader eyebrow="FAQ" title="Answers to common questions" />
        <div className="faq-grid">
          {items.map(({ q, a }) => (
            <FaqItem key={q} q={q} a={a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-q" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{q}</span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

function FinalCTA() {
  return (
    <section className="final">
      <div className="container">
        <div className="final-card">
          <h2 style={{ fontSize: "clamp(28px,3.4vw,42px)", margin: "0 0 8px" }}>
            Turn LinkedIn into a focused feed in 30 seconds.
          </h2>
          <p style={{ color: "var(--muted)" }}>
            {APP_NAME} filters by topics, highlights relevance, and tracks time saved.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
            <PrimaryCTA />
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
            Not affiliated with or endorsed by LinkedIn Corp.
          </p>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   Legal pages (com SEO correto e sem FAQ/Software)
===================================================== */
function LegalPage({ kind }) {
  const canonical =
    kind === "privacy"
      ? "https://www.linktopics.me/privacy-policy"
      : "https://www.linktopics.me/tos";

  const pageTitle =
    kind === "privacy"
      ? "Privacy Policy | LinkTopics"
      : "Terms of Service | LinkTopics";

  const pageDescription =
    kind === "privacy"
      ? "Privacy policy for LinkTopics"
      : "Terms of service for LinkTopics";

  return (
    <main className="ltp-root">
      <Seo canonical={canonical} title={pageTitle} description={pageDescription} />
      <StyleTag />
      <Header />
      <section className="section">
        <div className="container prose">
          {kind === "privacy" ? (
            <>
              <SectionHeader eyebrow="Legal" title="Privacy Policy" />
              <PrivacyContent />
            </>
          ) : (
            <>
              <SectionHeader eyebrow="Legal" title="Terms of Service" />
              <TermsContent />
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function PrivacyContent() {
  return (
    <>
      <p>
        We respect your privacy. LinkTopics runs locally in your browser and does not
        automate actions on LinkedIn.
      </p>
      <h2>Data we process</h2>
      <ul>
        <li>Your topic preferences (saved in your browser).</li>
        <li>Optional analytics like time saved (local only unless you opt-in).</li>
        <li>No login, no third-party trackers by default.</li>
      </ul>
      <h2>Storage & deletion</h2>
      <p>Your settings live in your browser storage and can be deleted any time from the extension options.</p>
      <h2>Contact</h2>
      <p>
        Questions? <a href="mailto:miguel.duquec@gmail.com">miguel.duquec@gmail.com</a>
      </p>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <p>By installing and using LinkTopics you agree to these terms.</p>
      <h2>License</h2>
      <p>LinkTopics is provided “as is” without warranties of any kind. Do not reverse engineer or redistribute.</p>
      <h2>Acceptable use</h2>
      <p>Use the extension responsibly and in accordance with LinkedIn’s terms. We do not automate actions on your behalf.</p>
      <h2>Liability</h2>
      <p>To the maximum extent permitted by law, we are not liable for any damages arising from the use of the extension.</p>
    </>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="container footer-inner">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="dot" aria-hidden="true" />
          <div>
            <div style={{ fontWeight: 700 }}>{APP_NAME}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              © {new Date().getFullYear()} — Independent & privacy-friendly.
            </div>
          </div>
        </div>

        <div className="footer-legal">
          <h5>LEGAL</h5>
          <a href="/tos">Terms of service</a>
          <a href="/privacy-policy">Privacy policy</a>
        </div>

        {/* ✅ outgoing links (fix Ahrefs "no outgoing links") */}
        <div
          className="links"
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 14,
            fontSize: 14,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href={CHROME_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Chrome Web Store
          </a>

          <a
            href={VIDEO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch demo
          </a>

          <span>
            Made with ☕️ by{" "}
            <a
              href="https://x.com/miguelduquec"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "underline" }}
            >
              Miguel
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

