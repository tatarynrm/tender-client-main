"use client";
import { useParams } from "next/navigation";
import LoadForm from "@/features/log/load/LoadForm";
import Loading from "@/shared/components/ui/Loading";
import { useLoadById } from "@/features/log/hooks/useLoads";
import { useUserById } from "@/features/admin/hooks/useAdminUsers";
import CreateUserForm from "@/features/admin/users/components/CreateUserForm";

export default function EditCargoPage() {
  const { id } = useParams();

  // 1. Extract status helpers directly from your hook
  const { data, isLoading, isError } = useUserById(id as string);
  console.log(data, "DATA");

  // 2. Handle the loading state
  if (isLoading) {
    return <Loading />;
  }

  // 3. Handle errors or missing data
  if (isError || !data) {
    return <div>Користувача не знайдено</div>;
  }

  // 4. Render the form once data is ready
  return <CreateUserForm defaultValues={data} />;
}
