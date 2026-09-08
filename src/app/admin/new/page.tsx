import { authConfig } from "@/config/auth";
import { LinkForm } from "@/components/admin/LinkForm";
import { requireAdmin } from "@/lib/guard";

export default async function NewLinkPage() {
  await requireAdmin();
  return (
    <div className="max-w-2xl">
      <h1 className="font-extrabold text-2xl tracking-tight mb-6">新增短網址</h1>
      <LinkForm
        shortBase={authConfig.selfUrl}
        initial={{ target: "", title: "", enabled: true, expiresAt: "" }}
      />
    </div>
  );
}
