"use client";

import { useQuery } from "@tanstack/react-query";

export interface AirAlertState {
  updatedAt: number;
  regions: Record<string, boolean>;
}

async function fetchAlerts(): Promise<AirAlertState> {
  // Власний same-origin роут — без ключів і без CORS.
  const res = await fetch("/api/air-alert", { cache: "no-store" });
  if (!res.ok) throw new Error("air-alert fetch failed");
  return res.json();
}

/** Опитує стан тривог кожні 30с. */
export function useAirAlerts() {
  return useQuery({
    queryKey: ["air-alert"],
    queryFn: fetchAlerts,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
    staleTime: 15_000,
  });
}
