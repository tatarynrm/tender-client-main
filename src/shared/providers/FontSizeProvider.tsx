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

// Використовуємо inline-style або класи Tailwind, але значення тепер в rem
// 1rem зазвичай = 16px
const fontConfigs: Record<FontSizeKey, FontSizeConfig> = {
  xs: {
    label: "text-[0.7rem]", // ~11px
    main: "text-[0.8rem]", // ~13px
    title: "text-[0.95rem]", // ~15px
    icon: 14,
  },
  sm: {
    label: "text-[0.875rem]", // 14px (стандарт)
    main: "text-[1rem]", // 16px
    title: "text-[1.125rem]", // 18px
    icon: 16,
  },
  base: {
    label: "text-[1rem]", // 16px
    main: "text-[1.125rem]", // 18px
    title: "text-[1.25rem]", // 20px
    icon: 20,
  },
  lg: {
    label: "text-[1.125rem]", // 18px
    main: "text-[1.25rem]", // 20px
    title: "text-[1.5rem]", // 24px
    icon: 24,
  },
};

const FontSizeContext = createContext<FontSizeContextType | undefined>(
  undefined,
);

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [size, setSize] = useState<FontSizeKey>("xs");
  // Запобігаємо помилкам гідратації (коли серверний і клієнтський HTML не збігаються)
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

    // Опціонально: змінюємо базовий rem для всього документа
    // document.documentElement.style.fontSize = newSize === 'lg' ? '110%' : '100%';
  };

  const contextValue = {
    size,
    updateSize,
    config: fontConfigs[size],
  };

  // Поки клієнт не завантажився, рендеримо контент з дефолтним розміром,
  // щоб уникнути помилок Next.js
  if (!isMounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

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
