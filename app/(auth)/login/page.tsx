import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { Card, Shell } from "@/components/shell";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Log in — TrueMargin", robots: { index: false } };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/app");
  return <Shell title="Log in"><div className="mx-auto max-w-md"><Card>
    <ActionForm action={loginAction} submitLabel="Log in" className="space-y-4">
      <div><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} /></div>
      <div><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required maxLength={128} /></div>
    </ActionForm>
    <div className="mt-5 flex justify-between text-sm text-ink-500"><Link href="/forgot" className="hover:text-brand-700">Forgot password?</Link><Link href="/signup" className="font-semibold text-brand-700">Create an account</Link></div>
  </Card></div></Shell>;
}
