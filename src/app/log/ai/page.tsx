import LocalAiChat from "@/features/log/ai/LocalAiChat";
import { canUseLocalAi } from "@/shared/constants/local-ai";
import { getProfile } from "@/shared/server/getProfile";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "AI помічник",
  description:
    "AI-помічник ICT: тендери, ставки, заявки та звіти по базі в діалозі",
};

export default async function LocalAiPage() {
  const profile = await getProfile();

  // Помічник поки персональний. Без цієї перевірки сторінка відкрилася б будь-кому
  // з LOG і показала б порожній екран із 403 на кожен запит.
  if (!canUseLocalAi(profile?.email)) redirect("/log");

  return <LocalAiChat />;
}
