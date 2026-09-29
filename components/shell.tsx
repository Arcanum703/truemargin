import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { Wordmark } from "@/components/logo";

export type ShellUser = { email: string; workspaceName: string; trialDaysLeft: number | null; subscribed: boolean };

const NAV = [["/app", "Dashboard"], ["/app/import", "Import"], ["/app/products", "Products"], ["/app/export", "Export"], ["/app/settings", "Settings"], ["/app/billing", "Billing"]] as const;

export function Shell({ children, title, eyebrow = "Profit tracker for Etsy sellers", user }: { children: React.ReactNode; title?: string; eyebrow?: string; user?: ShellUser }) {
  return <div className="min-h-screen bg-cream text-ink-900">
    <header className="border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3.5">
        <Link href={user ? "/app" : "/"} aria-label="TrueMargin home"><Wordmark tagline={user ? user.workspaceName : eyebrow} /></Link>
        {user ? <>
          <nav className="flex flex-wrap gap-1 text-sm font-medium text-ink-600">{NAV.map(([href, label]) => <Link key={href} href={href} className="rounded-full px-3 py-1.5 transition hover:bg-brand-50 hover:text-brand-700">{label}</Link>)}</nav>
          <div className="flex items-center gap-3 text-xs text-ink-500">
            {!user.subscribed && <Link href="/app/billing" className="rounded-full bg-red-100 px-3 py-1 font-semibold text-red-700">Trial ended</Link>}
            {user.subscribed && user.trialDaysLeft != null && <Link href="/app/billing" className="rounded-full bg-brand-100 px-3 py-1 font-semibold text-brand-700">{user.trialDaysLeft} trial day{user.trialDaysLeft === 1 ? "" : "s"} left</Link>}
            <Link href="/app/account" className="hover:text-brand-700"><span className="hidden sm:inline">{user.email}</span><span className="sm:hidden">Account</span></Link>
            <form action={logoutAction}><button className="font-semibold text-brand-700 hover:underline">Log out</button></form>
          </div>
        </> : <nav className="flex items-center gap-4 text-sm font-medium text-ink-600"><Link href="/login" className="hover:text-brand-700">Log in</Link><Link href="/signup" className="rounded-full bg-brand-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-brand-700">Start free trial</Link></nav>}
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-5 py-8">{title && <div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">{user ? "Your Etsy shop" : "TrueMargin"}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1></div>}{children}</main>
    <footer className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-8 text-xs text-ink-500"><span>© {new Date().getFullYear()} TrueMargin · Built for Etsy sellers. Not affiliated with or endorsed by Etsy, Inc.</span><Link href="/privacy" className="hover:text-brand-700">Privacy</Link><Link href="/terms" className="hover:text-brand-700">Terms</Link><Link href="/security" className="hover:text-brand-700">Security</Link><a href="mailto:support@truemargin.app" className="hover:text-brand-700">Support</a></footer>
  </div>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-ink-100 bg-white p-5 shadow-[0_1px_2px_rgba(34,29,25,.04),0_8px_24px_-16px_rgba(34,29,25,.18)] ${className}`}>{children}</section>;
}

export function Button({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>{children}</button>;
}

export function fmtHour(value: number) {
  return `${value < 0 ? "-" : ""}$${Math.abs(value).toFixed(2)}`;
}

export function Money({ value }: { value: number }) {
  return <>{value < 0 ? "-" : ""}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>;
}

export function Notice({ kind = "info", children }: { kind?: "info" | "error" | "success"; children: React.ReactNode }) {
  const styles = { info: "border-brand-200 bg-brand-50 text-brand-900", error: "border-red-200 bg-red-50 text-red-800", success: "border-emerald-200 bg-emerald-50 text-emerald-800" }[kind];
  return <div role={kind === "error" ? "alert" : "status"} className={`mb-5 rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}
