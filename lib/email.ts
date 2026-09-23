import { Resend } from "resend";
import { emailEnabled, env } from "@/lib/env";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);

async function send(to: string, subject: string, text: string, html: string) {
  if (!emailEnabled) {
    if (env.NODE_ENV !== "production") console.info(`[email:dev] to=${to} subject=${subject}\n${text}`);
    return;
  }
  const resend = new Resend(env.RESEND_API_KEY);
  const result = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, text, html });
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
