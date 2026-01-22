import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  GripVertical,
  Copy,
  Edit3,
  RefreshCcw,
  CheckCircle2,
  PlusCircle,
  MinusCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { LoadApiItem } from "../../types/load.type";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/utils";
import { useFontSize } from "@/shared/providers/FontSizeProvider"; // Імпортуємо ваш хук

interface CargoActionsProps {
  load: LoadApiItem;
  profile: any;
  canDelete: boolean;
  onAddCars: () => void;
  onRemoveCars: () => void;
  onCloseCargo: () => void;
  onRefresh: (id: number) => void;
  onCopy?: (load: LoadApiItem) => void;
}

export function CargoActions({
  load,
  profile,
  canDelete,
  onAddCars,
  onRemoveCars,
  onCloseCargo,
  onRefresh,
}: CargoActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { config } = useFontSize(); // Отримуємо конфігурацію шрифтів та іконок

  const isArchive = pathname?.includes("archive");
  const hasAccess =
    profile?.is_crm_admin || String(profile?.id) === String(load.id_usr);

  if (!hasAccess) return null;

  // Допоміжна функція для однакових стилів тексту
  const textClass = cn("font-medium", config.label);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          style={{ width: config.icon + 12, height: config.icon + 12 }} // Динамічний розмір кнопки
          className="hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <GripVertical size={config.icon - 2} className="text-zinc-500" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-auto min-w-[200px] rounded-xl backdrop-blur-lg shadow-xl border-zinc-200/50 dark:border-white/10"
      >
        {isArchive ? (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/log/load/add?copyId=${load.id}`);
            }}
            className="gap-3 py-3 cursor-pointer focus:bg-blue-50 dark:focus:bg-blue-500/10"
          >
            <Copy size={config.icon} className="text-blue-500" />
            <span className={textClass}>Зробити копію</span>
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() => router.push(`/log/load/edit/${load.id}`)}
              className="gap-3 py-3 cursor-pointer"
            >
              <Edit3 size={config.icon} className="text-zinc-500" />
              <span className={textClass}>Редагувати</span>
            </DropdownMenuItem>

            <Separator className="my-1 opacity-50" />

            <DropdownMenuItem
              onClick={() => onRefresh(load.id)}
              className="gap-3 py-3 cursor-pointer focus:text-emerald-600"
            >
              <RefreshCcw size={config.icon} className="text-emerald-500" />
              <span className={textClass}>Оновити час</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onCloseCargo}
              className="gap-3 py-3 cursor-pointer"
            >
              <CheckCircle2 size={config.icon} className="text-blue-500" />
              <span className={textClass}>Закрита нами</span>
            </DropdownMenuItem>

            <Separator className="my-1 opacity-50" />

            <DropdownMenuItem
              onClick={onAddCars}
              className="gap-3 py-3 cursor-pointer"
            >
              <PlusCircle size={config.icon} className="text-zinc-500" />
              <span className={textClass}>Додати авто</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onRemoveCars}
              className="gap-3 py-3 cursor-pointer"
            >
              <MinusCircle size={config.icon} className="text-orange-500" />
              <span className={textClass}>Відмінити авто</span>
            </DropdownMenuItem>

            {canDelete && (
              <>
                <Separator className="my-1 opacity-50" />
                <DropdownMenuItem className="gap-3 py-3 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10">
                  <Trash2 size={config.icon} />
                  <span className={cn(textClass, "font-bold")}>Видалити</span>
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
