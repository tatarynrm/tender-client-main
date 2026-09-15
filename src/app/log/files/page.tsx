import { Suspense } from "react";
import { Metadata } from "next";
import DocumentsPage from "@/features/log/documents/DocumentsPage";
import { getProfile } from "@/shared/server/getProfile";

export const metadata: Metadata = {
  title: "Документи",
  description: "Установчі документи, реквізити та інші файли ICT",
};

export default async function DocumentsServerPage() {
  // Доступ до /log уже перевірив layout; тут потрібна лише роль адміністратора.
  const profile = await getProfile();

  return (
    <Suspense>
      <DocumentsPage isAdmin={!!profile?.role?.is_admin} />
    </Suspense>
  );
}
