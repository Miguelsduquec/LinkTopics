import Stripe from "stripe";
import { maskEmail, normalizeEmail } from "./_lib/stripe-entitlements.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const DEFAULT_APP_URL = "https://www.linktopics.me";
const STRIPE_CHECKOUT_URL_PREFIXES = [
  "https://buy.stripe.com/",
  "https://checkout.stripe.com/",
];

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

function isHostedStripeCheckoutUrl(value) {
  return STRIPE_CHECKOUT_URL_PREFIXES.some((prefix) => value.startsWith(prefix));
}

function summarizeCheckoutTarget(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "missing";
  if (isHostedStripeCheckoutUrl(rawValue)) return "hosted_checkout_url";
  if (rawValue.startsWith("price_")) return `price:${rawValue.slice(0, 12)}`;
  if (rawValue.startsWith("prod_")) return `product:${rawValue.slice(0, 12)}`;
  return `unknown:${rawValue.slice(0, 12)}`;
}

async function resolvePriceFromProduct(productId) {
  const product = await stripe.products.retrieve(productId, {
    expand: ["default_price"],
  });

  const defaultPrice = product?.default_price;
  const defaultPriceId =
    typeof defaultPrice === "string" ? defaultPrice : defaultPrice?.id || "";

  if (!defaultPriceId) {
    const error = new Error("product_missing_default_price");
    error.code = "product_missing_default_price";
    throw error;
  }

  if (typeof defaultPrice === "string") {
    return stripe.prices.retrieve(defaultPrice, { expand: ["product"] });
  }

  return defaultPrice;
}

async function resolveCheckoutTarget(rawValue) {
  const value = String(rawValue || "").trim();

  if (!value) {
    const error = new Error("missing_checkout_target");
    error.code = "missing_checkout_target";
    throw error;
  }

  if (isHostedStripeCheckoutUrl(value)) {
    return {
      kind: "hosted_checkout_url",
      url: value,
      mode: "payment",
      recurring: false,
      priceId: "",
      productId: "",
    };
  }

  const price = value.startsWith("prod_")
    ? await resolvePriceFromProduct(value)
    : await stripe.prices.retrieve(value, { expand: ["product"] });

  const productId =
    typeof price?.product === "string" ? price.product : price?.product?.id || "";

  return {
    kind: value.startsWith("prod_") ? "product_default_price" : "price",
    mode: price?.recurring ? "subscription" : "payment",
    recurring: !!price?.recurring,
    priceId: price?.id || "",
    productId,
  };
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
    const configuredTarget = process.env.STRIPE_LIFETIME_PRICE_ID;
    const checkoutTarget = await resolveCheckoutTarget(configuredTarget);

    if (checkoutTarget.kind === "hosted_checkout_url") {
      console.info("stripe-checkout using hosted checkout url", {
        browserId,
        email: maskEmail(email),
        configuredTarget: summarizeCheckoutTarget(configuredTarget),
      });

      return res.status(200).json({
        ok: true,
        url: checkoutTarget.url,
        fallback: true,
      });
    }

    const sessionParams = {
      mode: checkoutTarget.mode,
      allow_promotion_codes: true,
      line_items: [
        {
          price: checkoutTarget.priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
      metadata: {
        linktopics_product: "pro",
        linktopics_plan: checkoutTarget.mode === "subscription" ? "subscription" : "oneoff",
        linktopics_browser_id: browserId,
      },
      ...(browserId ? { client_reference_id: browserId } : {}),
      ...(email ? { customer_email: email } : {}),
    };

    if (checkoutTarget.mode === "payment") {
      sessionParams.customer_creation = "always";
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.info("stripe-checkout created", {
      sessionId: session.id,
      browserId,
      email: maskEmail(email),
      baseUrl,
      configuredTarget: summarizeCheckoutTarget(configuredTarget),
      resolvedKind: checkoutTarget.kind,
      resolvedPriceId: checkoutTarget.priceId,
      mode: checkoutTarget.mode,
      recurring: checkoutTarget.recurring,
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
      configuredTarget: summarizeCheckoutTarget(process.env.STRIPE_LIFETIME_PRICE_ID),
    });
    return res.status(500).json({ ok: false, error: "checkout_create_failed" });
  }
}
