import { Suspense } from "react";
import { Metadata } from "next";
import TrainingPage from "@/features/log/training/TrainingPage";
import { getProfile } from "@/shared/server/getProfile";

export const metadata: Metadata = {
  title: "Навчання",
  description: "Навчальні відеоуроки для менеджерів ICT",
};

export default async function TrainingServerPage() {
  // Доступ до /log уже перевірив layout; тут беремо роль і підпис для водяного знака.
  const profile = await getProfile();
  const person = profile?.person;
  const viewerLabel = [person?.surname, person?.name, profile?.email]
    .filter(Boolean)
    .join(" · ");

  return (
    <Suspense>
      <TrainingPage isAdmin={!!profile?.role?.is_admin} viewerLabel={viewerLabel} />
    </Suspense>
  );
}
