"use client";

import { useEffect, useMemo, useState } from "react";
import { Folder, HardDrive, Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils";
import { IDocFolder } from "../types/documents.type";
import { DocsIndex, matchesQuery } from "../utils/documents.utils";

interface Props {
  open: boolean;
  title: string;
  index: DocsIndex;
  /** Папки, куди переміщати не можна (сама папка та її вкладені) */
  disabledIds: Set<string>;
  currentParentId: string | null;
  pending: boolean;
  onSubmit: (folderId: string | null) => void;
  onClose: () => void;
}

export function DocMoveDialog({
  open, title, index, disabledIds, currentParentId, pending, onSubmit, onClose,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      setSelected(currentParentId);
      setQuery("");
    }
  }, [open, currentParentId]);

  // Плаский список дерева з глибиною; при пошуку — з повним шляхом
  const rows = useMemo(() => {
    const out: { folder: IDocFolder; depth: number; label: string }[] = [];
    const walk = (parentId: string | null, depth: number) => {
      for (const folder of index.childFolders.get(parentId) ?? []) {
        if (disabledIds.has(folder.id)) continue;
        out.push({
          folder,
          depth,
          label: index.pathOf(folder.id).map((f) => f.name).join(" / "),
        });
        walk(folder.id, depth + 1);
      }
    };
    walk(null, 0);
    const q = query.trim();
    return q ? out.filter((r) => matchesQuery(r.label, q)) : out;
  }, [index, disabledIds, query]);

  const q = query.trim();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !pending && onClose()}>
      <DialogContent className="p-6">
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>Оберіть папку призначення</DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Знайти папку" className="pl-9" />
          </div>

          <div className="custom-scrollbar max-h-[50vh] space-y-0.5 overflow-y-auto rounded-xl border border-slate-200 p-1.5 dark:border-white/10">
            {!q && (
              <Row
                active={selected === null}
                current={currentParentId === null}
                onClick={() => setSelected(null)}
                depth={0}
                icon={<HardDrive className="h-4 w-4 text-slate-500" />}
                label="Усі документи (корінь)"
              />
            )}
            {rows.map(({ folder, depth, label }) => (
              <Row
                key={folder.id}
                active={selected === folder.id}
                current={currentParentId === folder.id}
                onClick={() => setSelected(folder.id)}
                depth={q ? 0 : depth + 1}
                icon={<Folder className="h-4 w-4 fill-amber-400/20 text-amber-500" />}
                label={q ? label : folder.name}
              />
            ))}
            {q && !rows.length && <p className="p-3 text-center text-sm text-muted-foreground">Нічого не знайдено</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={pending}>
              Скасувати
            </Button>
            <Button onClick={() => onSubmit(selected)} disabled={pending || selected === currentParentId}>
              Перемістити сюди
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  active, current, onClick, depth, icon, label,
}: { active: boolean; current: boolean; onClick: () => void; depth: number; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg py-2 pr-2 text-left text-sm transition-colors",
        active
          ? "bg-blue-500 text-white [&_svg]:text-white"
          : "hover:bg-slate-100 dark:hover:bg-white/5",
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {current && (
        <span className={cn("text-[11px]", active ? "text-white/80" : "text-muted-foreground")}>поточна</span>
      )}
    </button>
  );
}
