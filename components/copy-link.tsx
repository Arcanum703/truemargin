"use client";

import { useState } from "react";

export function CopyLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}/c/${token}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }
  return <button onClick={copy} className="text-xs font-semibold text-orange-700 hover:underline">{copied ? "Copied!" : "Copy customer link"}</button>;
}
