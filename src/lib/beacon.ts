// beacon body 清洗：client 送來的東西全不可信。每個欄位獨立驗，錯的丟 null，不整包拒絕。
export const BEACON_MAX_BYTES = 4096;

export interface JsClickFields {
  screenW: number | null;
  screenH: number | null;
  viewportW: number | null;
  viewportH: number | null;
  dpr: number | null;
  colorDepth: number | null;
  jsTimezone: string | null;
  jsLanguages: string | null;
  platform: string | null;
  touch: boolean | null;
  cores: number | null;
  memoryGb: number | null;
  connection: string | null;
}

const MAX_STR = 256;

function int(v: unknown, max: number): number | null {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= max ? v : null;
}

function num(v: unknown, min: number, max: number): number | null {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? v : null;
}

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.length > MAX_STR ? t.slice(0, MAX_STR) : t;
}

function bool(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
}

// 讀 body 到上限為止；超過就回 null，不把整個 body 吸進記憶體。空 body 回 ""。
export async function readBounded(req: Request, max: number): Promise<string | null> {
  const reader = req.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

// 全部欄位都被清成 null（空包或垃圾 beacon）不算有效補資料，不該燒掉一次性額度。
export function isEmptyBeacon(f: JsClickFields): boolean {
  return Object.values(f).every((v) => v === null);
}

export function sanitizeBeacon(body: unknown): JsClickFields {
  const o: Record<string, unknown> =
    body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  return {
    screenW: int(o.screenW, 20000),
    screenH: int(o.screenH, 20000),
    viewportW: int(o.viewportW, 20000),
    viewportH: int(o.viewportH, 20000),
    dpr: num(o.dpr, 0.1, 10),
    colorDepth: int(o.colorDepth, 64),
    jsTimezone: str(o.jsTimezone),
    jsLanguages: str(o.jsLanguages),
    platform: str(o.platform),
    touch: bool(o.touch),
    cores: int(o.cores, 256),
    memoryGb: num(o.memoryGb, 0, 1024),
    connection: str(o.connection),
  };
}
