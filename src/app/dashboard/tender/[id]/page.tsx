import TenderFullPage from "@/features/dashboard/tender/TenderFullPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const tenderId = parseInt(resolvedParams.id, 10);

  if (isNaN(tenderId)) {
    return <div>Invalid tender ID</div>;
  }

  return (
    <div className="min-h-screen w-full bg-[#f4f7fa] dark:bg-[#0c0c0e] p-5 lg:p-10 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        <TenderFullPage tenderId={tenderId} />
      </div>
    </div>
  );
}
