import { Resend } from "resend";
import { emailEnabled, env } from "@/lib/env";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);

async function send(to: string, subject: string, text: string, html: string, headers?: Record<string, string>) {
  if (!emailEnabled) {
    if (env.NODE_ENV !== "production") console.info(`[email:dev] to=${to} subject=${subject}\n${text}`);
    return;
  }
  const resend = new Resend(env.RESEND_API_KEY);
  const result = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, text, html, headers });
  if (result.error) throw new Error(`Email delivery failed: ${result.error.message}`);
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${env.APP_URL}/verify?token=${encodeURIComponent(token)}`;
  await send(to, "Confirm your TrueMargin email", `Confirm your email to finish setting up TrueMargin:\n\n${url}\n\nThis link expires in 24 hours. If you did not create an account, ignore this email.`, `<p>Confirm your email to finish setting up TrueMargin.</p><p><a href="${escapeHtml(url)}">Confirm email</a></p><p>This link expires in 24 hours. If you did not create an account, ignore this email.</p>`);
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${env.APP_URL}/reset?token=${encodeURIComponent(token)}`;
  await send(to, "Reset your TrueMargin password", `Reset your TrueMargin password:\n\n${url}\n\nThis link expires in 1 hour. If you did not request a reset, ignore this email; your password is unchanged.`, `<p>Reset your TrueMargin password.</p><p><a href="${escapeHtml(url)}">Choose a new password</a></p><p>This link expires in 1 hour. If you did not request a reset, ignore this email; your password is unchanged.</p>`);
}

export async function sendSecurityNotice(to: string, subject: string, body: string) {
  await send(to, subject, body, `<p>${escapeHtml(body)}</p>`);
}

const LIFECYCLE_COPY: Record<string, { subject: string; lines: string[]; cta: { label: string; path: string } }> = {
  welcome: {
    subject: "Welcome to TrueMargin — see your real Etsy profit in 2 minutes",
    lines: ["Thanks for joining TrueMargin. Here is the fastest way to your first real profit number:", "1. In Etsy: Shop Manager → Settings → Options → Download Data. Download \"Orders\" and \"Order Items\" for the same period.", "2. Drop both files on the Import page. Every Etsy fee is subtracted automatically.", "3. Read the dashboard: net profit, true margin, and which products lose money.", "Not ready to export yet? Load the demo shop on the Import page to see what it looks like."],
    cta: { label: "Import your Etsy orders", path: "/app/import" },
  },
  no_import: {
    subject: "Your TrueMargin dashboard is still empty",
    lines: ["You created a TrueMargin workspace but have not imported orders yet, so there is nothing to show you.", "It takes two files from Etsy (Shop Manager → Settings → Options → Download Data → Orders + Order Items) and about two minutes.", "If something in the export confused you, reply to this email and tell us what happened — that is the most useful feedback we get."],
    cta: { label: "Finish your import", path: "/app/import" },
  },
  add_costs: {
    subject: "Your margins are missing one thing: your costs",
    lines: ["Your dashboard now shows profit after Etsy fees and shipping. That is the honest baseline — but it still ignores what you spend on materials, packaging, and your time.", "Add costs to just your top 3 products (2 minutes) and the margin, profit-per-hour, and price-floor numbers become real.", "You do not need to fill in everything. Start with the products that sell most."],
    cta: { label: "Add product costs", path: "/app/products" },
  },
  trial_ending: {
    subject: "Your TrueMargin trial ends in 3 days",
    lines: ["Your free trial ends in about three days. After that the dashboard, imports, and exports pause until you subscribe.", "TrueMargin is $9/month or $79/year — less than one mispriced order per month. Cancel anytime from the billing page.", "Your data stays safe either way; nothing is deleted when a trial ends."],
    cta: { label: "Keep your dashboard", path: "/app/billing" },
  },
  trial_ended: {
    subject: "Your TrueMargin trial has ended",
    lines: ["Your trial is over and your workspace is paused. Your imported orders and product costs are still there.", "Subscribe for $9/month or $79/year to pick up where you left off. If TrueMargin was not useful, we would genuinely like to know why — just reply to this email."],
    cta: { label: "Reactivate TrueMargin", path: "/app/billing" },
  },
};

export async function sendLifecycleEmail(kind: string, to: string, unsubscribeUrl: string) {
  const copy = LIFECYCLE_COPY[kind];
  if (!copy) throw new Error(`Unknown lifecycle email: ${kind}`);
  const ctaUrl = `${env.APP_URL}${copy.cta.path}`;
  const text = `${copy.lines.join("\n\n")}\n\n${copy.cta.label}: ${ctaUrl}\n\n—\nYou get these onboarding emails because you created a TrueMargin account. Stop them: ${unsubscribeUrl}`;
  const html = `${copy.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}<p><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:10px 18px;background:#d94b0f;color:#fff;border-radius:999px;text-decoration:none;font-weight:600">${escapeHtml(copy.cta.label)}</a></p><p style="color:#777;font-size:12px">You get these onboarding emails because you created a TrueMargin account. <a href="${escapeHtml(unsubscribeUrl)}">Stop them</a>.</p>`;
  await send(to, copy.subject, text, html, { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" });
}
