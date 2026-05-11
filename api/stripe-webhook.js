import Stripe from "stripe";
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  ensureCustomerForCheckoutSession,
  getPlanFromSubscription,
  normalizeEmail,
  updateCustomerEntitlement,
} from "./_lib/stripe-entitlements.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function readRawBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

async function handleCheckoutSessionCompleted(session, eventType) {
  const paid =
    (session?.mode === "payment" && session?.payment_status === "paid") ||
    session?.mode === "subscription";

  if (!paid) return;

  const customer = await ensureCustomerForCheckoutSession(stripe, session);
  if (!customer?.id) return;

  let plan = "oneoff";
  let subscriptionId = "";

  if (session?.mode === "subscription") {
    subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session?.subscription?.id || "";

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      plan = getPlanFromSubscription(subscription);
    }
  }

  await updateCustomerEntitlement(stripe, customer.id, {
    status: "active",
    grantsPro: true,
    plan,
    source: "checkout",
    checkoutSessionId: session.id,
    subscriptionId,
    paymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : "",
    paidAt: new Date((session.created || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    lastEvent: eventType,
  });
}

async function handleSubscriptionChange(subscription, eventType) {
  const customerId =
    typeof subscription?.customer === "string"
      ? subscription.customer
      : subscription?.customer?.id || "";

  if (!customerId) return;

  const isActive = ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status);

  await updateCustomerEntitlement(stripe, customerId, {
    status: isActive ? "active" : subscription.status || "inactive",
    grantsPro: isActive,
    plan: getPlanFromSubscription(subscription),
    source: "subscription",
    subscriptionId: subscription.id || "",
    paidAt:
      subscription?.current_period_start
        ? new Date(subscription.current_period_start * 1000).toISOString()
        : "",
    lastEvent: eventType,
  });
}

async function handleChargeRefunded(charge, eventType) {
  const customerId =
    typeof charge?.customer === "string" ? charge.customer : charge?.customer?.id || "";

  if (!customerId) return;

  const amount = Number(charge?.amount || 0);
  const amountRefunded = Number(charge?.amount_refunded || 0);
  const fullyRefunded = amount > 0 && amountRefunded >= amount;

  if (!fullyRefunded) return;

  await updateCustomerEntitlement(stripe, customerId, {
    status: "refunded",
    grantsPro: false,
    plan: "",
    source: "refund",
    paymentIntentId:
      typeof charge?.payment_intent === "string" ? charge.payment_intent : "",
    paidAt: "",
    lastEvent: eventType,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ ok: false, error: "missing_webhook_signature" });
  }

  let event;

  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("stripe-webhook signature error", err);
    return res.status(400).json({ ok: false, error: "invalid_signature" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object, event.type);
        break;

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChange(event.data.object, event.type);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object, event.type);
        break;

      default:
        break;
    }

    return res.status(200).json({ ok: true, received: true, type: event.type });
  } catch (err) {
    console.error("stripe-webhook handler error", {
      type: event?.type,
      message: err?.message,
      email: normalizeEmail(
        event?.data?.object?.customer_email || event?.data?.object?.customer_details?.email
      ),
    });
    return res.status(500).json({ ok: false, error: "handler_failed" });
  }
}
