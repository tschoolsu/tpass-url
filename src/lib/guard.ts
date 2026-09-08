// server action / route handler 用的守門。頁面層由 admin/layout.tsx 處理 UI。
import "server-only";
import { redirect } from "next/navigation";
import type { TPassClaims } from "tpass-auth-js";
import { tpass, loginUrlFor, deniedUrlFor } from "@/config/auth";
import { isAdmin } from "@/config/admin";

export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}

export async function requireAdmin(returnPath = "/admin"): Promise<TPassClaims> {
  const session = await tpass.getSession();
  if (!session) redirect(loginUrlFor(returnPath));
  if (!tpass.permOf(session).read) redirect(deniedUrlFor());
  if (!isAdmin(session)) throw new ForbiddenError();
  return session;
}
