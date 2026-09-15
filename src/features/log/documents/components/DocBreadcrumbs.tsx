"use client";

import { ChevronRight, HardDrive, Star } from "lucide-react";
import { cn } from "@/shared/utils";
import { DocTarget, IDocFolder } from "../types/documents.type";
import { DndProps } from "./DocItems";
import { ROOT_DROP_ID } from "./DocSidebar";

interface Props {
  path: IDocFolder[];
  favoritesView: boolean;
  searchQuery: string;
  onNavigate: (folderId: string | null) => void;
  dndFor: (target: DocTarget | null) => DndProps;
  dropTargetId: string | null;
}

export function DocBreadcrumbs({ path, favoritesView, searchQuery, onNavigate, dndFor, dropTargetId }: Props) {
  if (searchQuery) {
    return (
      <p className="truncate text-sm text-muted-foreground">
        Результати пошуку за «<span className="font-semibold text-foreground">{searchQuery}</span>» по всіх папках
      </p>
    );
  }
  if (favoritesView) {
    return (
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Star className="h-4 w-4 fill-amber-400 text-amber-500" /> Обране
      </p>
    );
  }

  const crumbClass = "flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1 transition-colors";

  return (
    <nav className="flex min-w-0 flex-wrap items-center gap-0.5 text-sm" aria-label="Шлях">
      <button
        type="button"
        onClick={() => onNavigate(null)}
        {...dndFor(null)}
        className={cn(
          crumbClass,
          path.length ? "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-white/5" : "font-semibold",
          dropTargetId === ROOT_DROP_ID && "ring-2 ring-blue-400/60",
        )}
      >
        <HardDrive className="h-4 w-4 shrink-0" />
        Усі документи
      </button>
      {path.map((folder, i) => {
        const last = i === path.length - 1;
        return (
          <span key={folder.id} className="flex min-w-0 items-center gap-0.5">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <button
              type="button"
              onClick={() => onNavigate(folder.id)}
              {...(last ? {} : dndFor({ kind: "folder", item: folder }))}
              draggable={false}
              className={cn(
                crumbClass,
                last ? "font-semibold" : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-white/5",
                dropTargetId === folder.id && "ring-2 ring-blue-400/60",
              )}
              title={folder.name}
            >
              <span className="max-w-[14rem] truncate">{folder.name}</span>
            </button>
          </span>
        );
      })}
    </nav>
  );
}
