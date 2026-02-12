// app/admin/layout.tsx

import { redirect } from "next/navigation";
import AdminShell from "@/features/admin/AdminShell";
import { getProfile } from "@/shared/server/getProfile";
import { AuthCheckProvider } from "@/shared/providers/AuthCheckProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  // --- 🔒 Перевірки доступу ---
  if (!profile) redirect("/auth/login");
  if (profile.is_blocked) redirect("/blocked");

  // 👷‍♂️ Працівник ICT → редірект у log
  if (profile.role.is_ict && !profile.role.is_admin) redirect("/log");

  // 👤 Клієнт → редірект у dashboard
  if (!profile.role.is_ict && !profile.role.is_admin) redirect("/dashboard");
// DDD
  // 👑 Адмін → допускаємо
  return (
    <AuthCheckProvider profile={profile}>
      <AdminShell profile={profile}>{children}</AdminShell>
    </AuthCheckProvider>
  );
}
