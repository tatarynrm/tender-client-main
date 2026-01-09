import ClientsTenderPage from "@/features/dashboard/tender/ClientsTenderPage";
import { Metadata } from "next";

// Визначення метаданих на сервері
export const metadata: Metadata = {
  title: "Тендери | Назва вашої компанії",
  description: "Перегляд актуальних логістичних тендерів та пропозицій",
};

export default function TenderServerPage() {
  return <ClientsTenderPage />;
}
