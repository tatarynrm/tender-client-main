// app/pay/page.tsx
import { fetchServer } from "@/shared/server/fetchServer";
import { IUserProfile } from "@/shared/types/user.types";
import React from "react";

const PayPage = async () => {
  const user = await fetchServer.get<IUserProfile>("/auth/me");

if (!user) {
  return null
}
  return (
    <div>

    </div>
  );
};

export default PayPage;
