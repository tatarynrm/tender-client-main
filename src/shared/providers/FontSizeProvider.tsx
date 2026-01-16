"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type FontSizeKey = "xs" | "sm" | "base" | "lg";

// Описуємо інтерфейс для конфігурації одного розміру
interface FontSizeConfig {
  label: string;
  main: string;
  title: string;
  icon: number; // Додаємо icon сюди
}

interface FontSizeContextType {
  size: FontSizeKey;
  updateSize: (size: FontSizeKey) => void;
  config: FontSizeConfig; // Використовуємо інтерфейс тут
}

const fontConfigs: Record<FontSizeKey, FontSizeConfig> = {
  xs: {
    label: "text-[7px]",
    main: "text-[9px]",
    title: "text-[10px]",
    icon: 8,
  },
  sm: {
    label: "text-[8px]",
    main: "text-[10px]",
    title: "text-[11px]",
    icon: 10,
  },
  base: {
    label: "text-[9px]",
    main: "text-[12px]",
    title: "text-[13px]",
    icon: 12,
  },
  lg: {
    label: "text-[10px]",
    main: "text-[14px]",
    title: "text-[15px]",
    icon: 14,
  },
};

const FontSizeContext = createContext<FontSizeContextType | undefined>(
  undefined
);

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [size, setSize] = useState<FontSizeKey>("sm");
  const [isMounted, setIsMounted] = useState(false);

  // Завантажуємо з localStorage при монтуванні
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("app-font-size") as FontSizeKey;
    if (saved && fontConfigs[saved]) {
      setSize(saved);
    }
  }, []);

  const updateSize = (newSize: FontSizeKey) => {
    setSize(newSize);
    localStorage.setItem("app-font-size", newSize);
  };

  // Уникаємо проблем з гідратацією (необов'язково, але корисно)
  const contextValue = {
    size,
    updateSize,
    config: fontConfigs[size],
  };

  return (
    <FontSizeContext.Provider value={contextValue}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error("useFontSize must be used within a FontSizeProvider");
  }
  return context;
}
