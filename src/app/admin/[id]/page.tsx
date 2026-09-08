import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Pencil } from "lucide-react";
import { Badge, Button, Card } from "tpass-ui";
import { authConfig } from "@/config/auth";
import { getLink, isLive, linkStats, listClicks } from "@/lib/links";
import { fmtTime } from "@/lib/format";
import { CopyButton } from "@/components/admin/CopyButton";
import { DeleteLinkButton } from "@/components/admin/DeleteLinkButton";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <div className="font-extrabold text-3xl">{value}</div>
      <div className="text-[11px] font-bold text-muted-foreground">{label}</div>
    </Card>
  );
}

function place(c: { country: string | null; city: string | null; region: string | null }) {
  return [c.country, c.region, c.city].filter(Boolean).join(" / ") || "—";
}

export default async function LinkDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; bots?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const link = await getLink(id);
  if (!link) notFound();

  const page = Math.max(1, Number(sp.page) || 1);
  const includeBots = sp.bots === "1";
  const [stats, clicks] = await Promise.all([linkStats(id), listClicks(id, { page, includeBots })]);
  const pages = Math.max(1, Math.ceil(clicks.total / clicks.pageSize));
  const short = `${authConfig.selfUrl}/${link.id}`;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-mono font-extrabold text-2xl tracking-tight">/{link.id}</h1>
            <CopyButton text={short} />
            {!isLive(link) && <Badge className="bg-muted">已失效</Badge>}
          </div>
          {link.title && <p className="mt-1 font-bold">{link.title}</p>}
          <p className="mt-1 font-mono text-[11px] text-muted-foreground break-all">{link.target}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            建立 {fmtTime(link.createdAt)}
            {link.expiresAt && ` · 到期 ${fmtTime(link.expiresAt)}`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <a href={`/admin/${link.id}/qr.svg`} download>
            <Button size="sm">
              <Download className="h-4 w-4" /> QR
            </Button>
          </a>
          <Link href={`/admin/${link.id}/edit`}>
            <Button size="sm">
              <Pencil className="h-4 w-4" /> 編輯
            </Button>
          </Link>
          <DeleteLinkButton id={link.id} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="總點擊" value={stats.total} />
        <Stat label="不重複 IP" value={stats.unique} />
        <Stat label="爬蟲" value={stats.bots} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-extrabold text-lg">點擊明細</h2>
        <Link
          href={`/admin/${link.id}?bots=${includeBots ? "0" : "1"}`}
          className="text-sm font-bold underline"
        >
          {includeBots ? "隱藏爬蟲" : "顯示爬蟲"}
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border-2 border-foreground bg-card shadow-[3px_3px_0_0_var(--color-foreground)]">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-foreground bg-muted/40 text-left text-[11px] font-bold uppercase">
            <tr>
              <th className="p-3">時間</th>
              <th className="p-3">IP</th>
              <th className="p-3">地點</th>
              <th className="p-3">裝置</th>
              <th className="p-3">瀏覽器</th>
              <th className="p-3">來源</th>
              <th className="p-3">螢幕</th>
              <th className="p-3">語言</th>
            </tr>
          </thead>
          <tbody>
            {clicks.rows.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-muted-foreground">
                  還沒有點擊。
                </td>
              </tr>
            )}
            {clicks.rows.map((c) => (
              <tr key={c.id} className="border-b border-foreground/10 align-top">
                <td className="p-3 font-mono whitespace-nowrap">{fmtTime(c.createdAt)}</td>
                <td className="p-3 font-mono">{c.ip ?? "—"}{c.isBot && <Badge className="ml-1">bot</Badge>}</td>
                <td className="p-3">{place(c)}{c.jsTimezone && <div className="text-[11px] text-muted-foreground">{c.jsTimezone}</div>}</td>
                <td className="p-3">
                  {c.deviceType ?? "—"}
                  {c.deviceModel && ` · ${c.deviceModel}`}
                  <div className="text-[11px] text-muted-foreground">{[c.os, c.osVer].filter(Boolean).join(" ")}</div>
                </td>
                <td className="p-3">{[c.browser, c.browserVer].filter(Boolean).join(" ") || "—"}</td>
                <td className="p-3 max-w-[16rem] truncate font-mono text-[11px]" title={c.referer ?? ""}>{c.referer ?? "—"}</td>
                <td className="p-3 font-mono text-[11px]">
                  {c.screenW ? `${c.screenW}×${c.screenH}` : "—"}
                  {c.dpr && ` @${c.dpr}x`}
                </td>
                <td className="p-3 font-mono text-[11px]">{c.jsLanguages ?? c.language ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm font-bold">
          {page > 1 && <Link href={`/admin/${link.id}?page=${page - 1}&bots=${includeBots ? 1 : 0}`}>上一頁</Link>}
          <span>{page} / {pages}</span>
          {page < pages && <Link href={`/admin/${link.id}?page=${page + 1}&bots=${includeBots ? 1 : 0}`}>下一頁</Link>}
        </div>
      )}
    </div>
  );
}
