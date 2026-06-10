import jwt from "jsonwebtoken";

export const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function maskEmail(value) {
  const email = normalizeEmail(value);
  if (!email || !email.includes("@")) return "";

  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "";

  if (localPart.length <= 2) {
    return `${localPart[0] || "*"}*@${domain}`;
  }

  return `${localPart.slice(0, 2)}***@${domain}`;
}

export function issueLicenseToken(email, plan) {
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

export function getPlanFromSubscription(subscription) {
  return subscription?.items?.data?.[0]?.plan?.interval || "month";
}

export function readEntitlementMetadata(customer) {
  const metadata = customer?.metadata || {};

  return {
    email: normalizeEmail(customer?.email),
    status: String(metadata.linktopics_status || "").trim().toLowerCase(),
    plan: String(metadata.linktopics_plan || "").trim().toLowerCase(),
    grantsPro: String(metadata.linktopics_grants_pro || "").trim().toLowerCase() === "true",
    source: String(metadata.linktopics_source || "").trim().toLowerCase(),
  };
}

export function summarizeCustomerEntitlement(customer) {
  const entitlement = readEntitlementMetadata(customer);

  return {
    customerId: customer?.id || "",
    email: entitlement.email,
    maskedEmail: maskEmail(entitlement.email || customer?.email),
    status: entitlement.status,
    plan: entitlement.plan,
    grantsPro: entitlement.grantsPro,
    source: entitlement.source,
    checkoutSessionId: String(customer?.metadata?.linktopics_checkout_session_id || ""),
    subscriptionId: String(customer?.metadata?.linktopics_subscription_id || ""),
    paymentIntentId: String(customer?.metadata?.linktopics_payment_intent_id || ""),
    paidAt: String(customer?.metadata?.linktopics_paid_at || ""),
    lastEvent: String(customer?.metadata?.linktopics_last_event || ""),
    updatedAt: String(customer?.metadata?.linktopics_updated_at || ""),
  };
}

export function hasActiveEntitlement(customer) {
  const entitlement = readEntitlementMetadata(customer);
  return entitlement.grantsPro && entitlement.status === "active";
}

export async function findCustomersByEmail(stripe, email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return [];

  const response = await stripe.customers.list({ email: normalizedEmail, limit: 10 });
  return response.data || [];
}

export async function findOrCreateCustomerForEmail(stripe, email, name = "") {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const existingCustomers = await findCustomersByEmail(stripe, normalizedEmail);
  const existing = existingCustomers.find((customer) => !customer.deleted) || existingCustomers[0];

  if (existing && !existing.deleted) {
    return existing;
  }

  return stripe.customers.create({
    email: normalizedEmail,
    ...(name ? { name } : {}),
  });
}

export async function ensureCustomerForCheckoutSession(stripe, session) {
  if (typeof session?.customer === "string" && session.customer) {
    const customer = await stripe.customers.retrieve(session.customer);
    if (customer && !customer.deleted) return customer;
  }

  const email = normalizeEmail(
    session?.customer_details?.email || session?.customer_email || ""
  );

  if (!email) return null;

  const name = session?.customer_details?.name || "";
  return findOrCreateCustomerForEmail(stripe, email, name);
}

export function buildEntitlementMetadataPatch({
  status,
  grantsPro,
  plan,
  source,
  checkoutSessionId = "",
  subscriptionId = "",
  paymentIntentId = "",
  paidAt = "",
  lastEvent = "",
}) {
  return {
    linktopics_status: String(status || ""),
    linktopics_grants_pro: grantsPro ? "true" : "false",
    linktopics_plan: String(plan || ""),
    linktopics_source: String(source || ""),
    linktopics_checkout_session_id: String(checkoutSessionId || ""),
    linktopics_subscription_id: String(subscriptionId || ""),
    linktopics_payment_intent_id: String(paymentIntentId || ""),
    linktopics_paid_at: String(paidAt || ""),
    linktopics_last_event: String(lastEvent || ""),
    linktopics_updated_at: new Date().toISOString(),
  };
}

export async function updateCustomerEntitlement(stripe, customerId, patch) {
  if (!customerId) return null;

  return stripe.customers.update(customerId, {
    metadata: buildEntitlementMetadataPatch(patch),
  });
}

export async function findActiveEntitlementByEmail(stripe, email) {
  const customers = await findCustomersByEmail(stripe, email);

  for (const customer of customers) {
    if (customer.deleted) continue;
    if (hasActiveEntitlement(customer)) {
      return customer;
    }
  }

  return null;
}
