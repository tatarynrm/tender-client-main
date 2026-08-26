// app/log/layout.tsx
import { redirect } from "next/navigation";
import LogShell from "@/features/log/LogShell";

import { getProfile } from "@/shared/server/getProfile";
import { ModalProvider } from "@/shared/components/modal-provider/ModalProvider";
import { RestTimerTracker } from "@/shared/components/Modals/GlobalModals/Trackers/RestTimerTracker";
import { CRMSocketActionProvider } from "@/shared/providers/SocketActionsProviders/CRMSocketActionProvider";
import { PhoneRequiredTracker } from "@/features/log/profile/PhoneRequiredTracker";

export default async function LogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();


  if (!profile) redirect("/auth/login");
  if (profile.is_blocked) redirect("/blocked");
  if (!profile.role.is_ict) redirect("/dashboard");

  return (

    <LogShell profile={profile}>
      <CRMSocketActionProvider>
        <ModalProvider />
        <RestTimerTracker />
        <PhoneRequiredTracker profile={profile} />
        {children}
      </CRMSocketActionProvider>
    </LogShell>

  );
}
