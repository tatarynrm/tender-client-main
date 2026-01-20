"use client";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Eye,
  FileText,
  Trash2,
  AlertCircle,
  Edit3,
} from "lucide-react";
import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { Control, useController } from "react-hook-form";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

// Розширюємо стандартний File для підтримки прев'ю та кастомного імені
interface CustomFile extends File {
  preview?: string;
  displayName?: string;
}

interface Props {
  control: Control<any>;
  name: string;
  label?: string;
  multiple?: boolean;
  accept?: Accept;
  maxSize?: number;
  maxFiles?: number;
}

const TOTAL_SIZE_LIMIT = 104857600; // 100MB

const getFileInfo = (file: File) => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const type = file.type;
  if (type.startsWith("image/"))
    return {
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      label: "IMG",
      group: "Зображення",
    };
  if (type.startsWith("video/"))
    return {
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      label: "VIDEO",
      group: "Медіа",
    };
  if (type.startsWith("audio/"))
    return {
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      label: "AUDIO",
      group: "Медіа",
    };
  if (type === "application/pdf")
    return {
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      label: "PDF",
      group: "Документи",
    };
  return {
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    label: ext.toUpperCase() || "FILE",
    group: "Інше",
  };
};

export function RHFFileInput({
  control,
  name,
  label,
  multiple = false,
  accept,
  maxSize = 52428800,
  maxFiles = 50,
}: Props) {
  const { config } = useFontSize();
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ name, control });

  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showSizeModal, setShowSizeModal] = useState<{
    show: boolean;
    name: string;
  } | null>(null);

  // Кастуємо значення до нашого типу
  const files: CustomFile[] = useMemo(
    () => (Array.isArray(value) ? value : []),
    [value],
  );

  const totalSize = useMemo(
    () => files.reduce((acc, f) => acc + f.size, 0),
    [files],
  );
  const totalSizeProgress = (totalSize / TOTAL_SIZE_LIMIT) * 100;

  const allowedExtensions = useMemo(() => {
    if (!accept) return null;
    return Object.values(accept)
      .flat()
      .join(", ")
      .replace(/\./g, "")
      .toUpperCase();
  }, [accept]);

  const handlePrev = useCallback(() => {
    if (viewIndex === null || !files.length) return;
    setViewIndex(viewIndex > 0 ? viewIndex - 1 : files.length - 1);
  }, [viewIndex, files]);

  const handleNext = useCallback(() => {
    if (viewIndex === null || !files.length) return;
    setViewIndex(viewIndex < files.length - 1 ? viewIndex + 1 : 0);
  }, [viewIndex, files]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewIndex === null) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setViewIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewIndex, handlePrev, handleNext]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const fileTooLarge = rejectedFiles.find((f) =>
          f.errors.find((e: any) => e.code === "file-too-large"),
        );
        if (fileTooLarge) {
          setShowSizeModal({ show: true, name: fileTooLarge.file.name });
          return;
        }
      }

      const incomingSize = acceptedFiles.reduce(
        (acc, file) => acc + file.size,
        0,
      );
      if (totalSize + incomingSize > TOTAL_SIZE_LIMIT) {
        setShowSizeModal({ show: true, name: "Загальний ліміт 100MB" });
        return;
      }

      const newFiles = acceptedFiles.map((file) => {
        const customFile = file as CustomFile;
        customFile.preview = URL.createObjectURL(file);
        // Використовуємо оригінальне ім'я як початкове для відображення
        customFile.displayName =
          file.name.split(".").slice(0, -1).join(".") || file.name;
        return customFile;
      });

      onChange(
        multiple ? [...files, ...newFiles].slice(0, maxFiles) : [newFiles[0]],
      );
    },
    [onChange, files, multiple, maxFiles, totalSize],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxSize,
  });

  const removeFile = (index: number) => {
    const updated = [...files];
    if (updated[index]?.preview) URL.revokeObjectURL(updated[index].preview!);
    updated.splice(index, 1);
    onChange(updated);
    if (viewIndex === index) setViewIndex(null);
    else if (viewIndex !== null && viewIndex > index)
      setViewIndex(viewIndex - 1);
  };

  const updateFileName = (index: number, newName: string) => {
    const updated = [...files];
    updated[index].displayName = newName;
    onChange(updated);
  };

  const groupedFiles = useMemo(() => {
    if (!files.length) return null;
    return files.reduce((acc: any, file, index) => {
      const info = getFileInfo(file);
      if (!acc[info.group]) acc[info.group] = [];
      acc[info.group].push({ file, originalIndex: index, info });
      return acc;
    }, {});
  }, [files]);

  return (
    <div className="space-y-4">
      {label && (
        <h3
          className={`${config.label} text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-bold px-2`}
        >
          {label}
        </h3>
      )}

      {/* DROPZONE */}
      <div
        {...getRootProps()}
        className={`group relative border-2 border-dashed rounded-[2.5rem] p-10 transition-all duration-300 flex flex-col items-center justify-center
        bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-sm
        ${isDragActive ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 scale-[0.99]" : "hover:border-slate-300 dark:hover:border-white/20 hover:bg-white/80 dark:hover:bg-slate-900/60"}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className={`w-14 h-14 rounded-2xl shadow-inner flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 
            ${totalSize >= TOTAL_SIZE_LIMIT ? "bg-slate-200 text-slate-400" : "bg-blue-500 text-white shadow-blue-500/20"}`}
          >
            <Upload size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              {totalSize >= TOTAL_SIZE_LIMIT
                ? "Ліміт заповнено"
                : "Перетягніть файли сюди"}
            </p>
            <div className="mt-2 flex flex-col items-center gap-1">
              <span className="text-[10px] text-blue-500 dark:text-blue-400 font-black uppercase tracking-tighter bg-blue-500/10 px-3 py-1 rounded-full">
                {allowedExtensions ? allowedExtensions : "УСІ ФОРМАТИ"}
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
                Максимум {(maxSize / 1024 / 1024).toFixed(0)}MB на файл
              </span>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="absolute bottom-6 right-8 flex flex-col items-end gap-1.5">
          <span
            className={`text-[10px] font-black tracking-tighter ${totalSize > TOTAL_SIZE_LIMIT * 0.9 ? "text-rose-500" : "text-slate-500 dark:text-slate-400"}`}
          >
            {(totalSize / 1024 / 1024).toFixed(1)}{" "}
            <span className="opacity-40">/ 100 MB</span>
          </span>
          <div className="w-20 h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${totalSizeProgress > 90 ? "bg-rose-500" : "bg-blue-500"}`}
              style={{ width: `${Math.min(totalSizeProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-rose-500 text-[10px] font-black uppercase px-6 animate-pulse">
          ✕ {error?.message}
        </p>
      )}

      {/* FILE GROUPS */}
      {groupedFiles &&
        Object.entries(groupedFiles).map(([group, items]: [string, any]) => (
          <div key={group} className="space-y-3 pt-2">
            <div className="flex items-center gap-4 px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                {group}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {items.map(({ file, originalIndex, info }: any) => (
                <div
                  key={originalIndex}
                  className="group relative flex flex-col gap-2"
                >
                  <div className="relative aspect-square rounded-[1.5rem] overflow-hidden border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md shadow-sm transition-all hover:scale-105 hover:shadow-xl">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={file.preview}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex flex-col items-center justify-center gap-1 ${info.bg} ${info.color}`}
                      >
                        <FileText size={24} />
                        <span className="text-[10px] font-black">
                          {info.label}
                        </span>
                      </div>
                    )}
                    {/* Actions Overlays */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewIndex(originalIndex)}
                        className="w-9 h-9 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl flex items-center justify-center shadow-lg"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFile(originalIndex)}
                        className="w-9 h-9 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Editable Display Name */}
                  <div className="px-1 flex items-center justify-between group/name min-h-[32px]">
                    {editingIndex === originalIndex ? (
                      <div className="w-full z-10 transition-all">
                        <input
                          autoFocus
                          className="w-full bg-white dark:bg-slate-800 rounded-xl px-3 py-2 text-[12px] font-bold 
                   text-blue-600 dark:text-blue-400 outline-none border-2 border-blue-500 
                   shadow-lg shadow-blue-500/10"
                          value={file.displayName}
                          onChange={(e) =>
                            updateFileName(originalIndex, e.target.value)
                          }
                          onBlur={() => setEditingIndex(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") setEditingIndex(null);
                            if (e.key === "Escape") setEditingIndex(null);
                          }}
                          // Автоматично виділяє текст при фокусі для швидкого редагування
                          onFocus={(e) => e.target.select()}
                        />
                      </div>
                    ) : (
                      <>
                        <div
                          className="flex-1 cursor-pointer group-hover/name:bg-slate-100 dark:group-hover/name:bg-white/5 rounded-lg px-2 py-1 transition-colors overflow-hidden"
                          onClick={() => setEditingIndex(originalIndex)}
                        >
                          <p className="text-[10px] font-black uppercase tracking-tighter text-slate-500 dark:text-slate-400 truncate">
                            {file.displayName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingIndex(originalIndex)}
                          className="ml-1 p-1.5 text-slate-400 opacity-0 group-hover/name:opacity-100 hover:text-blue-500 transition-all"
                        >
                          <Edit3 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      {/* MODAL: SIZE ERROR */}
      {showSizeModal?.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={() => setShowSizeModal(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl transform animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center animate-bounce">
                <AlertCircle size={32} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  Файл завеликий
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Файл{" "}
                  <span className="font-bold text-rose-500">
                    "{showSizeModal.name}"
                  </span>{" "}
                  перевищує допустиму норму.
                </p>
              </div>
              <button
                onClick={() => setShowSizeModal(null)}
                className="mt-4 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em]"
              >
                Зрозуміло
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX (PREVIEW) */}
      {viewIndex !== null && files[viewIndex] && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-between py-10 px-6 animate-in fade-in duration-300">
          <button
            onClick={() => setViewIndex(null)}
            className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10 transition-all border border-white/10 z-[110]"
          >
            <X size={24} />
          </button>

          <div className="flex-1 flex items-center justify-center w-full max-w-6xl relative">
            <button
              onClick={handlePrev}
              className="absolute left-0 p-6 text-white/20 hover:text-white transition-all hover:scale-125 z-20"
            >
              <ArrowLeft size={48} strokeWidth={1} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 p-6 text-white/20 hover:text-white transition-all hover:scale-125 z-20"
            >
              <ArrowRight size={48} strokeWidth={1} />
            </button>

            <div className="w-full h-full flex items-center justify-center p-4">
              {files[viewIndex].type.startsWith("image/") ? (
                <img
                  src={files[viewIndex].preview}
                  className="max-w-full max-h-[70vh] object-contain rounded-[2.5rem] shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500"
                  alt=""
                />
              ) : files[viewIndex].type.startsWith("video/") ? (
                <video
                  controls
                  autoPlay
                  src={files[viewIndex].preview}
                  className="max-w-full max-h-[70vh] rounded-[2.5rem] shadow-2xl border border-white/10"
                />
              ) : (
                <div className="bg-slate-900 border border-white/5 p-10 md:p-20 rounded-[3rem] text-center shadow-2xl">
                  <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FileText size={48} />
                  </div>
                  <p className="text-white text-lg font-bold truncate mx-auto max-w-sm">
                    {files[viewIndex].displayName}
                  </p>
                  <a
                    href={files[viewIndex].preview}
                    download={files[viewIndex].name}
                    className="mt-8 inline-block bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-colors"
                  >
                    Завантажити файл
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Thumbnails */}
          <div className="w-full max-w-4xl px-4 flex flex-col items-center gap-6">
            <div className="flex gap-3 p-3 bg-white/5 border border-white/10 rounded-[2rem] overflow-x-auto no-scrollbar max-w-full backdrop-blur-xl">
              {files.map((f, idx) => (
                <button
                  key={idx}
                  onClick={() => setViewIndex(idx)}
                  className={`relative min-w-[60px] h-[60px] rounded-2xl overflow-hidden border-2 transition-all duration-300 ${viewIndex === idx ? "border-blue-500 scale-110 shadow-lg" : "border-transparent opacity-30 hover:opacity-100"}`}
                >
                  {f.type.startsWith("image/") ? (
                    <img
                      src={f.preview}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center text-[10px] font-black ${getFileInfo(f).bg} ${getFileInfo(f).color}`}
                    >
                      {getFileInfo(f).label}
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4">
              <span>
                {viewIndex + 1} / {files.length}
              </span>
              <span className="w-1 h-1 bg-slate-700 rounded-full" />
              <span className="text-white/60 truncate max-w-[200px]">
                {files[viewIndex].displayName}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
