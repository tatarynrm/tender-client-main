"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Plus, User, Video } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { TrainingDeleteDialog } from "./components/TrainingDeleteDialog";
import { TrainingFormDialog } from "./components/TrainingFormDialog";
import { TrainingList } from "./components/TrainingList";
import { TrainingPlayer } from "./components/TrainingPlayer";
import { useTrainings } from "./hooks/useTrainings";
import { ITrainingVideo } from "./types/training.type";

interface Props {
  isAdmin: boolean;
  viewerLabel: string;
}

export default function TrainingPage({ isAdmin, viewerLabel }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: videos = [], isLoading, isError } = useTrainings();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ITrainingVideo | null>(null);
  const [deleting, setDeleting] = useState<ITrainingVideo | null>(null);

  const requestedId = searchParams.get("v");
  const selected = videos.find((v) => v.id === requestedId) ?? videos[0] ?? null;
  const topics = useMemo(() => [...new Set(videos.map((v) => v.topic))], [videos]);

  const selectVideo = (id: string | null) => {
    router.replace(id ? `${pathname}?v=${id}` : pathname, { scroll: false });
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (video: ITrainingVideo) => {
    setEditing(video);
    setFormOpen(true);
  };

  return (
    <div className="space-y-5 p-2 md:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">Навчання</h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              Відеоуроки з роботи в системі · {videos.length} уроків
            </p>
          </div>
        </div>

        {isAdmin && (
          <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
            <Plus className="h-4 w-4" /> Завантажити відео
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Не вдалося завантажити список уроків
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted py-20 text-center">
          <Video className="h-10 w-10 text-muted-foreground/60" />
          <p className="text-muted-foreground">Навчальних відео ще немає</p>
          {isAdmin && (
            <Button variant="outline" onClick={openCreate} className="mt-2 gap-2">
              <Plus className="h-4 w-4" /> Додати перше відео
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-4">
            {selected && <TrainingPlayer video={selected} viewerLabel={viewerLabel} />}

            {selected && (
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-900/60">
                <Badge variant="secondary">{selected.topic}</Badge>
                <h2 className="text-lg font-semibold leading-snug">{selected.title}</h2>
                {selected.description && (
                  <p className="whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
                    {selected.description}
                  </p>
                )}
                <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  {selected.createdBy ?? "—"} ·{" "}
                  {new Date(selected.createdAt).toLocaleDateString("uk-UA")}
                </p>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-0 lg:h-[calc(100vh-9rem)]">
            <TrainingList
              videos={videos}
              selectedId={selected?.id ?? null}
              onSelect={selectVideo}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
          </div>
        </div>
      )}

      {isAdmin && (
        <>
          <TrainingFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            video={editing}
            topics={topics}
            onCreated={selectVideo}
          />
          <TrainingDeleteDialog
            video={deleting}
            onClose={() => setDeleting(null)}
            onDeleted={(id) => id === selected?.id && selectVideo(null)}
          />
        </>
      )}
    </div>
  );
}
