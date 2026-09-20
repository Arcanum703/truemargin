"use client";

import { useEffect } from "react";

export function WorkspaceBootstrap() {
  useEffect(() => { void fetch("/api/workspace"); }, []);
  return null;
}
