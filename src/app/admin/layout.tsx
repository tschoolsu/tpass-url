import { redirect } from "next/navigation";
import { tpass, loginUrlFor } from "@/config/auth";
import { isAdmin } from "@/config/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { Forbidden } from "@/components/common/Forbidden";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await tpass.getSession();
  if (!session) redirect(loginUrlFor("/admin"));
  if (!isAdmin(session)) return <Forbidden />;
  return <AdminShell email={session.email}>{children}</AdminShell>;
}
