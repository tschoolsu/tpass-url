import { describe, it, expect } from "vitest";
import { isBot } from "./bot";

describe("isBot", () => {
  it("常見預覽爬蟲算 bot", () => {
    for (const ua of [
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
      "Mozilla/5.0 (Linux; Android) Line/13.0.0 LineIOS",
      "Twitterbot/1.0",
      "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
      "WhatsApp/2.23.20.0",
      "TelegramBot (like TwitterBot)",
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "curl/8.4.0",
    ]) {
      expect(isBot(ua), ua).toBe(true);
    }
  });
  it("一般瀏覽器不算", () => {
    expect(
      isBot("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"),
    ).toBe(false);
    expect(isBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")).toBe(false);
  });
  it("缺 UA 不算 bot（照常落頁）", () => {
    expect(isBot(null)).toBe(false);
    expect(isBot("")).toBe(false);
  });
  it("bot 只在單詞邊界算數，不誤中一般字詞", () => {
    expect(isBot("Mozilla/5.0 Botanical Browser")).toBe(false);
  });
  it("bot 在 UA 開頭且後面接非字母仍算 bot", () => {
    expect(isBot("Mozilla/5.0 (compatible; Bingbot/2.0)")).toBe(true);
  });
});
