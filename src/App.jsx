import React, { useState, useEffect } from "react";
import { SiGooglechrome } from "react-icons/si";
import BlogPage from "./blog.jsx";
import "./App.css";

const APP_NAME = "LinkTopics";
const CHROME_URL = "https://chromewebstore.google.com/detail/bdilfiejpkdfbildemdncbkblegpejfb?utm_source=item-share-cb";
const VIDEO_URL = "https://www.youtube.com/watch?v=L28hvycCQqc";
const CONTACT_MAILTO = "mailto:miguel.duquec@gmail.com?subject=Support%20request";

export default function AppRouter() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (path === '/privacy-policy') return <LegalPage kind="privacy" />;
  if (path === '/tos' || path === '/terms' || path === '/terms-of-service') return <LegalPage kind="tos" />;
  if (path.startsWith('/blog')) return (
    <main className="ltp-root" data-page="blog">
      <Seo />
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
  return (
    <main className="ltp-root">
      <Seo />
      <StyleTag />
      <Header />
      <Hero />
      <SocialProof />
      <HowItWorks />
      <Pricing annual={annual} setAnnual={setAnnual} />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}

export function Seo() {
  const title = "LinkTopics – LinkedIn Feed Filter (Chrome Extension)";
  const description = "A LinkedIn feed cleaner: hide ads and promoted posts, remove job posts from the feed, mute keywords, and highlight topics. The simplest Chrome extension to focus on what matters and keep a clean, focused LinkedIn";
  const url = "https://linktopics.me/";
  const image = '../public/favicon-64x64.png';
  const siteName = "LinkTopics";

  const jsonLdSoftware = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteName,
    applicationCategory: 'BrowserExtension',
    operatingSystem: 'Chrome, Edge',
    offers: [
      { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free' },
      { '@type': 'Offer', price: '4.99', priceCurrency: 'USD', name: 'Pro (monthly)'},
      { '@type': 'Offer', price: '48', priceCurrency: 'USD', priceValidUntil: '2026-12-31', name: 'Pro (yearly)'}
    ],
    description
  };

  const jsonLdFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Is my data safe?', acceptedAnswer: { '@type': 'Answer', text: 'Everything runs locally in your browser. No risky automations.' } },
      { '@type': 'Question', name: 'Which browsers are supported?', acceptedAnswer: { '@type': 'Answer', text: 'Chrome, Brave and Edge (Chromium). Firefox on the roadmap.' } }
    ]
  };

  useEffect(() => {
    const ensureCharset = () => {
      let c = document.head.querySelector('meta[charset]');
      if (!c) { c = document.createElement('meta'); c.setAttribute('charset', 'utf-8'); document.head.prepend(c); }
    };

    const setMeta = (attr, key, value) => {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute('content', value);
    };

    const linkRel = (rel, href, extra = {}) => {
      let l = Array.from(document.head.querySelectorAll(`link[rel="${rel}"]`)).find(x => x.getAttribute('href') === href);
      if (!l) {
        l = document.createElement('link');
        l.setAttribute('rel', rel);
        l.setAttribute('href', href);
        for (const k in extra) l.setAttribute(k, extra[k]);
        document.head.appendChild(l);
      }
    };

    const scriptJson = (id, data) => {
      let s = document.getElementById(id);
      if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = id; document.head.appendChild(s); }
      s.textContent = JSON.stringify(data);
    };

    document.documentElement.lang = 'en';
    document.title = title;
    ensureCharset();

    setMeta('name', 'description', description);
    setMeta('name', 'viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
    setMeta('name', 'theme-color', '#ffffff');
    setMeta('name', 'robots', 'index,follow,max-image-preview:large');
    setMeta('name', 'referrer', 'origin-when-cross-origin');

    linkRel('canonical', url);
    linkRel('preconnect', 'https://fonts.gstatic.com', { crossorigin: '' });
    linkRel('preconnect', 'https://fonts.googleapis.com');
    linkRel('stylesheet', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    linkRel('preconnect', 'https://www.youtube.com');
    linkRel('preconnect', 'https://i.ytimg.com');
    linkRel('icon', '/favicon-32x32.png', { sizes: '32x32', type: 'image/png' });
    linkRel('icon', '/favicon-16x16.png', { sizes: '16x16', type: 'image/png' });
    linkRel('apple-touch-icon', '/apple-touch-icon.png');
    linkRel('manifest', '/site.webmanifest');
    linkRel('sitemap', '/sitemap.xml', { type: 'application/xml' });

    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:site_name', siteName);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    setMeta('property', 'og:locale', 'en_US');

    setMeta('name', 'twitter:card', '../public/favicon-64x64.png');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);
    setMeta('name', 'twitter:site', '@miguelduquec');

    scriptJson('ld-software', jsonLdSoftware);
    scriptJson('ld-faq', jsonLdFAQ);
  }, []);

  return null;
}

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
      .panel { border:1px solid var(--border); border-radius:14px; background:#fff; padding:16px; box-shadow:var(--shadow); }
      .panel-row { display:flex; align-items:center; gap:12px; justify-content:flex-start; margin-bottom:12px; }
      .panel-label { font-size:14px; font-weight:600; margin-right:8px; }
      .btn-ghost { margin-left:auto; border:1px solid var(--border); background:#fff; border-radius:10px; padding:6px 10px; font-weight:600; font-size:12px; transition:filter .12s ease, box-shadow .12s ease, transform .12s ease; }
      .btn-ghost:hover { filter:brightness(.97); box-shadow:var(--shadow); transform:translateY(-1px); }
      .panel-title { font-weight:700; margin:10px 0 6px; font-size:14px; }
      .chips { display:flex; gap:8px; flex-wrap:wrap; }
      .chip { padding:6px 12px; border-radius:999px; font-size:12px; border:1px solid var(--border); background:#f3f4f6; color:#111; appearance:none; user-select:none; }
      .chip-btn { cursor:pointer; transition:transform .12s ease, box-shadow .12s ease, background .12s ease, border-color .12s ease; }
      .chip-btn:not([aria-disabled="true"]):hover { background:rgba(37,99,235,.12); border-color:rgba(37,99,235,.55); box-shadow:var(--shadow); transform:translateY(-1px); }
      .chip-blue { background:rgba(37,99,235,.10); border-color:rgba(37,99,235,.35); color:#1e40af; font-weight:700; }
      .chip[aria-disabled="true"] { pointer-events:none; opacity:.6; filter:grayscale(0.1); }
      .panel-note { font-size:12px; color:#374151; margin-top:6px; }
      .panel-stats { margin-top:12px; border:1px solid var(--border); border-radius:10px; overflow:hidden; }
      .panel-stats-title { background:#f9fafb; padding:8px 12px; font-weight:700; font-size:14px; border-bottom:none; }
      .panel-stats-body { display:flex; justify-content:space-between; padding:10px 12px; font-size:14px; }
      .panel-actions { display:flex; align-items:center; gap:12px; margin-top:12px; }
      .btn-lock { display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border:1px solid var(--border); background:#fff; border-radius:10px; font-size:13px; color:#6b7280; }
      .btn-learn { background:#fde047; color:#111; padding:8px 12px; border-radius:10px; font-weight:700; text-decoration:none; }
      .btn-learn:hover { filter:brightness(.95); box-shadow:var(--shadow); }
      .red { color:#dc2626; }
      .switch { position:relative; display:inline-block; width:44px; height:24px; }
      .switch input { opacity:0; width:0; height:0; }
      .slider { position:absolute; cursor:pointer; inset:0; background:#e5e7eb; transition:.2s; border-radius:999px; }
      .slider::before { position:absolute; content:""; height:18px; width:18px; left:3px; top:3px; background:white; transition:.2s; border-radius:50%; box-shadow:0 1px 2px rgba(0,0,0,.2); }
      .switch input:checked + .slider { background:var(--primary); }
      .switch input:checked + .slider::before { transform:translateX(20px); }
      .section-header { text-align:center; margin-bottom:28px; }
      .section-header h2 { font-size:clamp(26px,3vw,36px); margin:4px 0; color:var(--fg); }
      .section-header p { color:var(--muted); }
      .eyebrow { font-size:clamp(14px,1.2vw,16px); font-weight:800; color:var(--primary); }
      .steps { display:grid; gap:18px; grid-template-columns:1fr; }
      @media (min-width:900px){ .steps{ grid-template-columns:repeat(3,1fr); } }
      .step { display:flex; gap:14px; }
      .step-index { width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#111; color:#fff; font-weight:700; }
      .step h4 { margin:0 0 6px; }
      .step p { margin:0; color:var(--muted); font-size:14px; }
      .how-mock { margin-top:28px; }
      .mock-feed { position:relative; border:1px solid var(--border); border-radius:16px; overflow:hidden; background:#f3f4f6; box-shadow:var(--shadow); }
      .feed-toolbar { height:44px; background:#fff; border-bottom:1px solid var(--border); display:grid; grid-template-columns:1fr auto 1fr; align-items:center; padding:0 10px; }
      .address-bar { justify-self:center; display:inline-flex; align-items:center; gap:8px; padding:6px 12px; border:1px solid var(--border); background:#f3f4f6; border-radius:999px; font-size:12px; color:#374151; }
      .address-bar .lock { width:12px; height:12px; border:2px solid currentColor; border-bottom:none; border-radius:2px; position:relative; }
      .address-bar .lock::after { content:""; position:absolute; left:50%; transform:translateX(-50%); top:-6px; width:10px; height:6px; border:2px solid currentColor; border-bottom:none; border-radius:6px 6px 0 0; }
      .ext-icon { justify-self:end; width:36px; height:36px; border-radius:999px; display:flex; align-items:center; justify-content:center; }
      .ext-icon.on { background:var(--primary); color:#fff; }
      .ext-icon.off { background:#e5e7eb; color:#0b0b0f; }
      .window-dots{display:inline-flex;gap:6px;align-items:center;}
      .window-dot{width:12px;height:12px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12);} 
      .window-dot.r{background:#ff5f56;} 
      .window-dot.y{background:#ffbd2e;} 
      .window-dot.g{background:#27c93f;}
      .side-left { display:none; }
      @media (min-width:900px){ .side-left{ display:flex; } }
      .profile-card { background:#fff; border:1px solid var(--border); border-radius:12px; padding:14px; }
      .avatar { width:56px; height:56px; border-radius:999px; background:linear-gradient(180deg,#c7d2fe,#e5e7eb); }
      .name { font-weight:700; margin-top:10px; }
      .title { font-size:12px; color:#6b7280; }
      .post { background:#fff; border:1px solid var(--border); border-radius:12px; padding:14px; }
      .post.hi { border-color:var(--primary); box-shadow:0 0 0 2px rgba(37,99,235,.2) inset; background:linear-gradient(180deg,#eef2ff,#ffffff); }
      .feed-cols { display:grid; gap:16px; grid-template-columns:1fr; padding:14px; }
      @media (min-width:900px){ .feed-cols{ grid-template-columns:260px 1fr 300px; } }
      .feed-col { display:flex; flex-direction:column; gap:14px; }
      .overlay-panel { position:absolute; right:12px; top:56px; width:340px; max-width:calc(100% - 24px); }
      @media (max-width:900px){ .overlay-panel{ position:static; width:100%; margin-top:12px; } }
      @media (max-width:640px){ .overlay-panel{ position:static; width:100%; } }
      .side-card { background:#fff; border:1px solid var(--border); border-radius:12px; padding:12px; min-height:80px; }
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
      .faq-grid { display:grid; gap:12px; grid-template-columns:1fr; }
      @media (min-width:1000px){ .faq-grid{ grid-template-columns:repeat(2,1fr); } }
      .faq-item { border:1px solid var(--border); border-radius:16px; background:var(--card); }
      .faq-q { width:100%; text-align:left; background:none; border:none; padding:14px 16px; font-weight:700; display:flex; justify-content:space-between; align-items:center; }
      .faq-a { padding:0 16px 16px; color:var(--muted); font-size:14px; }
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
      #how.section{ padding-top:18px; }
      @media (min-width:900px){ #how.section{ padding-top:24px; } }
    `}</style>
  );
}

export function Header() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="/" className="brand">
        <img src="/../favicon-bg-180x180.png" alt="LinkTopics" className="brand-logo" />
        <span>{APP_NAME}</span>
        </a>
        <nav className="nav-center">
          <a href="#how">How it works</a>
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
    <a className="btn btn-primary btn-chrome" href={href} target="_blank" rel="noopener noreferrer">
      <SiGooglechrome size={28} color="currentColor" aria-hidden="true" />
      <span>Add to Chrome</span>
    </a>
  );
}

function SecondaryCTA({ label = "See Pro features" }) {
  return <a className="btn btn-secondary" href="#pricing">{label}</a>;
}

function getEmbedUrl(url) {
  try {
    if (!url) return "";
    let out = url;
    if (out.includes("/embed/")) return out;
    if (out.includes("watch?v=")) out = out.replace("watch?v=", "embed/");
    if (out.includes("youtu.be/")) out = out.replace("youtu.be/", "www.youtube.com/embed/");
    if (!/^https?:\/\//i.test(out)) out = "https://" + out;
    return out;
  } catch { return url; }
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
        <div className="grid-2" style={{alignItems:'center'}}>
          <div>
            <h1>Focus mode for LinkedIn</h1>
            <p className="sub">Tell LinkedIn what to show: hide irrelevant posts, highlight what you care about, and reorder your feed around your interests.</p>
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

function ControlPanelMock({ on, setOn, hide, setHide, hl, setHl }) {
  const off = !on;
  const totalCount = Object.values(hide).filter(Boolean).length + Object.values(hl).filter(Boolean).length;
  const canAdd = totalCount < 3;
  const hiddenOnPage = (on && hide.job ? 1 : 0) + (on && hide.promoted ? 1 : 0);
  const totalPosts = 5;

  const toggleHide = (key) => {
    if (off) return;
    setHide((s) => {
      const next = { ...s };
      const cur = !!next[key];
      if (cur) { next[key] = false; return next; }
      if (!canAdd) return s;
      next[key] = true; return next;
    });
  };

  const toggleHl = (key) => {
    if (off) return;
    setHl((s) => {
      const next = { ...s };
      const cur = !!next[key];
      if (cur) { next[key] = false; return next; }
      if (!canAdd) return s;
      next[key] = true; return next;
    });
  };

  const hideCls = (active) => (active && !off ? "chip chip-btn chip-blue" : "chip chip-btn");
  const hlCls = (active) => (active && !off ? "chip chip-btn chip-blue" : "chip chip-btn");
  const disabledWhenFull = (active) => off || (!active && !canAdd);

  return (
    <div className="panel" aria-label="Extension panel mock">
      <div className="panel-row">
        <div className="panel-label">Filtering</div>
        <label className="switch" aria-label="Filtering toggle">
          <input type="checkbox" checked={on} onChange={(e)=>setOn(e.target.checked)} />
          <span className="slider" />
        </label>
        <button className="btn-ghost">Reload</button>
      </div>

      <div className="panel-group">
        <div className="panel-title">Hide topics:</div>
        <div className="chips">
          <button type="button" className={hideCls(hide.job)} aria-disabled={disabledWhenFull(hide.job)} onClick={()=>toggleHide('job')}>Job posts</button>
          <button type="button" className={hideCls(hide.liked)} aria-disabled={disabledWhenFull(hide.liked)} onClick={()=>toggleHide('liked')}>Liked by</button>
          <button type="button" className={hideCls(hide.promoted)} aria-disabled={disabledWhenFull(hide.promoted)} onClick={()=>toggleHide('promoted')}>Promoted</button>
        </div>
      </div>

      <div className="panel-group">
        <div className="panel-title">Highlight topics:</div>
        <div className="chips">
          <button type="button" className={hlCls(hl.it)} aria-disabled={disabledWhenFull(hl.it)} onClick={()=>toggleHl('it')}>IT</button>
          <button type="button" className={hlCls(hl.marketing)} aria-disabled={disabledWhenFull(hl.marketing)} onClick={()=>toggleHl('marketing')}>Marketing</button>
          <button type="button" className={hlCls(hl.startups)} aria-disabled={disabledWhenFull(hl.startups)} onClick={()=>toggleHl('startups')}>Startups</button>
        </div>
        <div className="panel-note">You selected <strong className="red">{totalCount}</strong> of <strong>3</strong> allowed topics.</div>
      </div>

      <div className="panel-stats">
        <div className="panel-stats-title">Posts</div>
        <div className="panel-stats-body">
          <span><strong className="red">{hiddenOnPage}</strong> on this page</span>
          <span><strong className="red">{totalPosts}</strong> in total</span>
        </div>
      </div>

      <div className="panel-actions">
        <button className="btn-lock" aria-label="Add more topics" disabled>
          <span role="img" aria-hidden="true">🔒</span> Add more topics
        </button>
        <a className="btn-learn" href="#how">Learn More…</a>
      </div>
    </div>
  );
}

export function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="section-header">
      {eyebrow && <div className="eyebrow" style={{marginBottom:6}}>{eyebrow}</div>}
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

function HowItWorks() {
  const [filterOn, setFilterOn] = useState(true);
  const [hide, setHide] = useState({ job: false, liked: false, promoted: false });
  const [hl, setHl] = useState({ it: false, marketing: false, startups: false });

  return (
    <section id="how" className="section">
      <div className="container">
        <SectionHeader eyebrow="How it works" title="3 steps to a focused feed" />
        <div className="steps">
          <Step index={1} title="Change Language to English" text={'Click the "Me" icon, on top bar > Language > English.'} />
          <Step index={2} title="Pick your topics" text="Hide noise, highlight what matters, and reorder when needed." />
          <Step index={3} title="Track your gains" text="See posts removed, relevant posts found, and time saved." />
        </div>
        <div className="how-mock">
          <LinkedInFeed on={filterOn} hide={hide} hl={hl} setOn={setFilterOn} setHide={setHide} setHl={setHl} />
        </div>
      </div>
    </section>
  );
}

function Step({ index, title, text }) {
  return (
    <div className="step">
      <div className="step-index">{index}</div>
      <div>
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </div>
  );
}

function ExtGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" ry="3" fill="currentColor" />
      <rect x="6" y="8" width="12" height="9" rx="1.5" ry="1.5" fill="#fff" opacity=".15" />
    </svg>
  );
}

function LinkedInFeed({ on, hide, hl, setOn, setHide, setHl }) {
  const show1 = !(on && hide && hide.job);
  const show3 = !(on && hide && hide.promoted);
  const hi = !!(on && hl && hl.it);

  const posts = [
    { id:1, title:'Capgemini', meta:'2h • Following', body:'We’re hiring a Power Platform Developer in Portugal. Hybrid role, great team—apply inside.' },
    { id:2, title:'Azure Updates', meta:'1h • Following', body:'New Azure Functions features improve cold-starts and diagnostics for .NET and Node runtimes.' },
    { id:3, title:'Digital Marketing', meta:'Sponsored', body:'Promote your brand to 1M+ professionals. Launch highly targeted campaigns on LinkedIn with AdPro. Start today.' },
    { id:4, title:'Interesting Engineering', meta:'3h • Following', body:'From microservices to event-driven systems: why messaging patterns matter for scalable backends.' },
    { id:5, title:'Microsoft Dev', meta:'45m • Following', body:'Power Platform: best practices for connectors, environment strategy, and ALM automation.' }
  ];

  const visible = posts.filter(p => !(p.id===1 && !show1) && !(p.id===3 && !show3));

  const Post = ({title, body, meta, highlighted}) => (
    <div className={`post ${highlighted ? 'hi' : ''}`}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <div className="post-header" style={{flex:1}}>
          <div className="avatar sm" />
          <div>
            <div className="post-title">{title}</div>
            <div className="post-meta">{meta}</div>
          </div>
        </div>
      </div>
      <div className="post-body">
        <p>{body}</p>
      </div>
    </div>
  );

  return (
    <div className="mock-feed">
      <div className="feed-toolbar">
        <div className="window-dots"><span className="window-dot r"></span><span className="window-dot y"></span><span className="window-dot g"></span></div>
        <div className="address-bar"><span className="lock" aria-hidden="true"></span>linkedin.com</div>
        <div className={`ext-icon ${on ? 'on' : 'off'}`} title={on ? 'Filtering ON' : 'Filtering OFF'}>
          <ExtGlyph />
        </div>
      </div>

      <div className="feed-cols">
        <div className="feed-col side-left">
          <div className="profile-card">
            <div className="avatar" />
            <div className="name">Miguel Carreira</div>
            <div className="title">Power Platform developer | Microsoft Dynamics 365 | RPA</div>
          </div>
          <div className="side-card" />
          <div className="side-card" />
        </div>

        <div className="feed-col">
          {visible.map(p => (
            <Post key={p.id} title={p.title} body={p.body} meta={p.meta} highlighted={hi && (p.id===2 || p.id===4)} />
          ))}
        </div>

        <div className="feed-col" style={{display:'none'}}>
          <div className="side-card" />
          <div className="side-card" />
        </div>
      </div>

      <div className="overlay-panel">
        <ControlPanelMock on={on} setOn={setOn} hide={hide} setHide={setHide} hl={hl} setHl={setHl} />
      </div>
    </div>
  );
}

function SocialProof() {
  const reviews = [
    { q: "I liked this first version, Miguel told me next version will have things I asked for ;)", a: "— Rachel, HR Lead" },
    { q: "Instaled and approved!", a: "— Tommy, Business Analyst" },
    { q: "Saved me 10–15 minutes every morning.", a: "— Pedro, DevOps Engineer" },
    { q: "Topics > keywords. My LinkedIn is useful again.", a: "— Joana, Product Manager" },
    { q: "Exactly what I needed to stay focused while hiring.", a: "— Rui, Tech Recruiter" },
    { q: "My feed finally surfaces the posts I care about.", a: "— Sofia, Data Scientist" },
    { q: "Great for filtering noise while prospecting.", a: "— Marco, SDR" },
    { q: "Simple setup and it just works.", a: "— Laura, Software Engineer" }
  ];

  const Stars = () => (
    <div className="stars">{[...Array(5)].map((_,i)=> (<svg key={i} viewBox="0 0 20 20"><path d="M10 1.8l2.5 5.1 5.6.8-4 3.9.9 5.6L10 14.7 4.9 17.2 5.8 11.6 1.8 7.7l5.6-.8L10 1.8z"/></svg>))}</div>
  );

  return (
    <section className="section section--tight">
      <div className="container">
        <div className="social-top">
          <div className="rating"><Stars /> 4.9/5 from early users</div>
        </div>
        <div className="carousel" aria-label="User reviews">
          <div className="carousel-track">
            {[...reviews, ...reviews].map((r,idx)=> (
              <div key={idx+':'+r.q} className="slide">
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
          <button onClick={() => setAnnual(false)} className={!annual ? "active" : ""} aria-pressed={!annual}>Monthly</button>
          <button onClick={() => setAnnual(true)} className={annual ? "active" : ""} aria-pressed={annual}>Yearly</button>
        </div>
        <div className="pricing-grid">
          <div className="price-card">
            <div className="price-title">Free</div>
            <div className="price-amount">$0</div>
            <ul className="price-list">
              <li>Up to 3 topics</li>
              <li>Hide + basic Highlight</li>
              <li>Counters (posts/time)</li>
              <li>1 preset</li>
            </ul>
            <div className="price-cta"><PrimaryCTA /></div>
          </div>
          <div className="price-card pop">
            <div className="price-title">Pro</div>
            <div className="price-amount">{annual ? (<><span>$3.99</span> <span className="price-sub">/month billed as $48 per year</span></>) : (<>$4.99 <span className="price-sub">/month</span></>)}</div>
            <ul className="price-list">
              {annual && (<li className="em"><span className="price-em">Save $12</span></li>)}
              <li>Unlimited topics</li>
              <li>Highlight topics show first in feed</li>
              <li>More topics: Personal stories, Achievements, Live videos, Network, and more.</li>
              <li>Presets for Devs, Founders, HR, Sales</li>
              <li>Personal analytics & weekly summary</li>
              <li>Priority support</li>
            </ul>
            <div className="price-cta" style={{display:'flex', gap:10}}>
              <button className="btn btn-primary" type="button" disabled>Start 14-day trial (soon)</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "Does it violate LinkedIn’s ToS?", a: "We’re read-only on the page (hide/highlight/reorder UI). No mass actions or automations. Use responsibly; not affiliated with LinkedIn." },
    { q: "Is my data safe?", a: "We process everything locally in your browser. No third-party trackers by default. You can delete your data anytime." },
    { q: "Will it slow down my LinkedIn?", a: "It’s lightweight and you can pause per-site or per-session anytime." },
    { q: "Which browsers are supported?", a: "Chrome, Brave, Edge (Chromium). Firefox on the roadmap." },
    { q: "What’s the difference vs. generic filters?", a: "Topics (semantic), measurable ROI (time saved), Focus scheduling, and safe-by-design." },
  ];

  return (
    <section id="faq" className="section">
      <div className="container">
        <SectionHeader eyebrow="FAQ" title="Answers to common questions" />
        <div className="faq-grid">
          {items.map(({q,a}) => (<FaqItem key={q} q={q} a={a} />))}
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
        <span aria-hidden="true">{open ? '−' : '+'}</span>
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
          <h2 style={{fontSize:'clamp(28px,3.4vw,42px)', margin:'0 0 8px'}}>Turn LinkedIn into a focused feed in 30 seconds.</h2>
          <p style={{color:'var(--muted)'}}>{APP_NAME} filters by topics, highlights relevance, and tracks time saved.</p>
          <div style={{display:'flex', gap:12, justifyContent:'center', marginTop:16}}>
            <PrimaryCTA />
          </div>
          <p style={{marginTop:12, fontSize:12, color:'var(--muted)'}}>Not affiliated with or endorsed by LinkedIn Corp.</p>
        </div>
      </div>
    </section>
  );
}

function BlogPageFallback() {
  return (
    <main className="ltp-root">
      <Seo />
      <StyleTag />
      <Header />
      <section className="section">
        <div className="container prose">
          <SectionHeader eyebrow="Blog" title="Latest posts" />
          <div className="feed-col">
            <article className="post">
              <h3>Introducing LinkTopics</h3>
              <p>Why topics beat keywords for keeping your LinkedIn signal high.</p>
            </article>
            <article className="post">
              <h3>How we keep your data local</h3>
              <p>Everything runs in your browser—here’s how the extension is built.</p>
            </article>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function LegalPage({ kind }) {
  return (
    <main className="ltp-root">
      <Seo />
      <StyleTag />
      <Header />
      <section className="section">
        <div className="container prose">
          {kind === 'privacy' ? (
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

function PrivacyContent(){
  return (
    <>
      <p>We respect your privacy. LinkTopics runs locally in your browser and does not automate actions on LinkedIn.</p>
      <h2>Data we process</h2>
      <ul>
        <li>Your topic preferences (saved in your browser).</li>
        <li>Optional analytics like time saved (local only unless you opt-in).</li>
        <li>No login, no third-party trackers by default.</li>
      </ul>
      <h2>Storage & deletion</h2>
      <p>Your settings live in your browser storage and can be deleted any time from the extension options.</p>
      <h2>Contact</h2>
      <p>Questions? <a href="mailto:miguel.duquec@gmail.com">miguel.duquec@gmail.com</a></p>
    </>
  );
}

function TermsContent(){
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
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div className="dot" aria-hidden="true" />
          <div>
            <div style={{fontWeight:700}}>{APP_NAME}</div>
            <div style={{fontSize:12, color:'var(--muted)'}}>© {new Date().getFullYear()} — Independent & privacy-friendly.</div>
          </div>
        </div>
        <div className="footer-legal">
          <h5>LEGAL</h5>
          <a href="https://www.linktopics.me/tos">Terms of service</a>
          <a href="https://www.linktopics.me/privacy-policy">Privacy policy</a>
        </div>
        <div className="links" style={{marginLeft:'auto', display:'flex', gap:12, fontSize:14, alignItems:'center'}}>
          <span>Made with ☕️ by <a href="https://x.com/miguelduquec" target="_blank" rel="noreferrer" style={{textDecoration:'underline'}}>Miguel</a></span>
        </div>
      </div>
    </footer>
  );
}

// Se quiseres usar o BlogPage definido em ./blog.jsx, o fallback acima não é usado.
// Mantive-o aqui apenas como exemplo. Se o teu ./blog.jsx exporta por defeito BlogPage,
// podes apagar a função BlogPageFallback e deixar a importação no topo ativa.
