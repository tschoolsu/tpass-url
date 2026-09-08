// GET /<slug> 的分支決策，純函式，方便測試。順序：不存在 → 失效 → 爬蟲 → 記錄失敗 → 落頁。
export type Decision = "notfound" | "gone" | "botRedirect" | "plainRedirect" | "landing";

export function isLive(link: { enabled: boolean; expiresAt: Date | null }, now = new Date()): boolean {
  if (!link.enabled) return false;
  if (link.expiresAt && link.expiresAt <= now) return false;
  return true;
}

export function decideResponse(opts: {
  link: { enabled: boolean; expiresAt: Date | null } | null;
  bot: boolean;
  recorded: boolean;
  now?: Date;
}): Decision {
  const { link, bot, recorded, now = new Date() } = opts;
  if (link === null) return "notfound";
  if (!isLive(link, now)) return "gone";
  if (bot) return "botRedirect";
  if (!recorded) return "plainRedirect";
  return "landing";
}
