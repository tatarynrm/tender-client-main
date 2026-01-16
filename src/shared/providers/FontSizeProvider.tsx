"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type FontSizeKey = "xs" | "sm" | "base" | "lg";

interface FontSizeConfig {
  label: string;
  main: string;
  title: string;
  icon: number;
}

interface FontSizeContextType {
  size: FontSizeKey;
  updateSize: (size: FontSizeKey) => void;
  config: FontSizeConfig;
}

// Оновлені конфігурації з більшими шрифтами
const fontConfigs: Record<FontSizeKey, FontSizeConfig> = {
  xs: {
    label: "text-xs", // 12px
    main: "text-sm", // 14px
    title: "text-base", // 16px
    icon: 14,
  },
  sm: {
    label: "text-sm", // 14px
    main: "text-base", // 16px
    title: "text-lg", // 18px
    icon: 16,
  },
  base: {
    label: "text-base", // 16px
    main: "text-lg", // 18px
    title: "text-xl", // 20px
    icon: 20,
  },
  lg: {
    label: "text-lg", // 18px
    main: "text-xl", // 20px
    title: "text-2xl", // 24px
    icon: 24,
  },
};

const FontSizeContext = createContext<FontSizeContextType | undefined>(
  undefined
);

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  // Змінюємо дефолтний розмір на "base" (середній), щоб не було занадто мало
  const [size, setSize] = useState<FontSizeKey>("base");
  const [isMounted, setIsMounted] = useState(false);

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
