"use client";

import Papa from "papaparse";
import { useState } from "react";

export function ImportPreview({ ordersHeaders, itemsHeaders }: { ordersHeaders: string[]; itemsHeaders: string[] }) {
  const [ordersCsv, setOrdersCsv] = useState("");
  const [itemsCsv, setItemsCsv] = useState("");
  const [ordersColumns, setOrdersColumns] = useState(ordersHeaders);
  const [itemsColumns, setItemsColumns] = useState(itemsHeaders);
  const update = (text: string, setter: (headers: string[]) => void) => {
    const parsed = Papa.parse<Record<string, string>>(text, { header: true, preview: 1, skipEmptyLines: true });
    setter(parsed.meta.fields ?? []);
  };
  return <div className="space-y-5">
    <div className="grid gap-5 md:grid-cols-2">
      <div><label htmlFor="ordersCsv">Orders CSV</label><textarea id="ordersCsv" rows={5} placeholder="Paste EtsySoldOrders CSV here" value={ordersCsv} onChange={(event) => { setOrdersCsv(event.target.value); update(event.target.value, setOrdersColumns); }} /></div>
      <div><label htmlFor="itemsCsv">Order Items CSV</label><textarea id="itemsCsv" rows={5} placeholder="Paste EtsySoldOrderItems CSV here" value={itemsCsv} onChange={(event) => { setItemsCsv(event.target.value); update(event.target.value, setItemsColumns); }} /></div>
    </div>
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-xl bg-violet-50 p-4"><p className="text-sm font-semibold">Orders mapping preview</p><p className="mt-1 text-xs text-slate-500">{ordersColumns.length} columns detected · header matching is case-insensitive</p><div className="mt-3 flex flex-wrap gap-1.5">{ordersColumns.slice(0, 12).map((header) => <span key={header} className="rounded-full bg-white px-2 py-1 text-[11px] text-violet-800">{header}</span>)}{ordersColumns.length > 12 && <span className="px-2 py-1 text-[11px] text-slate-500">+{ordersColumns.length - 12} more</span>}</div></div>
      <div className="rounded-xl bg-violet-50 p-4"><p className="text-sm font-semibold">Order Items mapping preview</p><p className="mt-1 text-xs text-slate-500">{itemsColumns.length} columns detected · missing optional fields are okay</p><div className="mt-3 flex flex-wrap gap-1.5">{itemsColumns.slice(0, 12).map((header) => <span key={header} className="rounded-full bg-white px-2 py-1 text-[11px] text-violet-800">{header}</span>)}{itemsColumns.length > 12 && <span className="px-2 py-1 text-[11px] text-slate-500">+{itemsColumns.length - 12} more</span>}</div></div>
    </div>
    <input type="hidden" name="ordersCsv" value={ordersCsv} readOnly />
    <input type="hidden" name="itemsCsv" value={itemsCsv} readOnly />
  </div>;
}
