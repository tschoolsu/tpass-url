// POST /api/click/<clickId>：跳轉頁的 sendBeacon 打進來補 JS 層欄位。無登入（點擊者是匿名的）。
// clickId 是 uuid，不可猜；只准補一次，由 completeClick 的 jsAt IS NULL 保證。
import { BEACON_MAX_BYTES, sanitizeBeacon } from "@/lib/beacon";
import { completeClick } from "@/lib/links";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request, { params }: { params: Promise<{ clickId: string }> }) {
  const { clickId } = await params;
  if (!UUID_RE.test(clickId)) return new Response(null, { status: 400 });

  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > BEACON_MAX_BYTES) return new Response(null, { status: 413 });
  const text = await req.text();
  if (text.length > BEACON_MAX_BYTES) return new Response(null, { status: 413 });

  let body: unknown = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }

  await completeClick(clickId, sanitizeBeacon(body));
  return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
}
