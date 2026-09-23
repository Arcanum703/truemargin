export const metadata = { title: "Security — TrueMargin" };

export default function SecurityPage() {
  return <>
    <h1>Security at TrueMargin</h1>
    <p>Your Etsy financial data is sensitive. Here is how we protect it.</p>
    <h2>Accounts and sessions</h2>
    <ul>
      <li>Passwords are hashed with Argon2id; common and weak passwords are rejected.</li>
      <li>Sign-in is rate limited and accounts lock temporarily after repeated failures.</li>
      <li>Sessions use HTTP-only, Secure, SameSite cookies; session tokens are stored only as HMAC hashes and expire after 30 days.</li>
      <li>Password changes and resets sign out every other device and trigger an email notice.</li>
      <li>Email verification and password reset links are single-use and expire.</li>
    </ul>
    <h2>Tenant isolation</h2>
    <p>Every workspace belongs to an authenticated owner. Every read and write is scoped by workspace ID at the database layer; there are no shareable public links to your data.</p>
    <h2>Application hardening</h2>
    <ul>
      <li>Strict Content Security Policy with per-request nonces, frame denial, HSTS, and no referrer leakage.</li>
      <li>All input validated server-side; CSV uploads are size, row, and cell limited and control characters are stripped.</li>
      <li>Exports neutralise spreadsheet formula injection.</li>
      <li>Stripe webhooks are signature-verified and processed idempotently.</li>
      <li>Security-relevant events are recorded in an audit log.</li>
      <li>Dependencies are audited in CI.</li>
    </ul>
    <h2>Infrastructure</h2>
    <p>TrueMargin runs on managed infrastructure with encryption in transit (TLS 1.2+) and at rest. Secrets are stored in the platform&apos;s secret manager, never in source control.</p>
    <h2>Responsible disclosure</h2>
    <p>If you believe you have found a vulnerability, email <a href="mailto:security@truemargin.app">security@truemargin.app</a>. Please give us a reasonable time to fix the issue before public disclosure. We do not pursue legal action against good-faith researchers.</p>
  </>;
}
