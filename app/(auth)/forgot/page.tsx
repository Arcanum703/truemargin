import Link from "next/link";
import { requestPasswordResetAction } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { Card, Shell } from "@/components/shell";

export const metadata = { title: "Reset password — TrueMargin", robots: { index: false } };

export default function ForgotPage() {
  return <Shell title="Reset your password"><div className="mx-auto max-w-md"><Card>
    <p className="mb-4 text-sm text-ink-600">Enter your email and we will send a one-hour reset link.</p>
    <ActionForm action={requestPasswordResetAction} submitLabel="Send reset link" className="space-y-4">
      <div><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} /></div>
    </ActionForm>
    <p className="mt-5 text-sm text-ink-500"><Link href="/login" className="font-semibold text-brand-700">Back to log in</Link></p>
  </Card></div></Shell>;
}
