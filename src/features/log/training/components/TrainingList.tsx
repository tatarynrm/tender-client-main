"use client";

import { useMemo, useState } from "react";
import { Pencil, PlayCircle, Search, Trash2 } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils";
import { ITrainingVideo } from "../types/training.type";

interface Props {
  videos: ITrainingVideo[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isAdmin: boolean;
  onEdit: (video: ITrainingVideo) => void;
  onDelete: (video: ITrainingVideo) => void;
}

export function TrainingList({ videos, selectedId, onSelect, isAdmin, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState("");

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? videos.filter((v) =>
          [v.title, v.topic, v.description].some((f) => f.toLowerCase().includes(q)),
        )
      : videos;

    // Порядок уже відсортований бекендом: тема → order
    return filtered.reduce<Record<string, ITrainingVideo[]>>((acc, v) => {
      (acc[v.topic] ??= []).push(v);
      return acc;
    }, {});
  }, [videos, search]);

  const topics = Object.keys(groups);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
      <div className="border-b border-slate-200 p-3 dark:border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук уроку або теми"
            className="pl-9"
          />
        </div>
      </div>

      <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-3">
        {topics.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Нічого не знайдено</p>
        )}

        {topics.map((topic) => (
          <div key={topic} className="space-y-1">
            <h3 className="flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="truncate">{topic}</span>
              <span>{groups[topic].length}</span>
            </h3>

            {groups[topic].map((video, index) => {
              const active = video.id === selectedId;
              return (
                <div
                  key={video.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(video.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(video.id);
                    }
                  }}
                  className={cn(
                    "group flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 text-sm transition-colors",
                    active
                      ? "border-blue-100 bg-blue-50/60 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
                      : "border-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5",
                  )}
                >
                  <PlayCircle
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      active ? "text-blue-500" : "text-slate-400",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={cn("leading-snug", active ? "font-semibold" : "font-medium")}>
                      {index + 1}. {video.title}
                    </p>
                  </div>

                  {isAdmin && (
                    <div className="flex shrink-0 gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                      <button
                        type="button"
                        title="Редагувати"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(video);
                        }}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Видалити"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(video);
                        }}
                        className="rounded-md p-1 text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
