"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppButton } from "./AppButton"; // Переконайтеся, що шлях правильний
import { cn } from "@/shared/utils";

interface BackButtonProps {
  className?: string;
  label?: string;
  variant?: "ghost" | "primary" | "secondary" | "outline"; // залежить від ваших buttonVariants
}

export const GoBackButton = ({ 
  className, 
  label = "Повернутись назад", 
  variant = "ghost" 
}: BackButtonProps) => {
  const router = useRouter();

  return (
    <AppButton
      variant={variant as any}
      size="sm"
      leftIcon={<ArrowLeft size={16} />}
      onClick={() => router.back()}
      className={cn(
        "cursor-pointer gap-2 text-teal-500 hover:text-teal-300   transition-colors",
        className
      )}
    >
      {label}
    </AppButton>
  );
};