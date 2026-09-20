import Link from "next/link";

export function Shell({ children, title, eyebrow = "Etsy profit clarity" }: { children: React.ReactNode; title?: string; eyebrow?: string }) {
  return <div className="min-h-screen bg-[#faf8ff] text-slate-900">
    <header className="border-b border-violet-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-sm font-bold text-white">TM</span>
          <span><span className="block text-sm font-semibold tracking-tight">TrueMargin</span><span className="block text-xs text-slate-500">{eyebrow}</span></span>
        </Link>
        <nav className="hidden gap-5 text-sm text-slate-600 md:flex">
          <Link href="/" className="hover:text-violet-700">Dashboard</Link>
          <Link href="/import" className="hover:text-violet-700">Import</Link>
          <Link href="/products" className="hover:text-violet-700">Products</Link>
          <Link href="/alerts" className="hover:text-violet-700">Alerts</Link>
          <Link href="/export" className="hover:text-violet-700">Export</Link>
          <Link href="/settings" className="hover:text-violet-700">Settings</Link>
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-5 py-8">{title && <div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Etsy shop workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1></div>}{children}</main>
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
