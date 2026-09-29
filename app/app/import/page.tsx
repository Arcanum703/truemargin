import fs from "node:fs";
import path from "node:path";
import { importCsvAction, loadDemoShopAction } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { ImportPreview } from "@/components/import-preview";
import { Card, Shell } from "@/components/shell";
import { requireWorkspace, shellUser } from "@/lib/auth";
import { csvHeaders } from "@/lib/csv";

export default async function ImportPage() {
  const context = await requireWorkspace();
  const ordersCsv = fs.readFileSync(path.join(process.cwd(), "public/demo/EtsySoldOrders_demo.csv"), "utf8");
  const itemsCsv = fs.readFileSync(path.join(process.cwd(), "public/demo/EtsySoldOrderItems_demo.csv"), "utf8");
  const steps = [
    ["Export from Etsy", <>Shop Manager → <strong>Settings</strong> → <strong>Options</strong> → <strong>Download Data</strong>. Download <strong>Orders</strong> and <strong>Order Items</strong> for the same months.</>],
    ["Add both files here", "Pick both CSVs below. Re-importing the same period updates orders instead of duplicating them."],
    ["See your real profit", "Your dashboard fills in immediately — fees, shipping and margin per product."],
  ] as const;
  return <Shell title="Import Etsy exports" user={shellUser(context)}><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="space-y-5">
    <Card><ol className="grid gap-4 sm:grid-cols-3">{steps.map(([title, body], index) => <li key={title} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 font-display text-sm font-semibold text-white">{index + 1}</span><div><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-ink-500">{body}</p></div></li>)}</ol></Card>
    <Card><ActionForm action={importCsvAction} submitLabel="Import CSVs"><ImportPreview ordersHeaders={csvHeaders(ordersCsv)} itemsHeaders={csvHeaders(itemsCsv)} /></ActionForm><p className="mt-3 text-xs text-ink-400">Up to 5 MB and 25,000 rows per file. Buyer names are only used to label orders and you can delete everything from your account page.</p></Card>
  </div><div className="space-y-5"><Card className="bg-brand-50 border-brand-100"><h2 className="font-semibold">No export handy? Try the demo</h2><p className="mt-2 text-sm text-ink-600">Loads a sample shop — 202 orders, 16 products — so you can click around first. Clear it later from your account page.</p><div className="mt-4"><ActionForm action={loadDemoShopAction} submitLabel="Load demo shop" inline /></div></Card></div></div></Shell>;
}
