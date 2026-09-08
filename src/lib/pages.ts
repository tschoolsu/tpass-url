// 跳轉頁與兩個小頁面。手寫 HTML 字串，不經 React：這些頁面要極輕、零 hydration。
// 樣式 inline，色票對齊 tpass-ui（乳白底、黑框、硬陰影）。

export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// 注入 <script> 內的 JSON：跳脫 < > 與 U+2028/2029，避免 </script> 提前關閉或 JS 語法錯。
function jsonForScript(v: unknown): string {
  return JSON.stringify(v)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll(" ", "\\u2028")
    .replaceAll(" ", "\\u2029");
}

const STYLE = `
:root{color-scheme:light}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:oklch(0.98 0.01 90);color:oklch(0.2 0 0);font:600 16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans TC",sans-serif}
.card{border:2px solid currentColor;background:#fff;padding:24px 28px;box-shadow:4px 4px 0 0 currentColor;border-radius:16px;max-width:360px;margin:16px;text-align:center}
.card p{margin:0 0 12px}
.card a{display:inline-block;border:2px solid currentColor;padding:6px 14px;border-radius:10px;color:inherit;text-decoration:none;box-shadow:2px 2px 0 0 currentColor}
`;

function shell(title: string, body: string, extraHead = ""): string {
  return `<!doctype html><html lang="zh-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title>${extraHead}<style>${STYLE}</style></head><body>${body}</body></html>`;
}

export function renderRedirectPage({ target, clickId }: { target: string; clickId: string }): string {
  const script = `(function(){var u=${jsonForScript(target)},p=${jsonForScript("/api/click/" + clickId)};function go(){location.replace(u)}var t=setTimeout(go,800);try{var n=navigator,s=screen,c=n.connection||{};var d={screenW:s.width,screenH:s.height,viewportW:innerWidth,viewportH:innerHeight,dpr:devicePixelRatio,colorDepth:s.colorDepth,jsTimezone:Intl.DateTimeFormat().resolvedOptions().timeZone,jsLanguages:(n.languages||[]).join(","),platform:n.platform,touch:n.maxTouchPoints>0,cores:n.hardwareConcurrency,memoryGb:n.deviceMemory,connection:c.effectiveType};n.sendBeacon(p,new Blob([JSON.stringify(d)],{type:"application/json"}));clearTimeout(t);go()}catch(e){}})()`;
  const noscript = `<noscript><meta http-equiv="refresh" content="0;url=${escapeHtml(target)}"></noscript>`;
  const body = `<div class="card"><p>跳轉中…</p><a href="${escapeHtml(target)}">沒有自動跳轉？點這裡</a></div><script>${script}</script>`;
  return shell("跳轉中…", body, noscript);
}

export function renderGonePage(): string {
  return shell("連結已失效", `<div class="card"><p>這個連結已失效</p><p style="font-weight:500;color:oklch(0.5 0 0)">活動可能已結束，或連結被停用。</p></div>`);
}

export function renderNotFoundPage(portalUrl: string): string {
  return shell("找不到連結", `<div class="card"><p>找不到這個短網址</p><a href="${escapeHtml(portalUrl)}">回 T-Pass 大廳</a></div>`);
}
