"use client";

import { cn } from "@/shared/utils/index";

interface Props {
  /** Розмір у px. */
  size?: number;
  /** Модель зараз працює — орб пульсує й обертається швидше. */
  active?: boolean;
  className?: string;
}

/**
 * Значок помічника. Кольори — синій акцент застосунку, тому орб однаково
 * читається і на світлій, і на темній темі, не вибиваючись із решти LOG.
 */
export function AiOrb({ size = 32, active = false, className }: Props) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Розмите свічення навколо */}
      <span
        className={cn(
          "absolute -inset-1 rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 blur-lg transition-opacity duration-700",
          active ? "opacity-60" : "opacity-25",
        )}
      />

      {/* Обертовий контур */}
      <span
        className={cn(
          "absolute -inset-[2px] rounded-full opacity-80",
          "bg-[conic-gradient(from_0deg,transparent_0deg,var(--ai-orb-ring)_100deg,transparent_220deg)]",
          active
            ? "animate-[spin_1.4s_linear_infinite]"
            : "animate-[spin_6s_linear_infinite]",
        )}
        style={
          { "--ai-orb-ring": "rgba(59,130,246,0.9)" } as React.CSSProperties
        }
      />

      {/* Тіло орба */}
      <span className="relative inline-flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 shadow-inner">
        <span
          className={cn("rounded-full bg-white/95", active && "animate-pulse")}
          style={{ width: size * 0.22, height: size * 0.22 }}
        />
      </span>
    </span>
  );
}
