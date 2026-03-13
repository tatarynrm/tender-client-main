import LoadForm from "@/features/log/load/LoadForm";
import { GoBackButton } from "@/shared/components/Buttons/GoBackButton";
import { Metadata } from "next";

// Визначаємо метадані для сторінки
export const metadata: Metadata = {
  title: "Логістика | Додати вантаж",
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
const CargoActivePage = () => {
  return (
    <div>
      <GoBackButton />
      <LoadForm />
    </div>
  );
};

export default CargoActivePage;
