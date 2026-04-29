import { Metadata } from "next";
import Link from "next/link";
import LoadListComponent from "@/features/log/load/LoadListComponent";

// Визначаємо метадані для сторінки
export const metadata: Metadata = {
  title: "Логістика | Список вантажів",
  description:
    "Керування списком вантажів, моніторинг статусів та логістичних операцій у системі CRM.",
  keywords: [
    "вантажі",
    "логістика",
    "CRM",
    "керування вантажами",
    "транспортування",
  ],
};

const ClosedOverlay = () => (
  <div className="absolute inset-0 z-[50] flex items-start justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-md rounded-3xl pt-32 pb-8">
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-lg w-full mx-4 border border-zinc-200 dark:border-white/10 text-center animate-in zoom-in-95 duration-300">
      <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
        Увага!
      </h2>
      <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
        За вказівкою директора даний профіль поки закривається і всі переходять
        на гру в тендер!
      </p>
      <Link
        href="/log/tender/active"
        className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-teal-500/30"
      >
        Перейти до тендерів
      </Link>
    </div>
  </div>
);

const CrmLoadActivePage = () => {
  return (
    <div className="relative min-h-[600px] h-full rounded-3xl overflow-hidden">
      <ClosedOverlay />
      <LoadListComponent active={true} />
    </div>
  );
};

export default CrmLoadActivePage;
