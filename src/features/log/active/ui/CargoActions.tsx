import React from "react";
import { useRouter, usePathname } from "next/navigation"; // Додали usePathname
import { GripVertical, Copy } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { LoadApiItem } from "../../types/load.type";
import { Separator } from "@/shared/components/ui/separator";

interface CargoActionsProps {
  load: LoadApiItem;
  profile: any;
  canDelete: boolean;
  onAddCars: () => void;
  onRemoveCars: () => void;
  onCloseCargo: () => void;
  onRefresh: (id: number) => void;
  onCopy?: (load: LoadApiItem) => void; // Додав опціональний колбек для копіювання
}

export function CargoActions({
  load,
  profile,
  canDelete,
  onAddCars,
  onRemoveCars,
  onCloseCargo,
  onRefresh,
  onCopy,
}: CargoActionsProps) {
  const router = useRouter();
  const pathname = usePathname(); // Отримуємо поточний шлях

  // Перевіряємо, чи містить шлях слово "archive"
  const isArchive = pathname?.includes("archive");

  // Перевірка прав: Адмін або Власник
  // Використовуємо String(), щоб уникнути помилки порівняння типів
  const hasAccess =
    profile?.is_crm_admin || String(profile?.id) === String(load.id_usr);

  if (!hasAccess) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-5 w-5">
          <GripVertical size={12} className="text-zinc-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="rounded-xl backdrop-blur-lg">
        {isArchive ? (
          /* ПУНКТИ ТІЛЬКИ ДЛЯ АРХІВУ */
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/log/load/add?copyId=${load.id}`); // Передаємо ID для копіювання
            }}
            className="gap-2"
          >
            <Copy size={14} />
            Зробити копію
          </DropdownMenuItem>
        ) : (
          /* СТАНДАРТНІ ПУНКТИ (НЕ В АРХІВІ) */
          <>
            <DropdownMenuItem
              onClick={() => router.push(`/log/load/edit/${load.id}`)}
            >
              Редагувати
            </DropdownMenuItem>
            <Separator />
            <DropdownMenuItem onClick={() => onRefresh(load.id)}>
              Оновити
            </DropdownMenuItem>
           <DropdownMenuItem onClick={onCloseCargo}>
              Закрита нами
            </DropdownMenuItem>
                  <Separator />
            <DropdownMenuItem onClick={onAddCars}>Додати авто</DropdownMenuItem>

            <DropdownMenuItem onClick={onRemoveCars}>
              Відмінити авто
            </DropdownMenuItem>

 

            {canDelete && (
              <DropdownMenuItem className="text-red-500">
                Видалити
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
