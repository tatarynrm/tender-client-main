"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Folder, FolderOpen, HardDrive, Star } from "lucide-react";
import { cn } from "@/shared/utils";
import { DocTarget, IDocFolder } from "../types/documents.type";
import { DocsIndex, formatDocSize } from "../utils/documents.utils";
import { DocActionHandlers, DocActionsMenu } from "./DocActionsMenu";
import { DndProps } from "./DocItems";

interface Props {
  index: DocsIndex;
  totalFiles: number;
  totalSize: number;
  currentFolderId: string | null;
  favoritesView: boolean;
  favoritesCount: number;
  onOpenFolder: (id: string | null) => void;
  onShowFavorites: () => void;
  dndFor: (target: DocTarget | null) => DndProps;
  dropTargetId: string | null;
  isAdmin: boolean;
  isFavorite: (id: string) => boolean;
  handlers: DocActionHandlers;
}

export const ROOT_DROP_ID = "__root__";

export function DocSidebar({
  index, totalFiles, totalSize, currentFolderId, favoritesView, favoritesCount,
  onOpenFolder, onShowFavorites, dndFor, dropTargetId, isAdmin, isFavorite, handlers,
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Розгортаємо шлях до відкритої папки
  useEffect(() => {
    if (!currentFolderId) return;
    const ids = index.pathOf(currentFolderId).map((f) => f.id);
    setExpanded((prev) => {
      if (ids.every((id) => prev.has(id))) return prev;
      return new Set([...prev, ...ids]);
    });
  }, [currentFolderId, index]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderNode = (folder: IDocFolder, depth: number): React.ReactNode => (
    <TreeNode
      key={folder.id}
      folder={folder}
      depth={depth}
      index={index}
      isOpen={expanded.has(folder.id)}
      active={!favoritesView && currentFolderId === folder.id}
      isDropTarget={dropTargetId === folder.id}
      onToggle={toggle}
      onOpenFolder={onOpenFolder}
      dnd={dndFor({ kind: "folder", item: folder })}
      isAdmin={isAdmin}
      isFavorite={isFavorite(folder.id)}
      handlers={handlers}
      renderChildren={(children) => children.map((child) => renderNode(child, depth + 1))}
    />
  );

  const rootActive = !favoritesView && currentFolderId === null;
  const rootFolders = index.childFolders.get(null) ?? [];

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
      <div className="space-y-1 border-b border-slate-200 p-2 dark:border-white/10">
        <button
          type="button"
          onClick={() => onOpenFolder(null)}
          {...dndFor(null)}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
            rootActive
              ? "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5",
            dropTargetId === ROOT_DROP_ID && "ring-2 ring-blue-400/60",
          )}
        >
          <HardDrive className="h-4 w-4" />
          <span className="flex-1 text-left">Усі документи</span>
          <span className="text-[11px] tabular-nums text-muted-foreground">{totalFiles}</span>
        </button>
        <button
          type="button"
          onClick={onShowFavorites}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
            favoritesView
              ? "bg-amber-50 font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5",
          )}
        >
          <Star className={cn("h-4 w-4", favoritesView && "fill-amber-400 text-amber-500")} />
          <span className="flex-1 text-left">Обране</span>
          <span className="text-[11px] tabular-nums text-muted-foreground">{favoritesCount}</span>
        </button>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto p-2">
        <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Папки</p>
        {rootFolders.map((folder) => renderNode(folder, 0))}
        {!rootFolders.length && <p className="px-2 py-3 text-xs text-muted-foreground">Папок ще немає</p>}
      </div>

      <div className="border-t border-slate-200 px-4 py-2.5 text-[11px] text-muted-foreground dark:border-white/10">
        {totalFiles} файлів · {formatDocSize(totalSize)}
        {isAdmin && <span className="block pt-0.5 opacity-80">Правий клік по папці — дії з нею</span>}
      </div>
    </aside>
  );
}

interface TreeNodeProps {
  folder: IDocFolder;
  depth: number;
  index: DocsIndex;
  isOpen: boolean;
  active: boolean;
  isDropTarget: boolean;
  onToggle: (id: string) => void;
  onOpenFolder: (id: string | null) => void;
  dnd: DndProps;
  isAdmin: boolean;
  isFavorite: boolean;
  handlers: DocActionHandlers;
  renderChildren: (children: IDocFolder[]) => React.ReactNode;
}

function TreeNode({
  folder, depth, index, isOpen, active, isDropTarget, onToggle, onOpenFolder, dnd,
  isAdmin, isFavorite, handlers, renderChildren,
}: TreeNodeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const children = index.childFolders.get(folder.id) ?? [];
  const count = index.totals.get(folder.id)?.files ?? 0;

  return (
    <div>
      <div
        {...dnd}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuOpen(true);
        }}
        className={cn(
          "group flex items-center gap-1 rounded-lg pr-1 text-sm transition-colors",
          active
            ? "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5",
          menuOpen && !active && "bg-slate-100 dark:bg-white/5",
          isDropTarget && "ring-2 ring-blue-400/60",
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        <button
          type="button"
          onClick={() => onToggle(folder.id)}
          className={cn("rounded p-0.5 text-slate-400 hover:text-slate-700", !children.length && "invisible")}
          aria-label={isOpen ? "Згорнути" : "Розгорнути"}
        >
          <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-90")} />
        </button>
        <button
          type="button"
          onClick={() => onOpenFolder(folder.id)}
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left"
          title={folder.name}
        >
          {active ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 fill-amber-400/20 text-amber-500" />
          )}
          <span className="truncate">{folder.name}</span>
        </button>
        {/* Лічильник і «⋮» в одній клітинці, перемикаються visibility (не display):
            прихована кнопка лишається в розкладці, і меню Radix не «стрибає» в кут екрана */}
        <span className="grid place-items-center">
          <span
            className={cn(
              "text-[11px] tabular-nums text-muted-foreground [grid-area:1/1] group-hover:invisible",
              menuOpen && "invisible",
            )}
          >
            {count}
          </span>
          <DocActionsMenu
            target={{ kind: "folder", item: folder }}
            isAdmin={isAdmin}
            isFavorite={isFavorite}
            handlers={handlers}
            open={menuOpen}
            onOpenChange={setMenuOpen}
            className={cn("invisible p-1 [grid-area:1/1] group-hover:visible", menuOpen && "visible")}
          />
        </span>
      </div>
      {isOpen && renderChildren(children)}
    </div>
  );
}
