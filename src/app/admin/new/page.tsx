import { authConfig } from "@/config/auth";
import { LinkForm } from "@/components/admin/LinkForm";

export default function NewLinkPage() {
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
