import TenderFullPage from "@/features/dashboard/tender/TenderFullPage";

export default function Page({ params }: { params: { id: string } }) {
  const tenderId = parseInt(params.id, 10);

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
