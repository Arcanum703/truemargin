import Link from "next/link";
import { WorkspaceBootstrap } from "@/components/workspace-bootstrap";
import { Card, Shell } from "@/components/shell";
import { db } from "@/lib/db";

export default async function WorkspaceLinkPage({ params }: { params: { token: string } }) {
  const workspace = await db.workspace.findUnique({ where: { token: params.token } });
  if (!workspace) return <Shell title="Workspace not found"><Card><p className="text-sm text-slate-500">That saved link is no longer available.</p></Card></Shell>;
  return <Shell title="Your saved workspace"><WorkspaceBootstrap token={params.token} /><Card><p className="text-sm text-slate-600">This link identifies your TrueMargin workspace. Your browser cookie will keep using it on this device.</p><Link href="/" className="mt-4 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Open dashboard</Link></Card></Shell>;
}
