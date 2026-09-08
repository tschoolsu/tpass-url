import { describe, it, expect } from "vitest";
import { BEACON_MAX_BYTES, readBounded, sanitizeBeacon } from "./beacon";

function streamRequest(chunks: Uint8Array[]): Request {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const c of chunks) controller.enqueue(c);
      controller.close();
    },
  });
  return new Request("https://url.lvh.me/api/click/x", {
    method: "POST",
    body: stream,
    duplex: "half",
  } as RequestInit);
}

describe("sanitizeBeacon", () => {
  it("正常 body 全數保留", () => {
    const r = sanitizeBeacon({
      screenW: 390,
      screenH: 844,
      viewportW: 390,
      viewportH: 664,
      dpr: 3,
      colorDepth: 24,
      jsTimezone: "Asia/Taipei",
      jsLanguages: "zh-TW,en",
      platform: "iPhone",
      touch: true,
      cores: 6,
      memoryGb: 4,
      connection: "4g",
    });
    expect(r).toEqual({
      screenW: 390,
      screenH: 844,
      viewportW: 390,
      viewportH: 664,
      dpr: 3,
      colorDepth: 24,
      jsTimezone: "Asia/Taipei",
      jsLanguages: "zh-TW,en",
      platform: "iPhone",
      touch: true,
      cores: 6,
      memoryGb: 4,
      connection: "4g",
    });
  });

  it("型別錯的欄位個別變 null，其他保留", () => {
    const r = sanitizeBeacon({ screenW: "390", touch: "yes", cores: 4, jsTimezone: 12 });
    expect(r.screenW).toBeNull();
    expect(r.touch).toBeNull();
    expect(r.cores).toBe(4);
    expect(r.jsTimezone).toBeNull();
  });

  it("數字超出範圍或非整數視為 null", () => {
    expect(sanitizeBeacon({ screenW: -1 }).screenW).toBeNull();
    expect(sanitizeBeacon({ screenW: 100000 }).screenW).toBeNull();
    expect(sanitizeBeacon({ screenW: 1.5 }).screenW).toBeNull();
    expect(sanitizeBeacon({ dpr: 0 }).dpr).toBeNull();
    expect(sanitizeBeacon({ dpr: 2.5 }).dpr).toBe(2.5);
    expect(sanitizeBeacon({ cores: 1024 }).cores).toBeNull();
    expect(sanitizeBeacon({ memoryGb: NaN }).memoryGb).toBeNull();
  });

  it("字串截 256 字", () => {
    expect(sanitizeBeacon({ platform: "x".repeat(300) }).platform!.length).toBe(256);
  });

  it("非物件輸入回全 null", () => {
    for (const bad of [null, undefined, "str", 42, []]) {
      const r = sanitizeBeacon(bad);
      expect(Object.values(r).every((v) => v === null)).toBe(true);
    }
  });
});

describe("readBounded", () => {
  it("body 在上限內回傳原文字", async () => {
    const enc = new TextEncoder();
    const req = streamRequest([enc.encode('{"screenW":390}')]);
    const text = await readBounded(req, BEACON_MAX_BYTES);
    expect(text).toBe('{"screenW":390}');
  });

  it("body 超過上限回 null，不整包吸進記憶體", async () => {
    const enc = new TextEncoder();
    // 分成多個 chunk，總長超過上限；沒有 content-length。
    const chunk = enc.encode("x".repeat(1024));
    const chunks = [chunk, chunk, chunk, chunk, chunk]; // 5 * 1024 = 5120 > 4096
    const req = streamRequest(chunks);
    const text = await readBounded(req, BEACON_MAX_BYTES);
    expect(text).toBeNull();
  });

  it("空 body 回空字串", async () => {
    const req = streamRequest([]);
    const text = await readBounded(req, BEACON_MAX_BYTES);
    expect(text).toBe("");
  });
});
