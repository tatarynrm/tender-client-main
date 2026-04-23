"use client";

import { UpdatesPage } from "@/features/dashboard/updates/ui/UpdatesPage";

export default function CarrierUpdatesPage() {
  return (
    <div className="p-4 lg:p-8">
      <UpdatesPage category="carrier" />
    </div>
  );
}
