// GET /<slug>：寫 Click（header 層）→ 依 decideResponse 分支（見 src/lib/decide.ts）。
import { NextResponse } from "next/server";
import { authConfig } from "@/config/auth";
import { normalizeSlug, validateSlug } from "@/lib/slug";
import { isBot } from "@/lib/bot";
import { clickFromHeaders } from "@/lib/click-headers";
import { renderRedirectPage, renderGonePage, renderNotFoundPage } from "@/lib/pages";
import { getLink, recordClick } from "@/lib/links";
import { decideResponse } from "@/lib/decide";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HTML = { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" };
const NO_STORE = { "cache-control": "no-store" };

function html(body: string, status: number) {
  return new NextResponse(body, { status, headers: HTML });
}

function redirectTo(target: string) {
  return NextResponse.redirect(target, { status: 302, headers: NO_STORE });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const slug = normalizeSlug((await params).id);
  // 格式不合法（含保留字）連 DB 都不用查。
  const link = validateSlug(slug) ? null : await getLink(slug);
  // 找不到的 slug 不記錄，在寫 Click 之前就回應。
  if (link === null) return html(renderNotFoundPage(authConfig.portalUrl), 404);

  const bot = isBot(req.headers.get("user-agent"));

  // 一律先寫 Click（含停用／過期的連結，反映真實點擊）。記錄失敗不能擋跳轉：
  // DB 掛了也要讓訪客過去，只是少一筆點擊記錄，也少一頁能讓 beacon 補資料的跳轉頁。
  let clickId: string | null = null;
  try {
    clickId = (await recordClick(link.id, clickFromHeaders(req.headers), bot)).id;
  } catch (e) {
    console.error("[url] recordClick failed", e);
  }

  switch (decideResponse({ link, bot, recorded: clickId !== null })) {
    case "notfound":
      // 不會發生（link 已確認非 null），留給型別窮盡檢查。
      return html(renderNotFoundPage(authConfig.portalUrl), 404);
    case "gone":
      return html(renderGonePage(), 410);
    case "botRedirect":
    case "plainRedirect":
      return redirectTo(link.target);
    case "landing":
      return html(renderRedirectPage({ target: link.target, clickId: clickId! }), 200);
  }
}
