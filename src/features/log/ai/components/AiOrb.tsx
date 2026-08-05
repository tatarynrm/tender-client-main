"use client";

import { cn } from "@/shared/utils/index";

interface Props {
  /** Розмір у px. */
  size?: number;
  /** Модель зараз працює — орб пульсує й обертається швидше. */
  active?: boolean;
  className?: string;
}

export function AiOrb({ size = 32, active = false, className }: Props) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Зовнішнє розмите свічення — «атмосфера планети» */}
      <span
        className={cn(
          "absolute -inset-1 rounded-full blur-lg transition-opacity duration-700",
          "bg-gradient-to-br from-violet-500 via-fuchsia-400 to-pink-500",
          active ? "opacity-80" : "opacity-35",
        )}
      />

      {/* Обертовий контур — «кільця» */}
      <span
        className={cn(
          "absolute -inset-[2px] rounded-full opacity-90",
          "bg-[conic-gradient(from_0deg,transparent_0deg,var(--ai-orb-ring)_100deg,transparent_220deg)]",
          active
            ? "animate-[spin_1.4s_linear_infinite]"
            : "animate-[spin_6s_linear_infinite]",
        )}
        style={{ "--ai-orb-ring": "rgba(196,130,255,0.95)" } as React.CSSProperties}
      />

      {/* Тіло орба */}
      <span className="relative inline-flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-violet-600/90 via-fuchsia-400/90 to-pink-500/90 shadow-inner">
        <span
          className={cn("rounded-full bg-white/90", active && "animate-pulse")}
          style={{ width: size * 0.22, height: size * 0.22 }}
        />
      </span>
    </span>
  );
}
