import { cn } from "@/shared/utils";

interface QuickFilterBtnProps {
  label: string;
  count?: number;
  countFilter?: number;
  isActive: boolean;
  onClick: () => void;
}

export const QuickFilterBtn = ({
  label,
  count,
  countFilter,
  isActive,
  onClick,
}: QuickFilterBtnProps) => (
  <button
    onClick={onClick}
    className={cn(
      "relative h-8 px-3 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 select-none outline-none",
      isActive
        ? "bg-background dark:bg-zinc-800 text-primary shadow-sm scale-[1.03] border border-border/50"
        : "text-muted-foreground hover:text-foreground hover:bg-background/50 border border-transparent",
    )}
  >
    <span>{label}</span>
    {count !== undefined && (
      <span
        className={cn(
          "inline-flex items-center px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all duration-200",
          isActive
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        {countFilter !== undefined && countFilter !== count ? (
          <>
            <span className="text-primary font-black">{countFilter}</span>
            <span className="opacity-40 mx-0.5">/</span>
            <span>{count}</span>
          </>
        ) : (
          count
        )}
      </span>
    )}
  </button>
);
