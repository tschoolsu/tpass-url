"use client";

import { useState, useTransition } from "react";
import { Button, ConfirmDialog } from "tpass-ui";
import { deleteLinkAction } from "@/app/admin/actions";

export function DeleteLinkButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)} disabled={pending}>
        刪除
      </Button>
      <ConfirmDialog
        open={open}
        title="刪除這個短網址？"
        description={`/${id} 與它的所有點擊紀錄會一起刪除，無法復原。`}
        confirmLabel="刪除"
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() => start(() => deleteLinkAction(id))}
      />
    </>
  );
}
