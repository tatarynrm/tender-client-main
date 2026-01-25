"use client";
import { useParams } from "next/navigation";
import LoadForm from "@/features/log/load/LoadForm";
import Loading from "@/shared/components/ui/Loading";
import { useLoadById } from "@/features/log/hooks/useLoads";

export default function EditCargoPage() {
  const { id } = useParams();
  
  // 1. Extract status helpers directly from your hook
  const { data, isLoading, isError } = useLoadById(id as string);

  // 2. Handle the loading state
  if (isLoading) {
    return <Loading />;
  }

  // 3. Handle errors or missing data
  if (isError || !data) {
    return <div>Заявку не знайдено</div>;
  }

  // 4. Render the form once data is ready
  return <LoadForm defaultValues={data} />;
}