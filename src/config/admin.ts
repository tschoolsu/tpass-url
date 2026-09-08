// 授權：只讀 permissions claim。role !== "default" 即後台管理員。
import "server-only";
import type { TPassClaims } from "tpass-auth-js";
import { tpass } from "@/config/auth";

export function isAdmin(session: TPassClaims | null | undefined): boolean {
  if (!session) return false;
  return tpass.permOf(session).role !== "default";
}
