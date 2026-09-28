import { changePasswordAction, clearWorkspaceDataAction, deleteAccountAction, signOutEverywhereAction } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { Card, Shell } from "@/components/shell";
import { requireWorkspace, shellUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AccountPage() {
  const context = await requireWorkspace();
  const { user, workspace } = context;
  const [sessions, orders, products] = await Promise.all([
    db.session.count({ where: { userId: user.id, expiresAt: { gt: new Date() } } }),
    db.order.count({ where: { workspaceId: workspace.id } }),
    db.product.count({ where: { workspaceId: workspace.id } }),
  ]);
  const danger = "rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50";
  return <Shell title="Account and security" user={shellUser(context)}><div className="grid gap-5 md:grid-cols-2">
    <Card><h2 className="font-semibold">Profile</h2><dl className="mt-3 space-y-2 text-sm"><div className="flex justify-between"><dt className="text-ink-500">Email</dt><dd className="font-medium">{user.email}</dd></div><div className="flex justify-between"><dt className="text-ink-500">Email confirmed</dt><dd className="font-medium">{user.emailVerifiedAt ? user.emailVerifiedAt.toLocaleDateString("en-US", { dateStyle: "medium" }) : "Not yet"}</dd></div><div className="flex justify-between"><dt className="text-ink-500">Member since</dt><dd className="font-medium">{user.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}</dd></div><div className="flex justify-between"><dt className="text-ink-500">Active sessions</dt><dd className="font-medium">{sessions}</dd></div></dl>
      <div className="mt-4"><ActionForm action={signOutEverywhereAction} submitLabel="Sign out all other devices" submitClassName="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-50" /></div></Card>
    <Card><h2 className="font-semibold">Change password</h2><ActionForm action={changePasswordAction} submitLabel="Update password" className="mt-3 space-y-3">
      <div><label htmlFor="currentPassword">Current password</label><input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required maxLength={128} /></div>
      <div><label htmlFor="password">New password</label><input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} /></div>
    </ActionForm></Card>
    <Card><h2 className="font-semibold">Your data</h2><p className="mt-2 text-sm text-ink-600">{orders.toLocaleString()} orders and {products.toLocaleString()} products in <strong>{workspace.name}</strong>.</p><div className="mt-3 flex flex-wrap gap-3 text-sm"><a href="/api/account/export" className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white">Download everything (JSON)</a></div><p className="mt-3 text-xs text-ink-500">The archive includes your profile, settings, products, orders, order items, and recent activity log.</p>
      <div className="mt-5 border-t border-ink-100 pt-4"><p className="text-sm font-semibold">Clear imported data</p><p className="mt-1 text-xs text-ink-500">Removes all orders, items, and products from this workspace but keeps your account and settings. This cannot be undone.</p><div className="mt-3"><ActionForm action={clearWorkspaceDataAction} submitLabel="Clear all imported data" submitClassName={danger} /></div></div></Card>
    <Card><h2 className="font-semibold text-red-700">Delete account</h2><p className="mt-2 text-sm text-ink-600">Permanently deletes your account, workspace, imported data, and cancels any active subscription. Download your data first if you need it.</p><ActionForm action={deleteAccountAction} submitLabel="Delete my account permanently" submitClassName={danger} className="mt-3 space-y-3">
      <div><label htmlFor="deletePassword">Confirm with your password</label><input id="deletePassword" name="password" type="password" autoComplete="current-password" required maxLength={128} /></div>
      <div><label htmlFor="confirm">Type DELETE to confirm</label><input id="confirm" name="confirm" type="text" autoComplete="off" required pattern="DELETE" /></div>
    </ActionForm></Card>
  </div></Shell>;
}
