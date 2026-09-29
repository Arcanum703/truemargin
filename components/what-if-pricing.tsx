"use client";

import { useState } from "react";
import { calculateWhatIfPrice, type FeeSettings } from "@/lib/fee-engine";

export function WhatIfPricing({ initialPrice, product, settings, shippingPerUnit }: { initialPrice: number; product: { materialCost: number; laborMinutes: number; packagingCost: number }; settings: FeeSettings & { hourlyRate: number }; shippingPerUnit?: number }) {
  const [priceInput, setPriceInput] = useState(String(initialPrice));
  const price = Math.max(0, Number(priceInput) || 0);
  const result = calculateWhatIfPrice(price, product, settings, shippingPerUnit);
  return <div className="mt-5 rounded-xl border border-brand-100 bg-white p-4"><h2 className="font-semibold">What-if pricing</h2><label className="mt-3 block text-sm text-ink-500">New price</label><input type="number" min="0" step="any" value={priceInput} onChange={(event) => setPriceInput(event.target.value)} /><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><span className="text-ink-500">Fees</span><p className="font-semibold">${result.fees.toFixed(2)}</p></div><div><span className="text-ink-500">Profit</span><p className={`font-semibold ${result.profit < 0 ? "text-red-600" : "text-emerald-700"}`}>{result.profit < 0 ? "-" : ""}${Math.abs(result.profit).toFixed(2)}</p></div><div><span className="text-ink-500">Margin</span><p className="font-semibold">{result.margin.toFixed(1)}%</p></div><div><span className="text-ink-500">Profit/hour</span><p className="font-semibold">{result.profitPerHour == null ? "—" : `$${result.profitPerHour.toFixed(2)}`}</p></div></div></div>;
}
