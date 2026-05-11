// api/stripe-verify.js
import Stripe from "stripe";
import {
  ensureCustomerForCheckoutSession,
  getPlanFromSubscription,
  issueLicenseToken,
  updateCustomerEntitlement,
} from "./_lib/stripe-entitlements.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Vercel function: /api/stripe-verify?session_id=cs_test_...
 */
export default async function handler(req, res) {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ ok: false, error: "missing_session_id" });
    }

    // 1) buscar sessão ao Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["subscription"],
    });

    const paid = session.payment_status === "paid";
    const sub = session.subscription;
    const active =
      (typeof sub === "object" && sub.status === "active") ||
      (session.mode === "payment" && paid);

    if (!active) {
      return res.status(403).json({ ok: false, error: "subscription_not_active" });
    }

    // 2) construir payload da licença
    const email =
      session.customer_details?.email ||
      session.customer_email ||
      "unknown";

    const period = typeof sub === "object" ? getPlanFromSubscription(sub) : "oneoff";

    const customer = await ensureCustomerForCheckoutSession(stripe, session);
    if (customer?.id) {
      await updateCustomerEntitlement(stripe, customer.id, {
        status: "active",
        grantsPro: true,
        plan: period,
        source: "verify",
        checkoutSessionId: session.id,
        subscriptionId: typeof session.subscription === "string" ? session.subscription : sub?.id || "",
        paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
        paidAt: new Date((session.created || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
        lastEvent: "verify",
      });
    }

    // 3) gerar token (JWT)
    const token = issueLicenseToken(email, period);

    return res.status(200).json({ ok: true, token, plan: period });
  } catch (err) {
    console.error("stripe-verify error", err);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
