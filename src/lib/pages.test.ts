import { describe, it, expect } from "vitest";
import { escapeHtml, renderRedirectPage, renderGonePage, renderNotFoundPage } from "./pages";

describe("escapeHtml", () => {
  it("跳脫五個字元", () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;",
    );
  });
});

describe("renderRedirectPage", () => {
  const target = "https://example.com/?a=1&b=<script>";
  const html = renderRedirectPage({ target, clickId: "abc-123" });

  it("noscript refresh 指向 escape 過的目標", () => {
    expect(html).toContain('<noscript><meta http-equiv="refresh" content="0;url=https://example.com/?a=1&amp;b=&lt;script&gt;"></noscript>');
  });
  it("script 內的 target 用 JSON 注入且 < 被跳脫，不能提前關閉 script", () => {
    expect(html).toContain('"https://example.com/?a=1&b=\\u003cscript\\u003e"');
    expect(html.split("</script>").length).toBe(2);
  });
  it("beacon 打到 /api/click/<clickId>，並有 800ms 保底與 location.replace", () => {
    expect(html).toContain('"/api/click/abc-123"');
    expect(html).toContain("setTimeout(go,800)");
    expect(html).toContain("location.replace(");
    expect(html).toContain("sendBeacon");
  });
  it("蒐集的欄位名與 beacon 清洗欄位一致", () => {
    for (const k of [
      "screenW", "screenH", "viewportW", "viewportH", "dpr", "colorDepth",
      "jsTimezone", "jsLanguages", "platform", "touch", "cores", "memoryGb", "connection",
    ]) {
      expect(html, k).toContain(k + ":");
    }
  });
});

describe("renderGonePage / renderNotFoundPage", () => {
  it("失效頁有說明文字", () => {
    expect(renderGonePage()).toContain("連結已失效");
  });
  it("404 頁帶回大廳連結（escape）", () => {
    expect(renderNotFoundPage("https://portal.test/?x=1&y=2")).toContain('href="https://portal.test/?x=1&amp;y=2"');
  });
});
