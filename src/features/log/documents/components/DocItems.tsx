"use client";

import { useState, type HTMLAttributes, type MouseEvent } from "react";
import { Check, Folder, Star } from "lucide-react";
import { cn } from "@/shared/utils";
import { DocTarget, IDocFile, IDocFolder } from "../types/documents.type";
import { formatDocDate, formatDocSize, getDocTypeMeta } from "../utils/documents.utils";
import { DocActionHandlers, DocActionsMenu } from "./DocActionsMenu";

export type DndProps = Pick<
  HTMLAttributes<HTMLElement>,
  "draggable" | "onDragStart" | "onDragOver" | "onDragLeave" | "onDrop"
>;

/** Стан меню дій, яке відкривається і кнопкою «⋮», і правим кліком по елементу. */
const useContextActions = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(true);
  };
  return { menuOpen, setMenuOpen, onContextMenu };
};

export function FileTypeIcon({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const meta = getDocTypeMeta(name);
  const Icon = meta.icon;
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl",
        meta.tone,
        size === "sm" && "h-8 w-8",
        size === "md" && "h-10 w-10",
        size === "lg" && "h-20 w-20 rounded-3xl",
      )}
    >
      <Icon className={cn(size === "lg" ? "h-10 w-10" : size === "sm" ? "h-4 w-4" : "h-5 w-5")} />
    </div>
  );
}

const extBadge = (name: string) => {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toUpperCase() : "";
};

const FavoriteStar = () => <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />;

interface CommonProps {
  isAdmin: boolean;
  isFavorite: boolean;
  handlers: DocActionHandlers;
  dnd: DndProps;
  isDropTarget?: boolean;
  /** Шлях до папки — показується в пошуку та обраному */
  location?: string;
  /** Повний шлях — у підказці */
  locationTitle?: string;
}

// ---------- папки: плитка ----------

interface FolderItemProps extends CommonProps {
  folder: IDocFolder;
  stats?: { files: number; size: number };
  subfolders: number;
}

export function FolderCard({
  folder, stats, subfolders, isAdmin, isFavorite, handlers, dnd, isDropTarget, location, locationTitle,
}: FolderItemProps) {
  const target: DocTarget = { kind: "folder", item: folder };
  const { menuOpen, setMenuOpen, onContextMenu } = useContextActions();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => handlers.onOpen(target)}
      // Лише Enter на самій плитці: із меню «⋮» чи чекбокса подія спливає сюди ж
      onKeyDown={(e) => e.key === "Enter" && e.target === e.currentTarget && handlers.onOpen(target)}
      onContextMenu={onContextMenu}
      {...dnd}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl border bg-white/80 p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:bg-slate-900/60 dark:hover:border-blue-500/30",
        isDropTarget
          ? "border-blue-400 ring-2 ring-blue-400/40 dark:border-blue-400"
          : "border-slate-200 dark:border-white/10",
        menuOpen && "border-blue-200 dark:border-blue-500/30",
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-500/10">
        <Folder className="h-6 w-6 fill-amber-400/30" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-800 dark:text-slate-100" title={folder.name}>
          {folder.name}
        </p>
        <p className="truncate text-xs text-muted-foreground" title={locationTitle}>
          {location ??
            [
              subfolders ? `${subfolders} папок` : null,
              stats?.files ? `${stats.files} файлів` : "порожня",
              stats?.size ? formatDocSize(stats.size) : null,
            ]
              .filter(Boolean)
              .join(" · ")}
        </p>
      </div>
      {isFavorite && <FavoriteStar />}
      <DocActionsMenu
        target={target}
        isAdmin={isAdmin}
        isFavorite={isFavorite}
        handlers={handlers}
        open={menuOpen}
        onOpenChange={setMenuOpen}
      />
    </div>
  );
}

// ---------- файли: плитка ----------

interface FileItemProps extends CommonProps {
  file: IDocFile;
  selected: boolean;
  selectionMode: boolean;
  onToggleSelect: (id: string, e: MouseEvent) => void;
}

export function FileCard({
  file, isAdmin, isFavorite, handlers, dnd, isDropTarget, selected, selectionMode, onToggleSelect, location, locationTitle,
}: FileItemProps) {
  const target: DocTarget = { kind: "file", item: file };
  const { menuOpen, setMenuOpen, onContextMenu } = useContextActions();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => (selectionMode || e.ctrlKey || e.metaKey ? onToggleSelect(file.id, e) : handlers.onOpen(target))}
      // Лише Enter на самій плитці: із меню «⋮» чи чекбокса подія спливає сюди ж
      onKeyDown={(e) => e.key === "Enter" && e.target === e.currentTarget && handlers.onOpen(target)}
      onContextMenu={onContextMenu}
      {...dnd}
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-white/80 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900/60",
        selected || isDropTarget
          ? "border-blue-400 ring-2 ring-blue-400/30 dark:border-blue-400"
          : "border-slate-200 hover:border-blue-200 dark:border-white/10 dark:hover:border-blue-500/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <SelectBox selected={selected} visible={selectionMode} onToggle={(e) => onToggleSelect(file.id, e)} />
        <div className="flex items-center gap-1">
          {isFavorite && <FavoriteStar />}
          <DocActionsMenu
            target={target}
            isAdmin={isAdmin}
            isFavorite={isFavorite}
            handlers={handlers}
            open={menuOpen}
            onOpenChange={setMenuOpen}
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 px-1 pb-1 pt-1 text-center">
        <div className="relative">
          <FileTypeIcon name={file.name} size="lg" />
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-md bg-white px-1.5 text-[10px] font-bold text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
            {extBadge(file.name)}
          </span>
        </div>
        <p
          className="mt-2 line-clamp-2 min-h-[2.5rem] break-words text-sm font-medium leading-5 text-slate-800 dark:text-slate-100"
          title={file.name}
        >
          {file.name}
        </p>
        <p className="w-full truncate text-[11px] text-muted-foreground" title={locationTitle}>
          {location ?? `${formatDocSize(file.size)} · ${formatDocDate(file.updatedAt)}`}
        </p>
      </div>
    </div>
  );
}

function SelectBox({
  selected, visible, onToggle,
}: { selected: boolean; visible: boolean; onToggle: (e: MouseEvent) => void }) {
  return (
    <button
      type="button"
      title={selected ? "Зняти вибір" : "Вибрати"}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(e);
      }}
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all",
        selected
          ? "border-blue-500 bg-blue-500 text-white"
          : "border-slate-300 bg-white dark:border-white/20 dark:bg-slate-800",
        visible || selected ? "opacity-100" : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100",
      )}
    >
      {selected && <Check className="h-3.5 w-3.5" />}
    </button>
  );
}

// ---------- список (таблиця) ----------

interface RowCommon {
  isAdmin: boolean;
  isFavorite: boolean;
  handlers: DocActionHandlers;
  dnd: DndProps;
  showLocation: boolean;
  location?: string;
  locationTitle?: string;
}

function FolderRow({
  folder, stats, isDropTarget, isAdmin, isFavorite, handlers, dnd, showLocation, location, locationTitle,
}: RowCommon & { folder: IDocFolder; stats?: { files: number; size: number }; isDropTarget: boolean }) {
  const target: DocTarget = { kind: "folder", item: folder };
  const { menuOpen, setMenuOpen, onContextMenu } = useContextActions();

  return (
    <tr
      onClick={() => handlers.onOpen(target)}
      onContextMenu={onContextMenu}
      {...dnd}
      className={cn(
        "group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/5",
        (isDropTarget || menuOpen) && "bg-blue-50 dark:bg-blue-500/10",
        isDropTarget && "ring-2 ring-inset ring-blue-400/50",
      )}
    >
      <td className="px-3 py-2" />
      <td className="px-2 py-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-500/10">
            <Folder className="h-4 w-4 fill-amber-400/30" />
          </div>
          <span className="truncate font-medium">{folder.name}</span>
          {isFavorite && <FavoriteStar />}
        </div>
      </td>
      {showLocation && (
        <td className="hidden max-w-[16rem] truncate px-2 py-2 text-muted-foreground md:table-cell" title={locationTitle}>
          {location}
        </td>
      )}
      <td className="hidden px-2 py-2 text-muted-foreground sm:table-cell">
        {stats?.files ? `${stats.files} файлів` : "порожня"}
      </td>
      <td className="hidden px-2 py-2 text-muted-foreground md:table-cell">{formatDocDate(folder.updatedAt)}</td>
      <td className="px-2 py-2 text-right">
        <DocActionsMenu
          target={target}
          isAdmin={isAdmin}
          isFavorite={isFavorite}
          handlers={handlers}
          open={menuOpen}
          onOpenChange={setMenuOpen}
        />
      </td>
    </tr>
  );
}

function FileRow({
  file, isSelected, selectionMode, onToggleSelect, isAdmin, isFavorite, handlers, dnd, showLocation, location, locationTitle,
}: RowCommon & {
  file: IDocFile;
  isSelected: boolean;
  selectionMode: boolean;
  onToggleSelect: (id: string, e: MouseEvent) => void;
}) {
  const target: DocTarget = { kind: "file", item: file };
  const { menuOpen, setMenuOpen, onContextMenu } = useContextActions();

  return (
    <tr
      onClick={(e) => (selectionMode || e.ctrlKey || e.metaKey ? onToggleSelect(file.id, e) : handlers.onOpen(target))}
      onContextMenu={onContextMenu}
      {...dnd}
      className={cn(
        "group cursor-pointer transition-colors",
        isSelected || menuOpen ? "bg-blue-50/70 dark:bg-blue-500/10" : "hover:bg-slate-50 dark:hover:bg-white/5",
      )}
    >
      <td className="px-3 py-2">
        <SelectBox selected={isSelected} visible={selectionMode} onToggle={(e) => onToggleSelect(file.id, e)} />
      </td>
      <td className="px-2 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <FileTypeIcon name={file.name} size="sm" />
          <span className="truncate font-medium" title={file.name}>
            {file.name}
          </span>
          {isFavorite && <FavoriteStar />}
        </div>
      </td>
      {showLocation && (
        <td className="hidden max-w-[16rem] truncate px-2 py-2 text-muted-foreground md:table-cell" title={locationTitle}>
          {location}
        </td>
      )}
      <td className="hidden px-2 py-2 text-muted-foreground sm:table-cell">{formatDocSize(file.size)}</td>
      <td className="hidden px-2 py-2 text-muted-foreground md:table-cell">{formatDocDate(file.updatedAt)}</td>
      <td className="px-2 py-2 text-right">
        <DocActionsMenu
          target={target}
          isAdmin={isAdmin}
          isFavorite={isFavorite}
          handlers={handlers}
          open={menuOpen}
          onOpenChange={setMenuOpen}
        />
      </td>
    </tr>
  );
}

interface ListProps {
  folders: { folder: IDocFolder; stats?: { files: number; size: number }; location?: string; locationTitle?: string }[];
  files: { file: IDocFile; location?: string; locationTitle?: string }[];
  isAdmin: boolean;
  isFavorite: (id: string) => boolean;
  handlers: DocActionHandlers;
  dndFor: (target: DocTarget) => DndProps;
  dropTargetId: string | null;
  selected: Set<string>;
  onToggleSelect: (id: string, e: MouseEvent) => void;
  onToggleSelectAll: () => void;
  showLocation: boolean;
}

export function DocListTable({
  folders, files, isAdmin, isFavorite, handlers, dndFor, dropTargetId, selected,
  onToggleSelect, onToggleSelectAll, showLocation,
}: ListProps) {
  const allSelected = files.length > 0 && files.every((f) => selected.has(f.file.id));
  const selectionMode = selected.size > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-xs uppercase tracking-wide text-muted-foreground dark:border-white/10 dark:bg-white/5">
            <tr>
              <th className="w-10 px-3 py-2.5">
                {files.length > 0 && <SelectBox selected={allSelected} visible onToggle={onToggleSelectAll} />}
              </th>
              <th className="px-2 py-2.5 font-semibold">Назва</th>
              {showLocation && <th className="hidden px-2 py-2.5 font-semibold md:table-cell">Розташування</th>}
              <th className="hidden w-28 px-2 py-2.5 font-semibold sm:table-cell">Розмір</th>
              <th className="hidden w-32 px-2 py-2.5 font-semibold md:table-cell">Змінено</th>
              <th className="w-12 px-2 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {folders.map(({ folder, stats, location, locationTitle }) => (
              <FolderRow
                key={folder.id}
                folder={folder}
                stats={stats}
                isDropTarget={dropTargetId === folder.id}
                isAdmin={isAdmin}
                isFavorite={isFavorite(folder.id)}
                handlers={handlers}
                dnd={dndFor({ kind: "folder", item: folder })}
                showLocation={showLocation}
                location={location}
                locationTitle={locationTitle}
              />
            ))}
            {files.map(({ file, location, locationTitle }) => (
              <FileRow
                key={file.id}
                file={file}
                isSelected={selected.has(file.id)}
                selectionMode={selectionMode}
                onToggleSelect={onToggleSelect}
                isAdmin={isAdmin}
                isFavorite={isFavorite(file.id)}
                handlers={handlers}
                dnd={dndFor({ kind: "file", item: file })}
                showLocation={showLocation}
                location={location}
                locationTitle={locationTitle}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
