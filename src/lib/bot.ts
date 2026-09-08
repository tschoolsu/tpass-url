// 連結預覽爬蟲與工具程式：不跑 JS，直接 302 讓它抓到目標網站的 OG。
const BOT_RE =
  /bot(?![a-z])|crawler|spider|crawling|facebookexternalhit|discordbot|line\/|twitterbot|slackbot|whatsapp|telegrambot|preview|curl\/|wget\/|python-requests|go-http-client/i;

export function isBot(ua: string | null | undefined): boolean {
  if (!ua) return false;
  return BOT_RE.test(ua);
}
