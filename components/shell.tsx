import Link from "next/link";
import { logoutAction } from "@/app/actions";

export type ShellUser = { email: string; workspaceName: string; trialDaysLeft: number | null; subscribed: boolean };

const NAV = [["/app", "Dashboard"], ["/app/import", "Import"], ["/app/products", "Products"], ["/app/alerts", "Alerts"], ["/app/export", "Export"], ["/app/settings", "Settings"], ["/app/billing", "Billing"]] as const;

export function Shell({ children, title, eyebrow = "Etsy profit clarity", user }: { children: React.ReactNode; title?: string; eyebrow?: string; user?: ShellUser }) {
  return <div className="min-h-screen bg-[#faf8ff] text-slate-900">
    <header className="border-b border-violet-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4">
        <Link href={user ? "/app" : "/"} className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-sm font-bold text-white">TM</span>
          <span><span className="block text-sm font-semibold tracking-tight">TrueMargin</span><span className="block text-xs text-slate-500">{user ? user.workspaceName : eyebrow}</span></span>
        </Link>
        {user ? <>
          <nav className="flex flex-wrap gap-4 text-sm text-slate-600">{NAV.map(([href, label]) => <Link key={href} href={href} className="hover:text-violet-700">{label}</Link>)}</nav>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {!user.subscribed && <Link href="/app/billing" className="rounded-full bg-red-100 px-3 py-1 font-semibold text-red-700">Trial ended</Link>}
            {user.subscribed && user.trialDaysLeft != null && <Link href="/app/billing" className="rounded-full bg-violet-100 px-3 py-1 font-semibold text-violet-700">{user.trialDaysLeft} trial day{user.trialDaysLeft === 1 ? "" : "s"} left</Link>}
            <Link href="/app/account" className="hidden sm:inline hover:text-violet-700">{user.email}</Link>
            <form action={logoutAction}><button className="font-semibold text-violet-700 hover:underline">Log out</button></form>
          </div>
        </> : <nav className="flex gap-4 text-sm text-slate-600"><Link href="/login" className="hover:text-violet-700">Log in</Link><Link href="/signup" className="rounded-lg bg-violet-600 px-3 py-1.5 font-semibold text-white hover:bg-violet-700">Start free trial</Link></nav>}
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-5 py-8">{title && <div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">{user ? "Etsy shop workspace" : "TrueMargin"}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1></div>}{children}</main>
    <footer className="mx-auto flex max-w-7xl flex-wrap gap-4 px-5 py-8 text-xs text-slate-500"><span>© {new Date().getFullYear()} TrueMargin</span><Link href="/privacy" className="hover:text-violet-700">Privacy</Link><Link href="/terms" className="hover:text-violet-700">Terms</Link><Link href="/security" className="hover:text-violet-700">Security</Link><a href="mailto:support@truemargin.app" className="hover:text-violet-700">Support</a></footer>
  </div>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-violet-100 bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

export function Button({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>{children}</button>;
}

export function Money({ value }: { value: number }) {
  return <>{value < 0 ? "-" : ""}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>;
}

export function Notice({ kind = "info", children }: { kind?: "info" | "error" | "success"; children: React.ReactNode }) {
  const styles = { info: "border-violet-200 bg-violet-50 text-violet-900", error: "border-red-200 bg-red-50 text-red-800", success: "border-emerald-200 bg-emerald-50 text-emerald-800" }[kind];
  return <div role={kind === "error" ? "alert" : "status"} className={`mb-5 rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}
