// POST /api/click/<clickId>：跳轉頁的 sendBeacon 打進來補 JS 層欄位。無登入（點擊者是匿名的）。
// clickId 是 uuid，不可猜；只准補一次，由 completeClick 的 jsAt IS NULL 保證。
import { BEACON_MAX_BYTES, isEmptyBeacon, readBounded, sanitizeBeacon } from "@/lib/beacon";
import { completeClick } from "@/lib/links";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NO_STORE = { "cache-control": "no-store" };

export async function POST(req: Request, { params }: { params: Promise<{ clickId: string }> }) {
  const { clickId } = await params;
  if (!UUID_RE.test(clickId)) return new Response(null, { status: 400, headers: NO_STORE });

  // 邊讀邊算長度，超過上限就中止串流，不把整個 body 吸進記憶體。
  const text = await readBounded(req, BEACON_MAX_BYTES);
  if (text === null) return new Response(null, { status: 413, headers: NO_STORE });

  let body: unknown = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }

  // 空／垃圾 beacon（每個欄位都被清成 null）不值得燒掉一次性額度。
  const fields = sanitizeBeacon(body);
  if (!isEmptyBeacon(fields)) await completeClick(clickId, fields);
  return new Response(null, { status: 204, headers: NO_STORE });
}
