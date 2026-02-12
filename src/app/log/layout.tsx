// app/log/layout.tsx
import { redirect } from "next/navigation";
import LogShell from "@/features/log/LogShell";
import { AuthCheckProvider } from "@/shared/providers/AuthCheckProvider";
import { getProfile } from "@/shared/server/getProfile";
import { ModalProvider } from "@/shared/providers/GlobalModalProvider";
import { RestTimerTracker } from "@/shared/components/Modals/GlobalModals/Trackers/RestTimerTracker";
import { UpdatesIntroModal } from "@/shared/components/Modals/SystemModals/UpdatesIntroModal";
import { CRMSocketActionProvider } from "@/shared/providers/SocketActionsProviders/CRMSocketActionProvider";

export default async function LogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  // console.log(profile, "PROFILE ------------------");

  if (!profile) redirect("/auth/login");
  if (profile.is_blocked) redirect("/blocked");
  if (!profile.role.is_ict) redirect("/dashboard");

  return (
    // <AuthCheckProvider profile={profile}>
    <LogShell profile={profile}>
      <CRMSocketActionProvider>
        <ModalProvider>
          <RestTimerTracker />

          {children}
        </ModalProvider>
      </CRMSocketActionProvider>
    </LogShell>
    // </AuthCheckProvider>
  );
}
