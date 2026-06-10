import Stripe from "stripe";
import { maskEmail, normalizeEmail } from "./_lib/stripe-entitlements.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const DEFAULT_APP_URL = "https://www.linktopics.me";

function resolveBaseUrl(req) {
  const forwardedHost = req.headers["x-forwarded-host"];
  const host = forwardedHost || req.headers.host || "";
  const proto = req.headers["x-forwarded-proto"] || "https";

  if (host) {
    return `${proto}://${host}`;
  }

  return process.env.APP_URL || DEFAULT_APP_URL;
}

function sanitizeBrowserId(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 120);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("stripe-checkout missing STRIPE_SECRET_KEY");
    return res.status(500).json({ ok: false, error: "checkout_not_configured" });
  }

  if (!process.env.STRIPE_LIFETIME_PRICE_ID) {
    console.error("stripe-checkout missing STRIPE_LIFETIME_PRICE_ID");
    return res.status(500).json({ ok: false, error: "checkout_not_configured" });
  }

  try {
    const baseUrl = resolveBaseUrl(req);
    const browserId = sanitizeBrowserId(req.body?.browserId);
    const email = normalizeEmail(req.body?.email);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,
      customer_creation: "always",
      line_items: [
        {
          price: process.env.STRIPE_LIFETIME_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
      metadata: {
        linktopics_product: "pro",
        linktopics_plan: "oneoff",
        linktopics_browser_id: browserId,
      },
      ...(browserId ? { client_reference_id: browserId } : {}),
      ...(email ? { customer_email: email } : {}),
    });

    console.info("stripe-checkout created", {
      sessionId: session.id,
      browserId,
      email: maskEmail(email),
      baseUrl,
    });

    return res.status(200).json({
      ok: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    console.error("stripe-checkout error", {
      message: err?.message,
      type: err?.type,
      code: err?.code,
      email: maskEmail(req.body?.email),
      browserId: sanitizeBrowserId(req.body?.browserId),
    });
    return res.status(500).json({ ok: false, error: "checkout_create_failed" });
  }
}
