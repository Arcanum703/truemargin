"use client";

import { startTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/action-state";

function Submit({ label, className }: { label: string; className?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className={className ?? "rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"}>{pending ? "Working…" : label}</button>;
}

export function ActionForm({ action, children, submitLabel, className = "", submitClassName, inline = false }: { action: (state: ActionState, formData: FormData) => Promise<ActionState>; children?: React.ReactNode; submitLabel: string; className?: string; submitClassName?: string; inline?: boolean }) {
  const [state, formAction, pending] = useActionState(action, {});
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  };
  return <form action={formAction} onSubmit={submit} className={className} aria-busy={pending}>
    {children}
    {state.error && <p role="alert" className={`text-sm text-red-700 ${inline ? "" : "mt-3"}`}>{state.error}</p>}
    {state.success && <p role="status" className={`text-sm text-emerald-700 ${inline ? "" : "mt-3"}`}>{state.success}</p>}
    <div className={inline ? "" : "mt-4"}><Submit label={submitLabel} className={submitClassName} /></div>
  </form>;
}
