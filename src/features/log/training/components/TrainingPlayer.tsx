"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2, Maximize, Minimize } from "lucide-react";
import { cn } from "@/shared/utils";
import { trainingService } from "../../services/training.service";
import { ITrainingVideo } from "../types/training.type";

const MAX_SOURCE_RETRIES = 2;
const WATERMARK_MOVE_MS = 12_000;

interface Props {
  video: ITrainingVideo;
  /** Хто дивиться — пишеться водяним знаком поверх відео. */
  viewerLabel: string;
}

/**
 * Плеєр без можливості скачати штатними засобами:
 * - відео віддається лише шматками через захищений стрім (сесія + токен на 2 год);
 * - у плеєрі немає кнопки скачування, PiP і контекстного меню;
 * - на весь екран розгортається контейнер, а не <video>, щоб водяний знак лишався видимим.
 * Запис екрана цим не заблокувати — для цього й водяний знак з ім'ям працівника.
 */
export function TrainingPlayer({ video, viewerLabel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const retriesRef = useRef(0);
  const wasPlayingRef = useRef(false);
  const resumeRef = useRef<{ time: number; play: boolean } | null>(null);

  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mark, setMark] = useState({ top: 8, left: 6 });

  // Новий токен при зміні відео
  useEffect(() => {
    let cancelled = false;
    retriesRef.current = 0;
    resumeRef.current = null;
    setSrc(null);
    setError(null);

    trainingService
      .getStreamToken(video.id)
      .then(({ token }) => {
        if (!cancelled) setSrc(trainingService.getStreamUrl(video.id, token));
      })
      .catch(() => {
        if (!cancelled) setError("Не вдалося отримати доступ до відео");
      });

    return () => {
      cancelled = true;
    };
  }, [video.id]);

  // Водяний знак переміщується, щоб його не можна було просто обрізати
  useEffect(() => {
    const timer = setInterval(() => {
      setMark({ top: 5 + Math.random() * 78, left: 4 + Math.random() * 60 });
    }, WATERMARK_MOVE_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current?.requestFullscreen().catch(() => {});
    }
  };

  // Токен прострочився або обірвалась мережа — беремо новий і продовжуємо з того ж місця
  const handleError = async () => {
    const el = videoRef.current;
    if (!el) return;
    if (retriesRef.current >= MAX_SOURCE_RETRIES) {
      setError("Не вдалося відтворити відео. Оновіть сторінку.");
      return;
    }
    retriesRef.current += 1;
    resumeRef.current = { time: el.currentTime, play: wasPlayingRef.current };

    try {
      const { token } = await trainingService.getStreamToken(video.id);
      setSrc(trainingService.getStreamUrl(video.id, token));
    } catch {
      setError("Не вдалося отримати доступ до відео");
    }
  };

  const handleLoadedMetadata = () => {
    const el = videoRef.current;
    const resume = resumeRef.current;
    if (!el || !resume) return;
    resumeRef.current = null;
    el.currentTime = resume.time;
    if (resume.play) el.play().catch(() => {});
  };

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "group relative w-full overflow-hidden bg-black select-none",
        isFullscreen ? "h-full" : "aspect-video rounded-2xl shadow-lg",
      )}
    >
      {src && !error && (
        <video
          key={video.id}
          ref={videoRef}
          src={src}
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          onDoubleClick={toggleFullscreen}
          onError={handleError}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => (wasPlayingRef.current = true)}
          onPause={() => (wasPlayingRef.current = false)}
          onPlaying={() => (retriesRef.current = 0)}
          className="h-full w-full object-contain"
        />
      )}

      {!src && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-white/70">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-white/80">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Водяний знак */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-10 whitespace-nowrap text-xs font-semibold text-white/35 transition-all duration-[2000ms] ease-in-out [text-shadow:0_1px_2px_rgba(0,0,0,0.6)] sm:text-sm"
        style={{ top: `${mark.top}%`, left: `${mark.left}%` }}
      >
        {viewerLabel}
      </div>

      <button
        type="button"
        onClick={toggleFullscreen}
        title={isFullscreen ? "Вийти з повноекранного режиму" : "На весь екран"}
        className="absolute right-3 top-3 z-20 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur transition-opacity hover:bg-black/70 focus-visible:opacity-100 group-hover:opacity-100"
      >
        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </button>
    </div>
  );
}
