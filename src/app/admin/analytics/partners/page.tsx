import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile } from "@/shared/server/getProfile";
import { PartnersActivityReport } from "@/features/admin/analytics/components/PartnersActivityReport";

export const metadata: Metadata = {
  title: "Активність партнерів",
  description:
    "Звіт про входи компаній-партнерів (зовнішні admin/manager) за період.",
};

export default async function PartnersActivityPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  if (!profile.role?.is_admin) {
    redirect("/");
  }

  return <PartnersActivityReport />;
}
