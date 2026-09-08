import { describe, it, expect } from "vitest";
import { decideResponse, isLive } from "./decide";

const LIVE = { enabled: true, expiresAt: null as Date | null };
const DISABLED = { enabled: false, expiresAt: null as Date | null };
const now = new Date("2026-09-08T00:00:00Z");
const past = new Date("2026-09-01T00:00:00Z");
const future = new Date("2026-09-09T00:00:00Z");

describe("isLive", () => {
  it("enabled 且無到期日 → true", () => {
    expect(isLive(LIVE, now)).toBe(true);
  });
  it("停用 → false", () => {
    expect(isLive(DISABLED, now)).toBe(false);
  });
  it("已過期 → false", () => {
    expect(isLive({ enabled: true, expiresAt: past }, now)).toBe(false);
  });
  it("expiresAt 剛好等於 now → false（<=）", () => {
    expect(isLive({ enabled: true, expiresAt: now }, now)).toBe(false);
  });
  it("未來到期 → true", () => {
    expect(isLive({ enabled: true, expiresAt: future }, now)).toBe(true);
  });
});

describe("decideResponse", () => {
  it("link 不存在 → notfound", () => {
    expect(decideResponse({ link: null, bot: false, recorded: false, now })).toBe("notfound");
    expect(decideResponse({ link: null, bot: true, recorded: false, now })).toBe("notfound");
  });

  it("停用連結 + 爬蟲 UA → gone（迴歸：失效檢查必須先於爬蟲分支）", () => {
    expect(decideResponse({ link: DISABLED, bot: true, recorded: true, now })).toBe("gone");
  });

  it("停用連結 + 非爬蟲 → gone", () => {
    expect(decideResponse({ link: DISABLED, bot: false, recorded: true, now })).toBe("gone");
  });

  it("過期連結 + 爬蟲 → gone", () => {
    expect(decideResponse({ link: { enabled: true, expiresAt: past }, bot: true, recorded: true, now })).toBe(
      "gone",
    );
  });

  it("expiresAt 剛好等於 now → gone", () => {
    expect(decideResponse({ link: { enabled: true, expiresAt: now }, bot: true, recorded: true, now })).toBe(
      "gone",
    );
  });

  it("expiresAt 在未來 + 爬蟲 → botRedirect", () => {
    expect(
      decideResponse({ link: { enabled: true, expiresAt: future }, bot: true, recorded: true, now }),
    ).toBe("botRedirect");
  });

  it("啟用 + 非爬蟲 + 已記錄 → landing", () => {
    expect(decideResponse({ link: LIVE, bot: false, recorded: true, now })).toBe("landing");
  });

  it("啟用 + 非爬蟲 + 記錄失敗 → plainRedirect", () => {
    expect(decideResponse({ link: LIVE, bot: false, recorded: false, now })).toBe("plainRedirect");
  });

  it("預設 now＝目前時間", () => {
    expect(decideResponse({ link: LIVE, bot: false, recorded: true })).toBe("landing");
  });
});
