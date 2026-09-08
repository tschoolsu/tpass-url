// GET /<slug>：寫 Click（header 層）→ 爬蟲 302 / 失效 410 / 跳轉頁 200。
import { NextResponse } from "next/server";
import { authConfig } from "@/config/auth";
import { normalizeSlug, validateSlug } from "@/lib/slug";
import { isBot } from "@/lib/bot";
import { clickFromHeaders } from "@/lib/click-headers";
import { renderRedirectPage, renderGonePage, renderNotFoundPage } from "@/lib/pages";
import { getLink, isLive, recordClick } from "@/lib/links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HTML = { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" };

function html(body: string, status: number) {
  return new NextResponse(body, { status, headers: HTML });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const slug = normalizeSlug((await params).id);
  // 格式不合法（含保留字）連 DB 都不用查。
  const link = validateSlug(slug) ? null : await getLink(slug);
  if (!link) return html(renderNotFoundPage(authConfig.portalUrl), 404);

  const bot = isBot(req.headers.get("user-agent"));

  // 記錄失敗不能擋跳轉：DB 掛了也要讓訪客過去，只是少一筆點擊記錄。
  let clickId: string | null = null;
  try {
    clickId = (await recordClick(link.id, clickFromHeaders(req.headers), bot)).id;
  } catch (e) {
    console.error("[url] recordClick failed", e);
  }

  if (bot) {
    return NextResponse.redirect(link.target, { status: 302, headers: { "cache-control": "no-store" } });
  }
  if (!isLive(link)) return html(renderGonePage(), 410);
  // 沒有 Click 列可讓跳轉頁的 beacon 補資料，直接 302，不經過跳轉頁。
  if (clickId === null) {
    return NextResponse.redirect(link.target, { status: 302, headers: { "cache-control": "no-store" } });
  }
  return html(renderRedirectPage({ target: link.target, clickId }), 200);
}
