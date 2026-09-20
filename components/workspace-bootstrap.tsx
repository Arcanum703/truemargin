"use client";

import { useEffect } from "react";

export function WorkspaceBootstrap({ token }: { token?: string }) {
  useEffect(() => { void fetch(token ? `/api/workspace?token=${encodeURIComponent(token)}` : "/api/workspace"); }, [token]);
  return null;
}
