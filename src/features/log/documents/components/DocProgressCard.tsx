"use client";

import { FileArchive, Loader2, UploadCloud } from "lucide-react";
import { UploadState } from "../hooks/useUploadDocuments";
import { formatDocSize } from "../utils/documents.utils";

interface Props {
  upload: UploadState | null;
  zip: { done: number; total: number } | null;
}

export function DocProgressCard({ upload, zip }: Props) {
  if (!upload && !zip) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[90] w-[min(22rem,calc(100vw-2rem))] space-y-2">
      {upload && (
        <Card
          icon={<UploadCloud className="h-4 w-4" />}
          title={`Завантаження в «${upload.targetName}»`}
          subtitle={`${upload.done} з ${upload.total} файлів · ${formatDocSize(upload.loadedBytes)} з ${formatDocSize(upload.totalBytes)}`}
          percent={upload.totalBytes ? Math.round((upload.loadedBytes / upload.totalBytes) * 100) : 0}
        />
      )}
      {zip && (
        <Card
          icon={<FileArchive className="h-4 w-4" />}
          title="Формування архіву"
          subtitle={`${zip.done} з ${zip.total} файлів`}
          percent={Math.round((zip.done / zip.total) * 100)}
        />
      )}
    </div>
  );
}

function Card({ icon, title, subtitle, percent }: { icon: React.ReactNode; title: string; subtitle: string; percent: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold tabular-nums text-blue-600">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {percent}%
        </span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-full rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
