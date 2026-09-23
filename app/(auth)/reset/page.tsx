import Link from "next/link";
import { resetPasswordAction } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { Card, Shell } from "@/components/shell";

export const metadata = { title: "Choose a new password — TrueMargin", robots: { index: false } };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token) return <Shell title="Reset link missing"><div className="mx-auto max-w-md"><Card><p className="text-sm text-slate-600">This link is incomplete. <Link href="/forgot" className="font-semibold text-violet-700">Request a new reset link</Link>.</p></Card></div></Shell>;
  return <Shell title="Choose a new password"><div className="mx-auto max-w-md"><Card>
    <ActionForm action={resetPasswordAction} submitLabel="Set new password" className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div><label htmlFor="password">New password</label><input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} /></div>
    </ActionForm>
    <p className="mt-4 text-xs text-slate-500">Setting a new password signs out every other device.</p>
  </Card></div></Shell>;
}
