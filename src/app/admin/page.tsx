import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge, Button } from "tpass-ui";
import { authConfig } from "@/config/auth";
import { listLinks, isLive } from "@/lib/links";
import { fmtTime } from "@/lib/format";
import { CopyButton } from "@/components/admin/CopyButton";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const links = await listLinks();
  const base = authConfig.selfUrl;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-extrabold text-2xl tracking-tight">短網址</h1>
        <Link href="/admin/new">
          <Button variant="primary">
            <Plus className="h-4 w-4" /> 新增
          </Button>
        </Link>
      </div>

      {links.length === 0 && (
        <p className="rounded-2xl border-2 border-dashed border-foreground/40 bg-muted/40 p-5 text-center font-medium text-muted-foreground">
          還沒有任何短網址。
        </p>
      )}

      <div className="flex flex-col gap-3">
        {links.map((l) => (
          <div
            key={l.id}
            className="flex items-center justify-between gap-3 rounded-2xl border-2 border-foreground bg-card p-4 shadow-[3px_3px_0_0_var(--color-foreground)]"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/admin/${l.id}`} className="font-mono font-bold hover:underline">
                  /{l.id}
                </Link>
                <CopyButton text={`${base}/${l.id}`} />
                {!isLive(l) && <Badge className="bg-muted">已失效</Badge>}
                {l.title && <span className="font-medium truncate">{l.title}</span>}
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground truncate">{l.target}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                建立 {fmtTime(l.createdAt)}
                {l.expiresAt && ` · 到期 ${fmtTime(l.expiresAt)}`}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-extrabold text-2xl">{l._count.clicks}</div>
              <div className="text-[11px] text-muted-foreground">點擊</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
