"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/shared/utils";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

// Імпорт нових компонентів
import { DraftActions } from "./DraftActions";
import { ActiveActions } from "./ActiveActions";
import { PlanActions } from "./PlanActions";
import { AnalyzeActions } from "./AnalyzeActions";
import { SendNotificationModal } from "./SendNotificationModal";
import { MessageSquare } from "lucide-react";
import { tenderManagerService } from "../../../services/tender.manager.service";
import { toast } from "sonner";


interface TenderActionsProps {
  tender: any;
  canDelete?: boolean;
  disabled?: boolean;
}

export default function TenderActions({
  tender,
  canDelete = true,
  disabled = false,
}: TenderActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
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
    if (disabled) return;
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

  const handleSendNotification = async (message: string) => {
    try {
      await tenderManagerService.sendCustomNotification(tender.id, message);
      toast.success("Сповіщення успішно надіслано підписантам!");
    } catch (error) {
      console.error(error);
      toast.error("Помилка під час відправки сповіщення");
    }
  };

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
        {tender.ids_status === "PLAN" && (
          <PlanActions
            tender={tender}
            itemClass={itemClass}
            textClass={textClass}
            config={config}
            onClose={handleClose}
          />
        )}
        {tender.ids_status === "ANALYZE" && (
          <AnalyzeActions
            tender={tender}
            itemClass={itemClass}
            textClass={textClass}
            config={config}
            onClose={handleClose}
          />
        )}


        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-0.5 mx-1" />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsNotificationModalOpen(true);
            handleClose();
          }}
          className={cn(itemClass, "text-indigo-600")}
        >
          <MessageSquare size={config.icon - 2} />
          <span className={textClass}>Надіслати сповіщення</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        disabled={disabled}
        className={cn(
          "cursor-pointer flex items-center justify-center rounded-md hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors",
          disabled && "opacity-30 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent"
        )}
        style={{ width: 34, height: 34 }}
      >
        <GripVertical size={24} className={cn("text-zinc-500 dark:text-zinc-400", disabled && "opacity-50")} />
      </button>

      {isOpen && createPortal(menuContent, document.body)}
      {isNotificationModalOpen &&
        createPortal(
          <SendNotificationModal
            onClose={() => setIsNotificationModalOpen(false)}
            onConfirm={handleSendNotification}
          />,
          document.body
        )}
    </div>
  );
}
