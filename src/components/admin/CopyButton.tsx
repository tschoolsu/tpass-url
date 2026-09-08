"use client";

import { useState } from "react";
import { Copy, Check, X } from "lucide-react";

type Status = "idle" | "done" | "error";

export function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<Status>("idle");
  return (
    <button
      type="button"
      title="複製短網址"
      onClick={() => {
        navigator.clipboard.writeText(text).then(
          () => setStatus("done"),
          () => setStatus("error"),
        );
        setTimeout(() => setStatus("idle"), 1500);
      }}
      className="inline-flex items-center gap-1 rounded-md border-2 border-foreground bg-card px-2 py-0.5 font-mono text-[11px] font-bold shadow-[2px_2px_0_0_var(--color-foreground)] transition-all hover:-translate-y-0.5"
    >
      {status === "done" && <Check className="h-3.5 w-3.5" />}
      {status === "error" && <X className="h-3.5 w-3.5" />}
      {status === "idle" && <Copy className="h-3.5 w-3.5" />}
      {status === "done" ? "已複製" : status === "error" ? "複製失敗" : "複製"}
    </button>
  );
}
