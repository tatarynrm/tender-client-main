import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ict-docs-favorites";

/** «Обране» — персональна зручність кожного менеджера, живе в localStorage браузера. */
export const useDocFavorites = () => {
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) setIds(new Set(saved));
    } catch {
      // приватний режим / зіпсоване значення — просто без обраного
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // ігноруємо
      }
      return next;
    });
  }, []);

  return { favoriteIds: ids, isFavorite: (id: string) => ids.has(id), toggleFavorite: toggle };
};
