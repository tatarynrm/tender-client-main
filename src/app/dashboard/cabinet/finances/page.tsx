import React, { Suspense } from "react";
import { CarrierFinances } from "@/features/dashboard/cabinet/finance/CarrierFinances";

const FinancesPage = () => {
  return (
    <div className="flex flex-col w-full h-full">
      <Suspense fallback={null}>
        <CarrierFinances />
      </Suspense>
    </div>
  );
};

export default FinancesPage;
