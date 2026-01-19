"use client";

import React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/components/ui/tooltip";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { FiHelpCircle } from "react-icons/fi";
import { cn } from "@/shared/utils";

interface CustomTooltipProps {
  text: string;
  important?: boolean;
  /** Опційна іконка. Якщо не передано — буде FiHelpCircle */
  icon?: React.ReactNode;
  /** Розмір у пікселях або рядок Tailwind (наприклад, 14 або "1rem") */
  size?: number | string;
  /** Додаткові класи для стилізації іконки/контейнера */
  className?: string;
}

export function MyTooltip({ 
  text, 
  important, 
  icon, 
  size = 12, // за замовчуванням w-3 h-3
  className 
}: CustomTooltipProps) {
  const { profile } = useAuth();

  // if (profile?.is_manager) return null;

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <span 
          className={cn(
            "inline-flex items-center justify-center cursor-pointer transition-colors",
            important ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-gray-600",
            className
          )}
          style={{ width: size, height: size }}
        >
          {icon || <FiHelpCircle style={{ width: "100%", height: "100%" }} />}
        </span>
      </TooltipTrigger>
      <TooltipContent 
        className="bg-gray-800 text-white text-sm p-3 rounded-lg shadow-lg max-w-xs md:max-w-sm animate-in fade-in zoom-in duration-200"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}