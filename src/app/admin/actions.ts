"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/guard";
import { normalizeSlug, validateSlug, generateSlug, validateTarget } from "@/lib/slug";
import { createLink, updateLink, deleteLink, getLink } from "@/lib/links";
import { fromLocalInput } from "@/lib/format";

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
    await createLink({ id, target, title, expiresAt, enabled, createdBy: session.sub });
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
