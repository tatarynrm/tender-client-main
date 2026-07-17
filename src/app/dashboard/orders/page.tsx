import OrdersPage from "@/features/dashboard/orders/OrdersPage";
import { getProfile } from "@/shared/server/getProfile";
import { redirect } from "next/navigation";


export const metadata = {
  title: "Замовлення | ICT Dashboard",
};

export default async function Page() {
  const profile = await getProfile();

  if (!profile) {
    return redirect("/auth/login");
  }

  return <OrdersPage profile={profile} />;
}
