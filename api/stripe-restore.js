import Stripe from "stripe";
import jwt from "jsonwebtoken";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function issueLicenseToken(email, plan) {
  return jwt.sign(
    {
      sub: email,
      plan,
      iss: "linktopics",
    },
    process.env.LICENSE_JWT_SECRET,
    { expiresIn: "400d" }
  );
}

function isPaidOneTimeCheckout(session, targetEmail) {
  const knownEmails = [
    session?.customer_details?.email,
    session?.customer_email,
  ]
    .map(normalizeEmail)
    .filter(Boolean);

  return (
    session?.mode === "payment" &&
    session?.payment_status === "paid" &&
    knownEmails.includes(targetEmail)
  );
}

async function findActiveSubscriptionPlan(email) {
  const customers = await stripe.customers.list({ email, limit: 10 });

  for (const customer of customers.data || []) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 20,
    });

    const match = (subscriptions.data || []).find((sub) =>
      ACTIVE_SUBSCRIPTION_STATUSES.has(sub.status)
    );

    if (match) {
      const interval = match.items?.data?.[0]?.plan?.interval || "month";
      return interval;
    }
  }

  return null;
}

async function hasPaidCheckoutByEmail(email) {
  let startingAfter;

  for (let page = 0; page < 5; page += 1) {
    const response = await stripe.checkout.sessions.list({
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    const match = (response.data || []).find((session) =>
      isPaidOneTimeCheckout(session, email)
    );

    if (match) return true;
    if (!response.has_more || !response.data?.length) break;

    startingAfter = response.data[response.data.length - 1].id;
  }

  return false;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const email = normalizeEmail(req.body?.email);

    if (!email || !email.includes("@")) {
      return res.status(400).json({ ok: false, error: "invalid_email" });
    }

    const subscriptionPlan = await findActiveSubscriptionPlan(email);
    if (subscriptionPlan) {
      const token = issueLicenseToken(email, subscriptionPlan);
      return res.status(200).json({ ok: true, token, plan: subscriptionPlan });
    }

    const hasOneTimePurchase = await hasPaidCheckoutByEmail(email);
    if (hasOneTimePurchase) {
      const token = issueLicenseToken(email, "oneoff");
      return res.status(200).json({ ok: true, token, plan: "oneoff" });
    }

    return res.status(404).json({ ok: false, error: "purchase_not_found" });
  } catch (err) {
    console.error("stripe-restore error", err);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
