# T-URL 短網址

`url.tschoolsu.org/<slug>` → 先落一頁極輕 HTML 蒐集點擊者資訊（IP、Cloudflare 地理、UA、螢幕、時區…）→ 跳轉。
管理員在 `/admin` 建連結、看點擊明細、下載 QR。只有管理員能用（auth `/admin` 給 `url` 服務的 role）。

設計：`tpass-ops/docs/specs/2026-09-08-tpass-url-design.md`。

## 本機

```bash
pnpm install
cp .env.example .env.local        # 值照 example 即可
psql -d postgres -c "CREATE ROLE t_url LOGIN PASSWORD 't_url';" -c "CREATE DATABASE t_url OWNER t_url;"
pnpm exec prisma migrate dev
pnpm dev                          # https://url.lvh.me:3007
```

憑證 SAN 要含 `url.lvh.me`；本機 auth 的白名單來自 `../tpass-registry/services.json`，要有 `url` 那筆。

檢查：`pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm build`。

## 上線（人做）

1. `tpass-registry` 合併 `url` 那筆。
2. Cloudflare DNS `url` 灰雲 → 主機 `certbot certonly --nginx -d url.tschoolsu.org` → nginx server block（照其他服務，反代 `127.0.0.1:3007`）→ 切橘雲。
3. Cloudflare → Rules → Settings → Managed Transforms → 開 **Add visitor location headers**（城市／經緯度／時區靠它；沒開只有國家）。
4. 主機 root：`CREATE ROLE t_url LOGIN PASSWORD '<強密碼>'; CREATE DATABASE t_url OWNER t_url;`
5. 主機 service：clone 到 `/home/service/tpass-url`、寫 `.env.local`（`URL_SELF_URL=https://url.tschoolsu.org`、正式 auth 網址、`DATABASE_URL`）、`pnpm install --frozen-lockfile`、`pnpm exec prisma migrate deploy`、`pnpm build`、`pm2 start ecosystem.config.js && pm2 save`。
6. auth `/admin` 給要用的人 `url` 的 role。
7. registry 翻 `deployed: true`。

## 蒐集了什麼

Server 層：IP、國家／城市／行政區／郵遞區號／經緯度／時區（Cloudflare header）、UA 與解析後的瀏覽器／OS／裝置、Referer、Accept-Language。
JS 層（beacon 一次性補入）：螢幕與視窗尺寸、DPR、色深、瀏覽器時區、語言清單、平台、觸控、CPU 核心、記憶體、連線型態。
爬蟲（LINE／Discord／FB 預覽等）直接 302 並標 `isBot`。無保留期限。
