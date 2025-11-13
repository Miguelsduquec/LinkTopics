// api/stripe-verify.js
import Stripe from "stripe";
import jwt from "jsonwebtoken";

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

    const period =
      typeof sub === "object"
        ? sub.items?.data?.[0]?.plan?.interval || "month"
        : "oneoff";

    // 3) gerar token (JWT)
    const token = jwt.sign(
      {
        sub: email,
        plan: period,        // "month" | "year" | "oneoff"
        iss: "linktopics",
      },
      process.env.LICENSE_JWT_SECRET,
      { expiresIn: "400d" }
    );

    return res.status(200).json({ ok: true, token, plan: period });
  } catch (err) {
    console.error("stripe-verify error", err);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
