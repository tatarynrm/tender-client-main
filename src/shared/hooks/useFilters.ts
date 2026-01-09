// shared/hooks/useFilters.ts

export type Filters = Record<string, string | number | boolean | undefined>;

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { parseFilters, serializeFilters } from "../helpers/parseFilters";

export function useFilters<T extends Filters>(defaults: T) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL → object
  const appliedFilters = useMemo(
    () => parseFilters(searchParams, defaults),
    [searchParams.toString()]
  );

  // draft state
  const [filters, setFilters] = useState<T>(appliedFilters);

  // back / forward support
  useEffect(() => {
    setFilters(appliedFilters);
  }, [appliedFilters]);

  function apply() {
    const params = serializeFilters(filters);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function reset() {
    setFilters(defaults);
    router.push("?", { scroll: false });
  }

  // 👇 для сервера
  const queryString = useMemo(
    () => serializeFilters(appliedFilters).toString(),
    [appliedFilters]
  );

  return {
    filters, // draft (UI)
    appliedFilters, // from URL (for queries)
    setFilters,
    apply,
    reset,
    queryString, // ?a=b&c=d
  };
}
