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
  return <Shell title="Import Etsy exports" user={shellUser(context)}><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><Card><div className="mb-5"><h2 className="font-semibold">Upload or paste</h2><p className="mt-1 text-sm text-slate-500">In Etsy go to Shop Manager → Settings → Options → Download Data and export <strong>Orders</strong> and <strong>Order Items</strong> for the same period. Files up to 5 MB and 25,000 rows each. Re-importing the same orders updates them instead of duplicating.</p></div><ActionForm action={importCsvAction} submitLabel="Import CSVs"><ImportPreview ordersHeaders={csvHeaders(ordersCsv)} itemsHeaders={csvHeaders(itemsCsv)} /></ActionForm></Card><div className="space-y-5"><Card><h2 className="font-semibold">Try the demo</h2><p className="mt-2 text-sm text-slate-500">Load 200 sample orders and 15 products with realistic costs, using Etsy&apos;s exact export headers. Clear them later from your account page.</p><div className="mt-4"><ActionForm action={loadDemoShopAction} submitLabel="Load demo shop" inline /></div></Card><Card><h2 className="font-semibold">Supported files</h2><ul className="mt-3 space-y-2 text-sm text-slate-600"><li>✓ EtsySoldOrders*.csv</li><li>✓ EtsySoldOrderItems*.csv</li><li>✓ Card Processing Fees when present</li><li>✓ Case-insensitive header matching</li><li>✓ Missing optional columns tolerated</li></ul></Card><Card><h2 className="font-semibold">Your data stays yours</h2><p className="mt-2 text-sm text-slate-600">Imports are processed on our servers and stored only in your workspace. Buyer names are kept only to label orders; you can delete everything at any time.</p></Card></div></div></Shell>;
}
