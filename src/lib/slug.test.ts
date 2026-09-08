import { describe, it, expect } from "vitest";
import { normalizeSlug, validateSlug, generateSlug, validateTarget } from "./slug";

describe("normalizeSlug", () => {
  it("trim 並轉小寫", () => {
    expect(normalizeSlug("  Sports-Day ")).toBe("sports-day");
  });
});

describe("validateSlug", () => {
  it("合法 slug 回 null", () => {
    expect(validateSlug("sports-day")).toBeNull();
    expect(validateSlug("ab")).toBeNull();
    expect(validateSlug("a1")).toBeNull();
  });
  it("擋非法字元", () => {
    expect(validateSlug("Sports")).toMatch(/小寫/);
    expect(validateSlug("a b")).toMatch(/小寫/);
    expect(validateSlug("a_b")).toMatch(/小寫/);
    expect(validateSlug("中文")).toMatch(/小寫/);
  });
  it("擋長度", () => {
    expect(validateSlug("a")).toMatch(/2/);
    expect(validateSlug("a".repeat(65))).toMatch(/64/);
    expect(validateSlug("a".repeat(64))).toBeNull();
  });
  it("擋開頭或結尾的連字號", () => {
    expect(validateSlug("-ab")).not.toBeNull();
    expect(validateSlug("ab-")).not.toBeNull();
  });
  it("擋保留字", () => {
    for (const r of ["admin", "api", "_next", "favicon.ico", "robots.txt", "sitemap.xml"]) {
      expect(validateSlug(r)).toMatch(/保留/);
    }
  });
});

describe("generateSlug", () => {
  it("6 碼 a-z0-9，且大致不重複", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const s = generateSlug();
      expect(s).toMatch(/^[a-z0-9]{6}$/);
      expect(validateSlug(s)).toBeNull();
      seen.add(s);
    }
    expect(seen.size).toBeGreaterThan(190);
  });
});

describe("validateTarget", () => {
  it("只接受 http(s) 絕對網址", () => {
    expect(validateTarget("https://example.com/a?b=1")).toBeNull();
    expect(validateTarget("http://example.com")).toBeNull();
    expect(validateTarget("javascript:alert(1)")).not.toBeNull();
    expect(validateTarget("example.com")).not.toBeNull();
    expect(validateTarget("")).not.toBeNull();
    expect(validateTarget("https://" + "a".repeat(2100))).toMatch(/2048/);
  });
});
