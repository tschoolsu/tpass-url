// T-URL（consumer）SSO 設定。只讀 env；驗章本體在 tpass-auth-js。
import "server-only";
import { configFromEnv, createTpassNextAuth } from "tpass-auth-js/next";

export const tpass = createTpassNextAuth(configFromEnv("URL_SELF_URL"));

const REQUIRED = ["PORTAL_URL"] as const;
const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`[config/auth] 缺少必填環境變數：${missing.join(", ")}（請檢查 .env.local）`);
}

export function loginUrlFor(returnPath = "/admin"): string {
  return tpass.loginUrl(returnPath);
}

export function deniedUrlFor(): string {
  return tpass.deniedUrl();
}

export const authConfig = {
  logoutUrl: tpass.logoutUrl,
  selfUrl: tpass.selfUrl,
  serviceId: tpass.serviceId,
  portalUrl: process.env.PORTAL_URL!,
} as const;
