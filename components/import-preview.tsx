"use client";

import Papa from "papaparse";
import { useState } from "react";

const MAX_BYTES = 5 * 1024 * 1024;

function FilePicker({ id, label, hint, expectedHeaders, pasteId, placeholder }: { id: string; label: string; hint: string; expectedHeaders: string[]; pasteId: string; placeholder: string }) {
  const [fileName, setFileName] = useState("");
  const [columns, setColumns] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const preview = (csv: string) => setColumns(Papa.parse<Record<string, string>>(csv, { header: true, preview: 1, skipEmptyLines: true }).meta.fields ?? []);
  const required = expectedHeaders.slice(0, 2).map((header) => header.toLowerCase());
  const looksRight = columns ? required.every((header) => columns.some((column) => column.toLowerCase() === header)) : null;
  const ready = Boolean(fileName || text.trim());
  return <div className={`rounded-xl border-2 p-4 transition ${ready ? "border-emerald-300 bg-emerald-50/40" : "border-dashed border-ink-200 bg-white"}`}>
    <div className="flex items-start justify-between gap-3">
      <div><p className="font-semibold">{label}</p><p className="text-xs text-ink-500">{hint}</p></div>
      {ready && <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Ready</span>}
    </div>
    <label htmlFor={id} className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800">
      {fileName ? "Change file" : "Choose CSV file"}
    </label>
    <input id={id} name={id} type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => {
      const file = event.target.files?.[0];
      setError("");
      if (!file) { setFileName(""); setColumns(null); return; }
      if (file.size > MAX_BYTES) { setError("File is larger than 5 MB."); event.target.value = ""; setFileName(""); return; }
      setFileName(file.name);
      file.slice(0, 64 * 1024).text().then(preview);
    }} />
    {fileName && <p className="mt-2 truncate text-sm text-ink-700">{fileName}</p>}
    {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    {columns && looksRight === false && <p className="mt-2 text-xs text-amber-700">This doesn&apos;t look like the {label} export ({columns.length} columns, expected ones like &ldquo;{expectedHeaders[0]}&rdquo;). Check you picked the right file.</p>}
    {columns && looksRight && <p className="mt-2 text-xs text-emerald-700">{columns.length} columns recognized.</p>}
    <details className="mt-3 text-xs text-ink-500">
      <summary className="cursor-pointer hover:text-ink-700">Paste CSV text instead</summary>
      <textarea id={pasteId} name={pasteId} rows={4} className="mt-2" placeholder={placeholder} value={text} onChange={(event) => { setText(event.target.value); if (event.target.value.trim()) preview(event.target.value); }} />
    </details>
  </div>;
}

export function ImportPreview({ ordersHeaders, itemsHeaders }: { ordersHeaders: string[]; itemsHeaders: string[] }) {
  return <div className="grid gap-4 md:grid-cols-2">
    <FilePicker id="ordersFile" pasteId="ordersCsv" label="Orders" hint="EtsySoldOrders….csv" expectedHeaders={ordersHeaders} placeholder="Paste the Orders CSV here" />
    <FilePicker id="itemsFile" pasteId="itemsCsv" label="Order Items" hint="EtsySoldOrderItems….csv" expectedHeaders={itemsHeaders} placeholder="Paste the Order Items CSV here" />
  </div>;
}
