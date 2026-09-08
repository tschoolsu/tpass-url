"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/guard";
import { normalizeSlug, validateSlug, generateSlug, validateTarget } from "@/lib/slug";
import { createLink, updateLink, deleteLink, getLink } from "@/lib/links";
import { fromLocalInput } from "@/lib/format";
// 只拿 Prisma 命名空間裡的錯誤類別做 P2002 判斷，不是 prisma client 實例——
// 不算違反「actions.ts 不碰 prisma」（該規則管的是單例 client，不是這個型別/錯誤命名空間）。
import { Prisma } from "@/generated/prisma/client";

export interface FormState {
  errors: Record<string, string>;
  message?: string;
}

function field(fd: FormData, name: string): string {
  const v = fd.get(name);
  return typeof v === "string" ? v.trim() : "";
}

// 同一個 action 處理新增與編輯：fd 有 "editing" 就是編輯（slug 不可改）。
export async function saveLinkAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const session = await requireAdmin();
  const editing = field(fd, "editing");
  const target = field(fd, "target");
  const title = field(fd, "title") || null;
  const enabled = fd.get("enabled") === "on";
  const expiresRaw = field(fd, "expiresAt");
  const expiresAt = fromLocalInput(expiresRaw);

  // 被竄改的 hidden editing 欄位可能指向已刪除／不存在的 id；updateLink 會拋 P2025，
  // 在驗證之前先擋掉，回一般的驗證錯誤而不是讓 Next 出通用錯誤頁。
  if (editing && !(await getLink(editing))) {
    return { errors: {}, message: "這個短網址不存在，可能已被刪除。" };
  }

  const errors: Record<string, string> = {};
  const targetErr = validateTarget(target);
  if (targetErr) errors.target = targetErr;
  if (expiresRaw && !expiresAt) errors.expiresAt = "日期格式不對";
  if (title && title.length > 100) errors.title = "標題最長 100 字";

  let id = editing;
  if (!editing) {
    const custom = normalizeSlug(field(fd, "slug"));
    if (custom) {
      const err = validateSlug(custom);
      if (err) errors.slug = err;
      else if (await getLink(custom)) errors.slug = "這個 slug 已經有人用了";
      id = custom;
    } else {
      // 自動產生：撞到就重抽，6 碼撞機率極低，抓 5 次夠了。
      for (let i = 0; i < 5; i++) {
        id = generateSlug();
        if (!(await getLink(id))) break;
      }
    }
  }

  if (Object.keys(errors).length > 0) return { errors, message: "有欄位需要修正。" };

  if (editing) {
    await updateLink(id, { target, title, expiresAt, enabled });
  } else {
    try {
      await createLink({ id, target, title, expiresAt, enabled, createdBy: session.sub });
    } catch (err) {
      // dup-check 到 create 之間有競態：兩人同時搶同一個自訂 slug 時，
      // DB 的唯一鍵（Link.id 是主鍵）會用 P2002 擋下第二筆，這裡轉成一般驗證錯誤。
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return { errors: { slug: "這個 slug 已經有人用了" }, message: "有欄位需要修正。" };
      }
      throw err;
    }
  }
  revalidatePath("/admin");
  redirect(`/admin/${id}`);
}

export async function deleteLinkAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteLink(id);
  revalidatePath("/admin");
  redirect("/admin");
}
