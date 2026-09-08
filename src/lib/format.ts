const fmt = new Intl.DateTimeFormat("zh-TW", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

// 2026-09-08 14:03:05
export function fmtTime(d: Date): string {
  return fmt.format(d).replace(/\//g, "-").replace(",", "");
}

// <input type="datetime-local"> 要的格式（台北時間）。
export function toLocalInput(d: Date | null): string {
  if (!d) return "";
  return fmtTime(d).slice(0, 16).replace(" ", "T");
}

// datetime-local 的值視為台北時間轉回 Date。
export function fromLocalInput(v: string): Date | null {
  if (!v) return null;
  const d = new Date(`${v}:00+08:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
