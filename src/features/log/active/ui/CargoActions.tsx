import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
import { LoadApiItem } from "../../types/load.type";
import { cn } from "@/shared/utils";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

interface CargoActionsProps {
  load: LoadApiItem;
  profile: any;
  canDelete: boolean;
  onAddCars: () => void;
  onRemoveCars: () => void;
  onCloseCargo: () => void;
  onRefresh: (id: number) => void;
  onCopy?: (load: LoadApiItem) => void;
  onDelete?: (id: number) => void;
}

export function CargoActions({
  load,
  profile,
  canDelete,
  onAddCars,
  onRemoveCars,
  onCloseCargo,
  onRefresh,
  onDelete,
}: CargoActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const router = useRouter();
  const pathname = usePathname();
  const { config } = useFontSize();

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isArchive = pathname?.includes("archive");
  const hasAccess =
    profile?.is_crm_admin || String(profile?.id) === String(load.id_usr);

  // Розрахунок позиції при відкритті
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Позиціонуємо меню під кнопкою, вирівнюємо по правому краю (мінус ширина меню 192px)
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 192,
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("mousedown", handleClickOutside);
      // Закриваємо при скролі, щоб меню не "відірвалося" від кнопки
      window.addEventListener("scroll", () => setIsOpen(false), { once: true });
    }
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!hasAccess) return null;

  const textClass = cn(
    "font-medium leading-none whitespace-nowrap",
    config.label,
    "text-[13px]",
  );
  const itemClass =
    "flex items-center w-full gap-2.5 px-3 py-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors first:rounded-t-lg last:rounded-b-lg text-zinc-700 dark:text-zinc-300";

  const menuContent = (
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        top: coords.top + 4,
        left: coords.left,
        zIndex: 999999,
        cursor: "pointer",
      }}
      className="cursor-pointer w-48 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in duration-120"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col py-0.5">
        {isArchive ? (
          <button
            onClick={() => {
              router.push(`/log/load/add?copyId=${load.id}`);
              setIsOpen(false);
            }}
            className={cn(itemClass, "text-blue-600 hover:text-blue-700")}
          >
            <Copy size={config.icon - 2} />
            <span className={textClass}>Копіювати</span>
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                router.push(`/log/load/edit/${load.id}`);
                setIsOpen(false);
              }}
              className={itemClass}
            >
              <Edit3 size={config.icon - 2} className="opacity-70" />
              <span className={textClass}>Редагувати</span>
            </button>

            <button
              onClick={() => {
                router.push(`/log/load/add?copyId=${load.id}`);
                setIsOpen(false);
              }}
              className={cn(itemClass, "text-blue-600 hover:text-blue-700")}
            >
              <Copy size={config.icon - 2} />
              <span className={textClass}>Копіювати</span>
            </button>

            <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-0.5 mx-1" />

            <button
              onClick={() => {
                onRefresh(load.id);
                setIsOpen(false);
              }}
              className={cn(itemClass, "hover:text-emerald-600")}
            >
              <RefreshCcw size={config.icon - 2} className="text-emerald-500" />
              <span className={textClass}>Оновити час</span>
            </button>

            <button
              onClick={() => {
                onCloseCargo();
                setIsOpen(false);
              }}
              className={cn(itemClass, "hover:text-blue-600")}
            >
              <CheckCircle2 size={config.icon - 2} className="text-blue-500" />
              <span className={textClass}>Закрити</span>
            </button>

            <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-0.5 mx-1" />

            <button
              onClick={() => {
                onAddCars();
                setIsOpen(false);
              }}
              className={itemClass}
            >
              <PlusCircle size={config.icon - 2} className="opacity-70" />
              <span className={textClass}>Додати авто</span>
            </button>

            <button
              onClick={() => {
                onRemoveCars();
                setIsOpen(false);
              }}
              className={cn(itemClass, "hover:text-orange-600")}
            >
              <MinusCircle size={config.icon - 2} className="text-orange-500" />
              <span className={textClass}>Відмінити авто</span>
            </button>

            {canDelete && (
              <>
                <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-0.5 mx-1" />
                <button
                  onClick={() => {
                    onDelete?.(load.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    itemClass,
                    "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30",
                  )}
                >
                  <Trash2 size={config.icon - 2} />
                  <span className={cn(textClass, "font-semibold")}>
                    Видалити
                  </span>
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative inline-block ">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="cursor-pointer flex items-center justify-center rounded-md hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors focus:outline-none"
        style={{ width: config.icon + 8, height: config.icon + 8 }}
      >
        <GripVertical
          size={config.icon - 4}
          className="text-zinc-400 hover:text-zinc-600 "
        />
      </button>

      {/* Портал виносить меню в кінець body, де overflow картки його не дістане */}
      {isOpen && createPortal(menuContent, document.body)}
    </div>
  );
}
