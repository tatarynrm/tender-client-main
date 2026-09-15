"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Link2,
  Loader2,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";
import { cn } from "@/shared/utils";
import { documentsService } from "../../services/documents.service";
import { IDocFile } from "../types/documents.type";
import { formatDocDate, formatDocSize, getDocTypeMeta } from "../utils/documents.utils";
import { FileTypeIcon } from "./DocItems";

interface Props {
  file: IDocFile | null;
  /** Файли поточного списку — для гортання стрілками */
  files: IDocFile[];
  location: string;
  isFavorite: boolean;
  onClose: () => void;
  onNavigate: (file: IDocFile) => void;
  onDownload: (file: IDocFile) => void;
  onCopyLink: (file: IDocFile) => void;
  onToggleFavorite: (file: IDocFile) => void;
}

export function DocPreviewDialog({
  file, files, location, isFavorite, onClose, onNavigate, onDownload, onCopyLink, onToggleFavorite,
}: Props) {
  const [loading, setLoading] = useState(true);
  const position = file ? files.findIndex((f) => f.id === file.id) : -1;
  const prev = position > 0 ? files[position - 1] : null;
  const next = position >= 0 && position < files.length - 1 ? files[position + 1] : null;
  const preview = file ? getDocTypeMeta(file.name).preview : "none";

  useEffect(() => setLoading(true), [file?.id]);

  useEffect(() => {
    if (!file) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prev) onNavigate(prev);
      if (e.key === "ArrowRight" && next) onNavigate(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [file, prev, next, onNavigate]);

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        width="w-[calc(100%-1rem)] max-w-6xl"
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0"
      >
        {file && (
          <div className="flex max-h-[95vh] flex-col">
            {/* Шапка */}
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10">
              <FileTypeIcon name={file.name} size="sm" />
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate text-base" title={file.name}>
                  {file.name}
                </DialogTitle>
                <p className="truncate text-xs text-muted-foreground">
                  {location} · {formatDocSize(file.size)} · {formatDocDate(file.updatedAt)}
                  {files.length > 1 && position >= 0 && ` · ${position + 1} з ${files.length}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <IconButton title={isFavorite ? "Прибрати з обраного" : "В обране"} onClick={() => onToggleFavorite(file)}>
                  <Star className={cn("h-4 w-4", isFavorite && "fill-amber-400 text-amber-400")} />
                </IconButton>
                <IconButton title="Копіювати посилання" onClick={() => onCopyLink(file)}>
                  <Link2 className="h-4 w-4" />
                </IconButton>
                {preview !== "none" && (
                  <IconButton title="Відкрити в новій вкладці" onClick={() => window.open(documentsService.viewUrl(file.id), "_blank", "noopener")}>
                    <ExternalLink className="h-4 w-4" />
                  </IconButton>
                )}
                <Button size="sm" className="ml-1 gap-1.5" onClick={() => onDownload(file)}>
                  <Download className="h-4 w-4" /> Скачати
                </Button>
                <IconButton title="Закрити (Esc)" onClick={onClose}>
                  <X className="h-4 w-4" />
                </IconButton>
              </div>
            </div>

            {/* Вміст */}
            <div className="relative flex h-[78vh] items-center justify-center bg-slate-100 dark:bg-slate-950">
              {preview !== "none" && loading && (
                <Loader2 className="absolute h-8 w-8 animate-spin text-slate-400" />
              )}

              {(preview === "pdf" || preview === "text") && (
                <iframe
                  key={file.id}
                  src={documentsService.viewUrl(file.id)}
                  title={file.name}
                  onLoad={() => setLoading(false)}
                  className="h-full w-full border-0 bg-white"
                />
              )}

              {preview === "image" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={file.id}
                  src={documentsService.viewUrl(file.id)}
                  alt={file.name}
                  onLoad={() => setLoading(false)}
                  onError={() => setLoading(false)}
                  className="max-h-full max-w-full object-contain p-4"
                />
              )}

              {preview === "none" && (
                <div className="flex flex-col items-center gap-4 p-8 text-center">
                  <FileTypeIcon name={file.name} size="lg" />
                  <div>
                    <p className="font-semibold">Попередній перегляд для цього типу недоступний</p>
                    <p className="text-sm text-muted-foreground">
                      {getDocTypeMeta(file.name).label} · {formatDocSize(file.size)} — скачайте файл, щоб відкрити його
                    </p>
                  </div>
                  <Button onClick={() => onDownload(file)} className="gap-2">
                    <Download className="h-4 w-4" /> Скачати файл
                  </Button>
                </div>
              )}

              {prev && (
                <NavArrow side="left" title={`Попередній: ${prev.name}`} onClick={() => onNavigate(prev)} />
              )}
              {next && (
                <NavArrow side="right" title={`Наступний: ${next.name}`} onClick={() => onNavigate(next)} />
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function IconButton({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
    >
      {children}
    </button>
  );
}

function NavArrow({ side, title, onClick }: { side: "left" | "right"; title: string; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2.5 text-white shadow-lg backdrop-blur transition hover:bg-black/60",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
