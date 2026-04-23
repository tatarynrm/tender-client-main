import ManagersTenderFullPage from "@/features/log/tender/ManagersTenderFullPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ManagersTenderFullPage tenderId={Number(resolvedParams.id)} />;
}
