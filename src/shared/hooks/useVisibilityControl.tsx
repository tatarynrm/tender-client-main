"use client";

import { useState, useEffect } from "react";

export const useVisibilityControl = (storageKey: string, initialValue: boolean = true) => {
  const fullKey = `view_visible_${storageKey}`;

  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(fullKey);
      return saved !== null ? JSON.parse(saved) : initialValue;
    }
    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(fullKey, JSON.stringify(isVisible));
  }, [isVisible, fullKey]);

  return { isVisible, toggle: () => setIsVisible(!isVisible) };
};