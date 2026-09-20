import Link from "next/link";
import { Card, Shell } from "@/components/shell";
import { getDashboard } from "@/lib/queries";

export default async function AlertsPage() {
  const { products, settings } = await getDashboard();
  const lowMargin = products.filter((product) => product.margin < settings.marginThreshold);
  const reorder = products.filter((product) => product.stockOnHand <= product.reorderPoint);
  const missing = products.filter((product) => product.materialCost === 0 && product.laborMinutes === 0 && product.packagingCost === 0);
  return <Shell title="Alerts"><div className="grid gap-5 md:grid-cols-3"><Card><p className="text-xs font-semibold uppercase tracking-wide text-red-600">Low margin</p><p className="mt-2 text-3xl font-semibold">{lowMargin.length}</p><div className="mt-4 space-y-2 text-sm">{lowMargin.map((product) => <Link href={`/products/${product.id}`} key={product.id} className="block text-red-700 hover:underline">{product.name} · {product.margin.toFixed(1)}%</Link>)}{!lowMargin.length && <p className="text-slate-500">No products below threshold.</p>}</div></Card><Card><p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Reorder</p><p className="mt-2 text-3xl font-semibold">{reorder.length}</p><div className="mt-4 space-y-2 text-sm">{reorder.map((product) => <Link href={`/products/${product.id}`} key={product.id} className="block text-amber-700 hover:underline">{product.name} · {product.stockOnHand} left</Link>)}{!reorder.length && <p className="text-slate-500">Stock levels look healthy.</p>}</div></Card><Card><p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Missing cost data</p><p className="mt-2 text-3xl font-semibold">{missing.length}</p><div className="mt-4 space-y-2 text-sm">{missing.map((product) => <Link href={`/products/${product.id}`} key={product.id} className="block text-violet-700 hover:underline">{product.name}</Link>)}{!missing.length && <p className="text-slate-500">Every product has cost data.</p>}</div></Card></div></Shell>;
}
