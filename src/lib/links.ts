import "server-only";
import { prisma } from "@/lib/db";
import type { Link, Click } from "@/generated/prisma/client";
import type { ServerClickFields } from "@/lib/click-headers";
import type { JsClickFields } from "@/lib/beacon";

export type { Link, Click };

export const PAGE_SIZE = 50;

export function isLive(link: { enabled: boolean; expiresAt: Date | null }, now = new Date()): boolean {
  if (!link.enabled) return false;
  if (link.expiresAt && link.expiresAt <= now) return false;
  return true;
}

export function listLinks() {
  return prisma.link.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { clicks: true } } },
  });
}

export function getLink(id: string) {
  return prisma.link.findUnique({ where: { id } });
}

export function createLink(data: {
  id: string;
  target: string;
  title: string | null;
  expiresAt: Date | null;
  enabled: boolean;
  createdBy: string;
}) {
  return prisma.link.create({ data });
}

export function updateLink(
  id: string,
  data: { target: string; title: string | null; expiresAt: Date | null; enabled: boolean },
) {
  return prisma.link.update({ where: { id }, data });
}

export async function deleteLink(id: string): Promise<void> {
  await prisma.link.delete({ where: { id } });
}

export function recordClick(linkId: string, fields: ServerClickFields, isBot: boolean) {
  return prisma.click.create({ data: { linkId, isBot, ...fields }, select: { id: true } });
}

// 只准補一次：jsAt 已有值就不動。回傳是否真的更新。
export async function completeClick(clickId: string, fields: JsClickFields): Promise<boolean> {
  const r = await prisma.click.updateMany({
    where: { id: clickId, jsAt: null },
    data: { ...fields, jsAt: new Date() },
  });
  return r.count > 0;
}

export async function linkStats(id: string) {
  const [total, bots, uniq] = await Promise.all([
    prisma.click.count({ where: { linkId: id } }),
    prisma.click.count({ where: { linkId: id, isBot: true } }),
    prisma.click.findMany({
      where: { linkId: id, ip: { not: null } },
      distinct: ["ip"],
      select: { ip: true },
    }),
  ]);
  return { total, bots, unique: uniq.length };
}

export async function listClicks(id: string, opts: { page: number; includeBots: boolean }) {
  const where = { linkId: id, ...(opts.includeBots ? {} : { isBot: false }) };
  const page = Math.max(1, opts.page);
  const [rows, total] = await Promise.all([
    prisma.click.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.click.count({ where }),
  ]);
  return { rows, total, pageSize: PAGE_SIZE };
}
