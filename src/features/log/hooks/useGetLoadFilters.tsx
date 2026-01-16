"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { useSockets } from "@/shared/providers/SocketProvider";

import { ITender } from "@/features/log/types/tender.type";
import { loadService } from "../services/load.service";
import { Dropdowns } from "../types/load.type";

export const useGetLoadFilters = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const { tender } = useSockets(); // якщо у тебе для load той самий socket namespace

  // 🔹 стабільні params
  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    return p;
  }, [search, status]);

  const {
    data: loadFilters,
    isLoading,
    error,
  } = useQuery<Dropdowns>({
    queryKey: ["loads filters", search, status],
    queryFn: () => loadService.getLoadFilters(),
    staleTime: 1000 * 60,
  });

  // 🔹 Socket-оновлення
  useEffect(() => {
    if (!profile?.id) return;

    const handleNewLoad = () => {
      queryClient.invalidateQueries({ queryKey: ["loads"] });
    };

    const handleNewBid = (updatedTender: ITender) => {
      queryClient.setQueryData<ITender[]>(
        ["loads", search, status],
        (old = []) =>
          old.map((t) => (t.id === updatedTender.id ? updatedTender : t))
      );

      queryClient.setQueryData(["tender", updatedTender.id], updatedTender);
    };

    tender?.on("new_load", handleNewLoad);
    tender?.on("new_bid", handleNewBid);

    return () => {
      tender?.off("new_load", handleNewLoad);
      tender?.off("new_bid", handleNewBid);
    };
  }, [profile?.id, queryClient, search, status, tender]);

  return { loadFilters, isLoading, error };
};
