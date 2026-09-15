"use client";

import {
  Download,
  ExternalLink,
  Eye,
  FolderInput,
  FolderOpen,
  FolderSearch,
  Link2,
  MoreVertical,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/utils";
import { DocTarget } from "../types/documents.type";
import { getDocTypeMeta } from "../utils/documents.utils";

export interface DocActionHandlers {
  onOpen: (target: DocTarget) => void;
  onOpenInTab: (target: DocTarget) => void;
  onDownload: (target: DocTarget) => void;
  onCopyLink: (target: DocTarget) => void;
  onToggleFavorite: (target: DocTarget) => void;
  /** Лише в пошуку/обраному — перейти до папки, де лежить елемент */
  onReveal?: (target: DocTarget) => void;
  onRename: (target: DocTarget) => void;
  onMove: (target: DocTarget) => void;
  onDelete: (target: DocTarget) => void;
}

interface Props {
  target: DocTarget;
  isAdmin: boolean;
  isFavorite: boolean;
  handlers: DocActionHandlers;
  className?: string;
  /** Керований стан — щоб відкривати меню правим кліком по елементу */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Власна кнопка замість «⋮» (напр. «Дії з папкою» в шапці) */
  trigger?: React.ReactNode;
  /** Меню для вже відкритої папки — пункт «Відкрити» зайвий */
  hideOpen?: boolean;
}

export function DocActionsMenu({
  target, isAdmin, isFavorite, handlers, className, open, onOpenChange, trigger, hideOpen,
}: Props) {
  const isFolder = target.kind === "folder";
  const canPreview = !isFolder && getDocTypeMeta(target.item.name).preview !== "none";

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            title="Дії (або правий клік)"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            className={cn(
              "rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700 data-[state=open]:bg-slate-200/70 data-[state=open]:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white",
              className,
            )}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {!hideOpen && (
          <DropdownMenuItem onSelect={() => handlers.onOpen(target)}>
            {isFolder ? <FolderOpen /> : <Eye />}
            {isFolder ? "Відкрити" : "Переглянути"}
          </DropdownMenuItem>
        )}
        {handlers.onReveal && (
          <DropdownMenuItem onSelect={() => handlers.onReveal?.(target)}>
            <FolderSearch /> Показати в папці
          </DropdownMenuItem>
        )}
        {canPreview && (
          <DropdownMenuItem onSelect={() => handlers.onOpenInTab(target)}>
            <ExternalLink /> Відкрити в новій вкладці
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => handlers.onDownload(target)}>
          <Download /> {isFolder ? "Скачати архівом (ZIP)" : "Скачати"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handlers.onCopyLink(target)}>
          <Link2 /> Копіювати посилання
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handlers.onToggleFavorite(target)}>
          <Star className={cn(isFavorite && "fill-amber-400 text-amber-400")} />
          {isFavorite ? "Прибрати з обраного" : "Додати в обране"}
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handlers.onRename(target)}>
              <Pencil /> Перейменувати
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handlers.onMove(target)}>
              <FolderInput /> Перемістити
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => handlers.onDelete(target)}>
              <Trash2 /> {isFolder ? "Видалити папку" : "Видалити файл"}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
