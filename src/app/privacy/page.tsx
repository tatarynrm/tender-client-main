import { Metadata } from "next";
import { PrivacyPolicy } from "@/features/legal/components/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Політика конфіденційності | ICT Tender",
  description:
    "Як Платформа ICT Tender збирає, використовує та захищає персональні дані користувачів.",
};

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
