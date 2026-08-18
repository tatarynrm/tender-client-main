import { Metadata } from "next";
import { TermsOfService } from "@/features/legal/components/TermsOfService";

export const metadata: Metadata = {
  title: "Угода користувача | ICT Tender",
  description:
    "Умови користування логістичною тендерною платформою ICT Tender.",
};

export default function TermsPage() {
  return <TermsOfService />;
}
