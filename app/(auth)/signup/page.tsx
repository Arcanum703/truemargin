import Link from "next/link";
import { redirect } from "next/navigation";
import { signupAction } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { Card, Shell } from "@/components/shell";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";

export const metadata = { title: "Start your free trial — TrueMargin" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/app");
  return <Shell title={`Start your ${env.TRIAL_DAYS}-day free trial`}><div className="mx-auto max-w-md"><Card>
    <ActionForm action={signupAction} submitLabel="Create workspace" className="space-y-4">
      <div><label htmlFor="shopName">Shop name</label><input id="shopName" name="shopName" type="text" autoComplete="organization" required maxLength={80} placeholder="My Etsy shop" /></div>
      <div><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} /></div>
      <div><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} /><p className="mt-1 text-xs text-slate-500">At least 10 characters. A passphrase of a few unrelated words works well.</p></div>
      <label className="flex items-start gap-2 text-xs font-normal text-slate-600"><input className="mt-0.5 h-4 w-4" name="acceptTerms" type="checkbox" required /> I agree to the <Link href="/terms" className="font-semibold text-violet-700">Terms of Service</Link> and <Link href="/privacy" className="font-semibold text-violet-700">Privacy Policy</Link>.</label>
    </ActionForm>
    <p className="mt-5 text-sm text-slate-500">Already have an account? <Link href="/login" className="font-semibold text-violet-700">Log in</Link></p>
  </Card></div></Shell>;
}
