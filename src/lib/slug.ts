// slug 規則：小寫 [a-z0-9-]，2–64 字，不以連字號開頭或結尾，不得是路由保留字。
// 純函式，無 DB；「已存在」由 server action 查 DB 判斷。
import { customAlphabet } from "nanoid";

export const RESERVED: ReadonlySet<string> = new Set([
  "admin",
  "api",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "manifest.json",
]);

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const MAX_TARGET = 2048;

const nano = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

export function normalizeSlug(input: string): string {
  return input.trim().toLowerCase();
}

export function validateSlug(slug: string): string | null {
  if (slug.length < 2) return "至少 2 個字";
  if (slug.length > 64) return "最多 64 個字";
  if (RESERVED.has(slug)) return "這是保留字，換一個";
  if (!SLUG_RE.test(slug)) return "只能用小寫英文、數字與連字號，且不能以連字號開頭或結尾";
  return null;
}

export function generateSlug(): string {
  return nano();
}

export function validateTarget(url: string): string | null {
  if (!url) return "請輸入目標網址";
  if (url.length > MAX_TARGET) return `網址最長 ${MAX_TARGET} 字`;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "請輸入完整網址（含 https://）";
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return "只接受 http 或 https 網址";
  }
  return null;
}
