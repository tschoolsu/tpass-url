<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

共通規則（auth、UI、指令、DB 紅線）見 ../AGENTS.md，先讀它。

# tpass-url（T-URL 短網址）

`url.tschoolsu.org/<slug>` 先落一頁極輕跳轉頁蒐集點擊者資訊（IP、Cloudflare 地理、UA、螢幕、時區…）再導去目標網址；
管理員在 `/admin` 建連結、看點擊明細、下載 QR。本服務設計規格見 `tpass-ops/docs/specs/2026-09-08-tpass-url-design.md`。

## 鐵律

- 測試：`pnpm test`。
- 路由權限：`/[id]`（跳轉）與 `/api/click/[clickId]`（beacon）是**匿名公開端點**，任何人都能打；
  `/admin/**` 全部要靠 auth 的 `url` 服務 role 守門，每個 server action / route handler 都要重呼 guard，
  不能只靠 layout 擋。
