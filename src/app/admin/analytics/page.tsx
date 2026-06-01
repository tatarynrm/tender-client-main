import { redirect } from "next/navigation";
import { getProfile } from "@/shared/server/getProfile";
import { CompanyAnalyticsDashboard } from "@/features/admin/analytics/components/CompanyAnalyticsDashboard";

export default async function AnalyticsPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  // Ensure the user is associated with a company
  if (!profile.id_company) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-md">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Аналітика недоступна
          </h2>
          <p className="text-zinc-500">
            Ваш акаунт не прив'язаний до жодної компанії, тому ми не можемо відобразити статистику.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Розумна Аналітика
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Детальна статистика дій та інсайти по вашій компанії.
        </p>
      </div>

      <CompanyAnalyticsDashboard companyId={Number(profile.id_company)} />
    </div>
  );
}
