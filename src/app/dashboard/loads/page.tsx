import CarrierLoadsPage from "@/features/dashboard/loads/CarrierLoadsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Екран заявок",
  description: "Актуальні заявки на перевезення від ICT",
};

export default function CarrierLoadsServerPage() {
  return <CarrierLoadsPage />;
}
