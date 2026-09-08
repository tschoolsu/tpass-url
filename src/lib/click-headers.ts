// 從 request header 擷取 server 層點擊欄位。純函式，無 DB。
// 地理欄位來自 Cloudflare（橘雲 + Managed Transforms「Add visitor location headers」）；
// 本機 dev 沒有這些 header，一律存 null。
import { UAParser } from "ua-parser-js";

export interface ServerClickFields {
  ip: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  regionCode: string | null;
  postalCode: string | null;
  latitude: string | null;
  longitude: string | null;
  timezone: string | null;
  continent: string | null;
  userAgent: string | null;
  browser: string | null;
  browserVer: string | null;
  os: string | null;
  osVer: string | null;
  deviceType: string | null;
  deviceModel: string | null;
  referer: string | null;
  language: string | null;
}

const MAX = 512;

function take(h: Headers, name: string): string | null {
  const v = h.get(name);
  if (!v) return null;
  const t = v.trim();
  if (!t) return null;
  return t.length > MAX ? t.slice(0, MAX) : t;
}

function clientIp(h: Headers): string | null {
  const cf = take(h, "cf-connecting-ip");
  if (cf) return cf;
  const fwd = take(h, "x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim() || null;
  return take(h, "x-real-ip");
}

export function clickFromHeaders(h: Headers): ServerClickFields {
  const userAgent = take(h, "user-agent");
  const ua = userAgent ? UAParser(userAgent) : null;
  const country = take(h, "cf-ipcountry");

  return {
    ip: clientIp(h),
    // Cloudflare 對無法判定的 IP 給 "XX"，那不是國家。
    country: country && country !== "XX" ? country : null,
    city: take(h, "cf-ipcity"),
    region: take(h, "cf-region"),
    regionCode: take(h, "cf-region-code"),
    postalCode: take(h, "cf-postal-code"),
    latitude: take(h, "cf-iplatitude"),
    longitude: take(h, "cf-iplongitude"),
    timezone: take(h, "cf-timezone"),
    continent: take(h, "cf-ipcontinent"),
    userAgent,
    browser: ua?.browser.name ?? null,
    browserVer: ua?.browser.version ?? null,
    os: ua?.os.name ?? null,
    osVer: ua?.os.version ?? null,
    // ua-parser 對桌機不給 type；有 UA 但沒 type 就當 desktop。
    deviceType: ua ? (ua.device.type ?? "desktop") : null,
    deviceModel: ua?.device.model ?? null,
    referer: take(h, "referer"),
    language: take(h, "accept-language"),
  };
}
