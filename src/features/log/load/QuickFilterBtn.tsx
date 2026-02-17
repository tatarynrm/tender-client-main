import { AppButton } from "@/shared/components/Buttons/AppButton";

export const QuickFilterBtn = ({ label, count, isActive, onClick }: any) => (
  <AppButton
    variant="ghost"
    size="sm"
    onClick={onClick}
    className={`
      relative h-8 px-3 rounded-xl transition-all duration-200 border-none
      ${isActive 
        ? "bg-background text-primary shadow-sm scale-105" 
        : "text-muted-foreground hover:text-foreground hover:bg-background/40"
      }
    `}
  >
    <span className="text-xs font-semibold">{label}</span>
    {count !== undefined && (
      <span className={`
        ml-2 px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-colors
        ${isActive 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20"
        }
      `}>
        {count}
      </span>
    )}
  </AppButton>
);