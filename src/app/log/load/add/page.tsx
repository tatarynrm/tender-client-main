import LoadForm from "@/features/log/load/LoadForm";
import { GoBackButton } from "@/shared/components/Buttons/GoBackButton";
import React from "react";

const CargoActivePage = () => {
  return (
    <div>
      <GoBackButton/>
      <LoadForm />
    </div>
  );
};

export default CargoActivePage;
