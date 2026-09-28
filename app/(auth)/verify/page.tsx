import Link from "next/link";
import { redirect } from "next/navigation";
import { resendVerificationAction } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { Card, Notice, Shell } from "@/components/shell";
import { getCurrentUser, verifyEmailToken } from "@/lib/auth";

export const metadata = { title: "Confirm your email — TrueMargin", robots: { index: false } };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const user = await getCurrentUser();
  if (token) {
    const ok = await verifyEmailToken(token);
    if (ok) redirect(user ? "/app?verified=1" : "/login?verified=1");
    return <Shell title="Link expired"><div className="mx-auto max-w-md"><Card><Notice kind="error">This confirmation link is invalid or has expired.</Notice>{user ? <ActionForm action={resendVerificationAction} submitLabel="Send a new link" /> : <p className="text-sm text-ink-600"><Link href="/login" className="font-semibold text-brand-700">Log in</Link> to request a new link.</p>}</Card></div></Shell>;
  }
  if (!user) redirect("/login");
  if (user.emailVerifiedAt) redirect("/app");
  return <Shell title="Confirm your email"><div className="mx-auto max-w-md"><Card>
    <p className="text-sm text-ink-600">We sent a confirmation link to <span className="font-semibold">{user.email}</span>. Open it to unlock your workspace.</p>
    <div className="mt-5"><ActionForm action={resendVerificationAction} submitLabel="Resend confirmation email" /></div>
  </Card></div></Shell>;
}
