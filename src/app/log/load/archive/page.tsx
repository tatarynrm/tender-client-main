import { Metadata } from "next";
import LoadListComponent from "@/features/log/load/LoadListComponent";

// Визначаємо метадані для сторінки
export const metadata: Metadata = {
  title: "Логістика | Архів вантажів",
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

const CrmLoadArchivePage = () => {
  return (
    <div className="relative min-h-[600px] h-full rounded-3xl overflow-hidden">
      <LoadListComponent archive={true} />
    </div>
  );
};

export default CrmLoadArchivePage;
