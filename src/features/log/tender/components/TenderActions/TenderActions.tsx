"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/shared/utils";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

// Імпорт нових компонентів
import { DraftActions } from "./DraftActions";
import { ActiveActions } from "./ActiveActions";

interface TenderActionsProps {
  tender: any;
  canDelete?: boolean;
}

export default function TenderActions({
  tender,
  canDelete = true,
}: TenderActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const { config } = useFontSize();

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const textClass = cn(
    "font-medium leading-none whitespace-nowrap text-[13px]",
    config.label,
  );
  const itemClass =
    "flex items-center w-full gap-2.5 px-3 py-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors first:rounded-t-lg last:rounded-b-lg text-zinc-700 dark:text-zinc-300";

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
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
      window.addEventListener("scroll", () => setIsOpen(false), { once: true });
    }
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  const menuContent = (
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        top: coords.top + 4,
        left: coords.left,
        zIndex: 9999,
      }}
      className="w-48 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col py-0.5">
        {/* Рендер залежно від статусу через окремі файли */}
        {tender.ids_status === "DRAFT" && (
          <DraftActions
            tender={tender}
            itemClass={itemClass}
            textClass={textClass}
            config={config}
            onClose={handleClose}
          />
        )}

        {tender.ids_status === "ACTIVE" && (
          <ActiveActions
            tender={tender}
            itemClass={itemClass}
            textClass={textClass}
            config={config}
            onClose={handleClose}
          />
        )}

        {canDelete && (
          <>
            <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-0.5 mx-1" />
            <button
              onClick={() => {
                if (confirm("Видалити цей тендер?")) {
                  /* delete logic */
                }
                handleClose();
              }}
              className={cn(
                itemClass,
                "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30",
              )}
            >
              <Trash2 size={config.icon - 2} />
              <span className={cn(textClass, "font-semibold")}>Видалити</span>
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="cursor-pointer flex items-center justify-center rounded-md hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
        style={{ width: config.icon + 8, height: config.icon + 8 }}
      >
        <GripVertical size={config.icon} className="text-zinc-400" />
      </button>

      {isOpen && createPortal(menuContent, document.body)}
    </div>
  );
}
