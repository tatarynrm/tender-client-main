import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useUrlFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateUrl = useCallback((newParams: Record<string, any>, options = { scroll: false }) => {
    const params = new URLSearchParams();

    // Копіюємо існуючі параметри, якщо потрібно (або створюємо нові з нуля)
    Object.entries(newParams).forEach(([key, value]) => {
      // Ігноруємо системні технічні пропси
      if (key === "active" || key === "archive") return;

      if (value !== undefined && value !== null && value !== "") {
        params.set(key, Array.isArray(value) ? value.join(",") : String(value));
      }
    });

    router.push(`?${params.toString()}`, options);
  }, [router]);

  const removeFilter = useCallback((key: string, valueToRemove: string, currentParams: any) => {
    const currentValue = String(currentParams[key] || "");
    
    let newValue = valueToRemove === "all"
      ? undefined
      : currentValue
          .split(",")
          .filter((v) => v !== valueToRemove)
          .join(",") || undefined;

    const newFilters = { ...currentParams, [key]: newValue, page: 1 };
    updateUrl(newFilters);
  }, [updateUrl]);

  const resetFilters = useCallback(() => {
    router.push(window.location.pathname, { scroll: false });
  }, [router]);

  return { updateUrl, removeFilter, resetFilters, searchParams };
}