"use client";

import React, { useState } from "react";
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
  icon?: React.ReactNode;
  size?: number | string;
  className?: string;
}

export function MyTooltip({
  text,
  important,
  icon,
  size = 12,
  className,
}: CustomTooltipProps) {
  // Додаємо стан для контролю відкриття
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Tooltip 
      delayDuration={300} 
      open={isOpen} 
      onOpenChange={setIsOpen}
    >
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center justify-center cursor-pointer transition-colors outline-none",
            important
              ? "text-red-500 hover:text-red-600"
              : "text-gray-400 hover:text-gray-600",
            className,
          )}
          style={{ width: size, height: size }}
          // Обробка кліку для мобільних пристроїв
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          // Закриття при відведенні курсора (для десктопа)
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {icon || <FiHelpCircle style={{ width: "100%", height: "100%" }} />}
        </span>
      </TooltipTrigger>
      <TooltipContent 
        className="bg-gray-800 text-white text-sm p-3 rounded-lg shadow-lg max-w-xs md:max-w-sm animate-in fade-in zoom-in duration-200"
        // Щоб тултіп не закривався одразу при кліку на нього (опційно)
        onPointerDownOutside={() => setIsOpen(false)}
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}