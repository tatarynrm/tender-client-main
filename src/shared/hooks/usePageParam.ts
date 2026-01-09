"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";

export function usePageParam(defaultPage = 1) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get("page") ?? defaultPage);

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newPage));
      router.push(`?${params.toString()}`);
    },
    [searchParams.toString()]
  );

  return { page, setPage };
}
