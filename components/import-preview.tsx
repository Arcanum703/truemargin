"use client";

import Papa from "papaparse";
import { useState } from "react";

const MAX_BYTES = 5 * 1024 * 1024;

function Column({ id, label, headers, defaultHeaders, placeholder, fileName }: { id: string; label: string; headers: string[]; defaultHeaders: string[]; placeholder: string; fileName: string }) {
  const [text, setText] = useState("");
  const [columns, setColumns] = useState(headers.length ? headers : defaultHeaders);
  const [fileError, setFileError] = useState("");
  const preview = (csv: string) => setColumns(Papa.parse<Record<string, string>>(csv, { header: true, preview: 1, skipEmptyLines: true }).meta.fields ?? []);
  return <div className="space-y-3">
    <div><label htmlFor={fileName}>{label} file</label><input id={fileName} name={fileName} type="file" accept=".csv,text/csv" onChange={(event) => {
      const file = event.target.files?.[0];
      setFileError("");
      if (!file) return;
      if (file.size > MAX_BYTES) { setFileError("File is larger than 5 MB."); event.target.value = ""; return; }
      file.slice(0, 64 * 1024).text().then(preview);
    }} />{fileError && <p className="mt-1 text-xs text-red-700">{fileError}</p>}</div>
    <div><label htmlFor={id}>…or paste {label} CSV</label><textarea id={id} name={id} rows={4} placeholder={placeholder} value={text} onChange={(event) => { setText(event.target.value); preview(event.target.value); }} /></div>
    <div className="rounded-xl bg-violet-50 p-4"><p className="text-sm font-semibold">{label} mapping preview</p><p className="mt-1 text-xs text-slate-500">{columns.length} columns detected · header matching is case-insensitive</p><div className="mt-3 flex flex-wrap gap-1.5">{columns.slice(0, 12).map((header) => <span key={header} className="rounded-full bg-white px-2 py-1 text-[11px] text-violet-800">{header}</span>)}{columns.length > 12 && <span className="px-2 py-1 text-[11px] text-slate-500">+{columns.length - 12} more</span>}</div></div>
  </div>;
}

export function ImportPreview({ ordersHeaders, itemsHeaders }: { ordersHeaders: string[]; itemsHeaders: string[] }) {
  return <div className="grid gap-5 md:grid-cols-2">
    <Column id="ordersCsv" fileName="ordersFile" label="Orders" headers={[]} defaultHeaders={ordersHeaders} placeholder="Paste EtsySoldOrders CSV here" />
    <Column id="itemsCsv" fileName="itemsFile" label="Order Items" headers={[]} defaultHeaders={itemsHeaders} placeholder="Paste EtsySoldOrderItems CSV here" />
  </div>;
}
