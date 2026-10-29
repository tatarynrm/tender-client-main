import ManagersTenderSearchPage from "@/features/log/tender/ManagersTenderSearchPage";
import { Metadata } from "next";

// Визначення метаданих на сервері
export const metadata: Metadata = {
  title: "Пошук тендерів",
  description: "Пошук тендерів за ключовими параметрами",
};

export default function TenderSearchServerPage() {
  return <ManagersTenderSearchPage />;
}
