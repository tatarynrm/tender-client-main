import TenderFullPage from "@/features/dashboard/tender/TenderFullPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const tenderId = parseInt(resolvedParams.id, 10);

  if (isNaN(tenderId)) {
    return <div>Invalid tender ID</div>;
  }

  return (
    <div className="h-screen w-full bg-[#f4f7fa] dark:bg-[#0b0c0d] p-3 lg:p-5 flex flex-col overflow-hidden">
      <TenderFullPage tenderId={tenderId} />
    </div>
  );
}
