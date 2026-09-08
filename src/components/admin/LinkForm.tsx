"use client";

import { useActionState, useState } from "react";
import { Button, Card, Input, Label, Switch } from "tpass-ui";
import { saveLinkAction, type FormState } from "@/app/admin/actions";

export interface LinkFormValues {
  id?: string;
  target: string;
  title: string;
  enabled: boolean;
  expiresAt: string; // datetime-local 格式
}

const EMPTY: FormState = { errors: {} };

export function LinkForm({ initial, shortBase }: { initial: LinkFormValues; shortBase: string }) {
  const [state, action, pending] = useActionState(saveLinkAction, EMPTY);
  const [enabled, setEnabled] = useState(initial.enabled);
  const editing = Boolean(initial.id);

  return (
    <Card className="p-6">
      <form action={action} className="flex flex-col gap-5">
        {editing && <input type="hidden" name="editing" value={initial.id} />}

        <div>
          <Label htmlFor="slug">短網址</Label>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{shortBase}/</span>
            <Input
              id="slug"
              name="slug"
              defaultValue={initial.id ?? ""}
              disabled={editing}
              placeholder="留白自動產生 6 碼"
              autoComplete="off"
            />
          </div>
          {state.errors.slug && <p className="mt-1 text-sm font-bold text-destructive">{state.errors.slug}</p>}
        </div>

        <div>
          <Label htmlFor="target">目標網址</Label>
          <Input id="target" name="target" type="url" required defaultValue={initial.target} placeholder="https://" />
          {state.errors.target && <p className="mt-1 text-sm font-bold text-destructive">{state.errors.target}</p>}
        </div>

        <div>
          <Label htmlFor="title">標題（選填）</Label>
          <Input id="title" name="title" defaultValue={initial.title} maxLength={100} />
          {state.errors.title && <p className="mt-1 text-sm font-bold text-destructive">{state.errors.title}</p>}
        </div>

        <div>
          <Label htmlFor="expiresAt">到期時間（選填，台北時間）</Label>
          <Input id="expiresAt" name="expiresAt" type="datetime-local" defaultValue={initial.expiresAt} />
          {state.errors.expiresAt && (
            <p className="mt-1 text-sm font-bold text-destructive">{state.errors.expiresAt}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={enabled} onChange={setEnabled} label="啟用" />
          <input type="hidden" name="enabled" value={enabled ? "on" : ""} />
        </div>

        {state.message && <p className="text-sm font-bold text-destructive">{state.message}</p>}

        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "儲存中…" : editing ? "儲存" : "建立"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
