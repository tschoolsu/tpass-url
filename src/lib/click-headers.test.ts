import { describe, it, expect } from "vitest";
import { clickFromHeaders } from "./click-headers";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

describe("clickFromHeaders", () => {
  it("Cloudflare header 優先", () => {
    const h = new Headers({
      "cf-connecting-ip": "1.2.3.4",
      "x-forwarded-for": "9.9.9.9, 10.0.0.1",
      "cf-ipcountry": "TW",
      "cf-ipcity": "Taipei",
      "cf-region": "Taipei City",
      "cf-region-code": "TPE",
      "cf-postal-code": "100",
      "cf-iplatitude": "25.04",
      "cf-iplongitude": "121.53",
      "cf-timezone": "Asia/Taipei",
      "cf-ipcontinent": "AS",
      "user-agent": IPHONE,
      referer: "https://www.instagram.com/",
      "accept-language": "zh-TW,zh;q=0.9",
    });
    const c = clickFromHeaders(h);
    expect(c.ip).toBe("1.2.3.4");
    expect(c.country).toBe("TW");
    expect(c.city).toBe("Taipei");
    expect(c.region).toBe("Taipei City");
    expect(c.regionCode).toBe("TPE");
    expect(c.postalCode).toBe("100");
    expect(c.latitude).toBe("25.04");
    expect(c.longitude).toBe("121.53");
    expect(c.timezone).toBe("Asia/Taipei");
    expect(c.continent).toBe("AS");
    expect(c.userAgent).toBe(IPHONE);
    expect(c.browser).toBe("Mobile Safari");
    expect(c.os).toBe("iOS");
    expect(c.osVer).toBe("17.0");
    expect(c.deviceType).toBe("mobile");
    expect(c.deviceModel).toBe("iPhone");
    expect(c.referer).toBe("https://www.instagram.com/");
    expect(c.language).toBe("zh-TW,zh;q=0.9");
  });

  it("沒有 Cloudflare 時退到 x-forwarded-for 第一段，再退 x-real-ip", () => {
    expect(clickFromHeaders(new Headers({ "x-forwarded-for": "9.9.9.9, 10.0.0.1" })).ip).toBe("9.9.9.9");
    expect(clickFromHeaders(new Headers({ "x-real-ip": "8.8.8.8" })).ip).toBe("8.8.8.8");
    expect(clickFromHeaders(new Headers()).ip).toBeNull();
  });

  it("桌機 UA 的 deviceType 是 desktop，缺欄位存 null", () => {
    const c = clickFromHeaders(
      new Headers({
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }),
    );
    expect(c.deviceType).toBe("desktop");
    expect(c.browser).toBe("Chrome");
    expect(c.os).toBe("Windows");
    expect(c.country).toBeNull();
    expect(c.deviceModel).toBeNull();
  });

  it("Cloudflare 的 XX（未知國家）視為 null", () => {
    expect(clickFromHeaders(new Headers({ "cf-ipcountry": "XX" })).country).toBeNull();
  });

  it("超長 header 截到 512 字", () => {
    const c = clickFromHeaders(new Headers({ referer: "https://x.test/" + "a".repeat(2000) }));
    expect(c.referer!.length).toBe(512);
  });
});
