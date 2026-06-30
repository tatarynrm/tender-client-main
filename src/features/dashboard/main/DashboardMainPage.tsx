"use client";
import React from "react";
import { HeaderWidgetContainer } from "@/features/log/main/widgets/HeaderWidgetContainer";
import { CarrierDashboard } from "./CarrierDashboard";

export default function DashboardContainer() {
  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <HeaderWidgetContainer />
      <CarrierDashboard />
    </div>
  );
}
