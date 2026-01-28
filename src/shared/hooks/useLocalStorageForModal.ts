"use client";

import { useState, useEffect } from "react";

export function useLocalStorageState<T extends Record<string, any>>(
  key: string,
  initialValue: T
) {
  // Стан для зберігання значень
  const [state, setState] = useState<T>(initialValue);

  // При завантаженні зчитуємо дані з localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setState(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error reading localStorage", error);
    }
  }, [key]);

  // Функція для оновлення конкретного ключа в об'єкті
  const setKeyValue = (itemKey: keyof T, value: any) => {
    const newState = { ...state, [itemKey]: value };
    setState(newState);
    localStorage.setItem(key, JSON.stringify(newState));
  };

  return [state, setKeyValue] as const;
}