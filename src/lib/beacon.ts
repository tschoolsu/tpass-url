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
