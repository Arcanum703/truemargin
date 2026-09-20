import fs from "node:fs";
import path from "node:path";
import { importCsvAction, loadDemoShopAction } from "@/app/actions";
import { ImportPreview } from "@/components/import-preview";
import { Card, Shell } from "@/components/shell";
import { csvHeaders } from "@/lib/csv";

export default function ImportPage() {
  const ordersCsv = fs.readFileSync(path.join(process.cwd(), "public/demo/EtsySoldOrders_demo.csv"), "utf8");
  const itemsCsv = fs.readFileSync(path.join(process.cwd(), "public/demo/EtsySoldOrderItems_demo.csv"), "utf8");
  return <Shell title="Import Etsy exports"><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><Card><div className="mb-5"><h2 className="font-semibold">Mapping preview</h2><p className="mt-1 text-sm text-slate-500">Paste Orders and Order Items exports to preview header matches before importing. Extra and missing optional columns are safe.</p></div><form action={importCsvAction}><ImportPreview ordersHeaders={csvHeaders(ordersCsv)} itemsHeaders={csvHeaders(itemsCsv)} /><button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">Import CSVs</button></form></Card><div className="space-y-5"><Card><h2 className="font-semibold">Try the demo</h2><p className="mt-2 text-sm text-slate-500">Load 200 orders and 15 products using the exact Etsy export headers included in the app.</p><form action={loadDemoShopAction} className="mt-4"><button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">Load demo shop</button></form></Card><Card><h2 className="font-semibold">Supported files</h2><ul className="mt-3 space-y-2 text-sm text-slate-600"><li>✓ EtsySoldOrders*.csv</li><li>✓ EtsySoldOrderItems*.csv</li><li>✓ Card Processing Fees when present</li><li>✓ Case-insensitive header matching</li><li>✓ Missing optional columns tolerated</li></ul></Card></div></div></Shell>;
}
