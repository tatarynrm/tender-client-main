import { Metadata } from "next";
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

const CrmLoadActivePage = () => {
  // Розкоментуйте рядок нижче для тесту
  // throw new Error("Тестова помилка чату");

  return <LoadListComponent archive={true} />;
};

export default CrmLoadActivePage;
