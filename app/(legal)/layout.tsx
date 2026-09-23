import { Shell } from "@/components/shell";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <Shell><article className="legal mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">{children}</article></Shell>;
}
