export const metadata = { title: "Privacy Policy — TrueMargin" };

export default function PrivacyPage() {
  return <>
    <h1>Privacy Policy</h1>
    <p><em>Last updated: September 23, 2026</em></p>
    <p>TrueMargin (&quot;we&quot;) helps Etsy sellers understand product profitability. This policy explains what we collect, why, and the choices you have.</p>
    <h2>What we collect</h2>
    <ul>
      <li><strong>Account data:</strong> your email address and a salted, one-way hash of your password. We never store your plain password.</li>
      <li><strong>Shop data you upload:</strong> the contents of Etsy Orders and Order Items CSV exports (order IDs, dates, amounts, fees, item names, SKUs, and buyer names as they appear in the export), plus the cost, labor, and stock figures you enter.</li>
      <li><strong>Billing data:</strong> subscription status and Stripe customer and subscription identifiers. Card details are collected and stored by Stripe, never by us.</li>
      <li><strong>Security logs:</strong> sign-in events, password changes, imports, exports, and deletions, with a truncated hash of the IP address and browser user agent. Raw IP addresses are not stored.</li>
    </ul>
    <h2>How we use it</h2>
    <p>Only to provide the service: calculating fees and margins, sending account emails (verification, password reset, security notices), processing payments, preventing abuse, and complying with law. We do not sell data, run advertising, or use your shop data to train models.</p>
    <h2>Buyer information</h2>
    <p>Etsy exports include buyer names. They are used solely to label orders inside your private workspace. You are responsible for handling your customers&apos; data lawfully; you can clear imported data at any time from your account page.</p>
    <h2>Sharing</h2>
    <p>We share data only with processors needed to run TrueMargin: our hosting and database provider, Stripe (payments), and our transactional email provider. Each is bound by contractual confidentiality and processes data only on our instructions.</p>
    <h2>Security</h2>
    <p>Data is encrypted in transit (TLS) and at rest. Every query is scoped to your workspace; no other seller can access your data. See our <a href="/security">security page</a> for details.</p>
    <h2>Retention and your rights</h2>
    <p>Your data is kept while your account exists. You can download a complete copy (JSON and CSV) and permanently delete your account from the account page at any time; deletion removes your workspace and all imported data immediately. Security logs referencing deleted accounts are anonymised. You may also request access, correction, or deletion by emailing <a href="mailto:privacy@truemargin.app">privacy@truemargin.app</a>.</p>
    <h2>Cookies</h2>
    <p>We use a single strictly necessary, HTTP-only session cookie to keep you signed in. There are no tracking or advertising cookies.</p>
    <h2>Children</h2>
    <p>TrueMargin is for business use and not directed at anyone under 18.</p>
    <h2>Changes</h2>
    <p>We will post updates here and, for material changes, notify you by email before they take effect.</p>
  </>;
}
