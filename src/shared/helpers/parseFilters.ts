import { Filters } from "../hooks/useFilters";

export function parseFilters<T extends Filters>(
  searchParams: URLSearchParams,
  defaults: T
): T {
  const result = { ...defaults } as Record<keyof T, any>;

  (Object.keys(defaults) as (keyof T)[]).forEach((key) => {
    const value = searchParams.get(key as string);
    if (value === null || value === "") return;

    const defaultValue = defaults[key];

    if (typeof defaultValue === "number") {
      result[key] = Number(value);
    } else if (typeof defaultValue === "boolean") {
      result[key] = value === "true";
    } else {
      result[key] = value;
    }
  });

  return result as T;
}

export function serializeFilters(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  return params;
}
