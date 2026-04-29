// app/dashboard/layout.tsx

import { redirect } from "next/navigation";
import DashboardShell from "@/features/dashboard/DashboardShell";
import { getProfile } from "@/shared/server/getProfile";
import { AuthCheckProvider } from "@/shared/providers/AuthCheckProvider";
import { SocketProvider } from "@/shared/providers/SocketProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();


  // --- 🔒 Перевірки доступу ---
  if (!profile) return redirect("/auth/login");
  if (profile.is_blocked) return redirect("/blocked");

  // Менеджер (is_ict, але не admin) не має доступу до dashboard, тільки до log
  if (profile.role.is_ict && !profile.role.is_admin) return redirect("/log");

  // 👤 Клієнт → допускаємо
  return (
    // <AuthCheckProvider profile={profile!!}>
    <DashboardShell profile={profile}>{children}</DashboardShell>
    // </AuthCheckProvider>
  );
}
