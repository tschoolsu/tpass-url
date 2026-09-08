import { notFound } from "next/navigation";
import { authConfig } from "@/config/auth";
import { getLink } from "@/lib/links";
import { toLocalInput } from "@/lib/format";
import { LinkForm } from "@/components/admin/LinkForm";

export default async function EditLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const link = await getLink(id);
  if (!link) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-extrabold text-2xl tracking-tight mb-6">編輯 /{link.id}</h1>
      <LinkForm
        shortBase={authConfig.selfUrl}
        initial={{
          id: link.id,
          target: link.target,
          title: link.title ?? "",
          enabled: link.enabled,
          expiresAt: toLocalInput(link.expiresAt),
        }}
      />
    </div>
  );
}
