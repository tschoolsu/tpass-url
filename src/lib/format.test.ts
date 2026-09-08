import { describe, it, expect } from "vitest";
import { fmtTime, toLocalInput, fromLocalInput } from "./format";

describe("fmtTime", () => {
  it("UTC 轉台北時間（+8）", () => {
    expect(fmtTime(new Date("2026-09-08T06:03:05Z"))).toBe("2026-09-08 14:03:05");
  });
});

describe("toLocalInput", () => {
  it("null 回空字串", () => {
    expect(toLocalInput(null)).toBe("");
  });
  it("轉成 datetime-local 要的格式（台北時間，無秒）", () => {
    expect(toLocalInput(new Date("2026-09-08T06:03:05Z"))).toBe("2026-09-08T14:03");
  });
});

describe("fromLocalInput", () => {
  it("空字串回 null", () => {
    expect(fromLocalInput("")).toBeNull();
  });
  it("視為台北時間轉回 Date（UTC）", () => {
    const d = fromLocalInput("2026-09-08T14:03");
    expect(d).not.toBeNull();
    expect(d?.toISOString()).toBe("2026-09-08T06:03:00.000Z");
  });
  it("無法解析回 null", () => {
    expect(fromLocalInput("garbage")).toBeNull();
  });
});
