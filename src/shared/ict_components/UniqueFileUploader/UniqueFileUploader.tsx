"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileIcon,
  X,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileArchive,
  FileCode,
  CheckCircle2,
  ExternalLink,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { useModalStore } from "@/shared/stores/useModalStore";

import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";

interface FileWithPreview extends File {
  preview?: string;
  id?: string | number; // For existing files from server
  url?: string;
}

interface UniqueFileUploaderProps {
  files: (File | any)[];
  onChange: (files: (File | any)[]) => void;
  onRemove?: (file: any) => void;
  maxFiles?: number;
  allowedTypes?: string[]; // e.g. ['image/*', 'application/pdf']
  label?: string;
  description?: string;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return <FileText className="text-red-500" />;
    case "doc":
    case "docx":
      return <FileText className="text-blue-500" />;
    case "xls":
    case "xlsx":
      return <FileText className="text-green-500" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "webp":
      return <ImageIcon className="text-purple-500" />;
    case "zip":
    case "rar":
      return <FileArchive className="text-orange-500" />;
    default:
      return <FileIcon className="text-gray-500" />;
  }
};

export function UniqueFileUploader({
  files,
  onChange,
  onRemove,
  maxFiles = 10,
  allowedTypes = [],
  label = "",
  description = "Перетягніть файли сюди або натисніть для вибору",
}: UniqueFileUploaderProps) {
  const { confirm } = useModalStore();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const previewFile = previewIndex !== null ? files[previewIndex] : null;

  const handleNext = useCallback(() => {
    if (previewIndex === null) return;
    setPreviewIndex((prev) =>
      prev !== null && prev < files.length - 1 ? prev + 1 : 0,
    );
  }, [previewIndex, files.length]);

  const handlePrev = useCallback(() => {
    if (previewIndex === null) return;
    setPreviewIndex((prev) =>
      prev !== null && prev > 0 ? prev - 1 : files.length - 1,
    );
  }, [previewIndex, files.length]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (previewIndex === null) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") setPreviewIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewIndex, handleNext, handlePrev]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      onChange(newFiles);
    },
    [files, maxFiles, onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
    maxFiles: maxFiles - files.length,
    disabled: files.length >= maxFiles,
  });

  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
    if (onRemove) onRemove(fileToRemove);
  };

  const isImage = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "");
  };

  const isPdf = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ext === "pdf";
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-sm font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-tight">
            {label}
          </label>
        )}
        {files.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 gap-2 font-black text-[10px] uppercase tracking-wider transition-all"
            onClick={(e) => {
              e.stopPropagation();
              confirm({
                title: "Очистити всі файли?",
                description:
                  "Ви впевнені, що хочете видалити всі завантажені документи? Цю дію неможливо буде скасувати.",
                confirmText: "Видалити все",
                variant: "danger",
                onConfirm: () => {
                  // If there are files with IDs (already on server), we should ideally call onRemove for each
                  // but for simplicity of the UI state, we clear everything.
                  // Most of our forms handle onRemove manually or sync on save.
                  files.forEach((file) => {
                    if (onRemove) onRemove(file);
                  });
                  onChange([]);
                },
              });
            }}
          >
            <Trash2 size={14} />
            Очистити все
          </Button>
        )}
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3",
          isDragActive
            ? "border-teal-500 bg-teal-50"
            : "border-gray-200 hover:border-teal-400 hover:bg-gray-50/50",
          files.length >= maxFiles &&
            "opacity-50 cursor-not-allowed pointer-events-none",
        )}
      >
        <input {...getInputProps()} />
        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
          <UploadCloud size={24} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">{description}</p>
          <p className="text-xs text-gray-500 mt-1">
            {files.length} з {maxFiles} файлів завантажено
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm group hover:border-teal-200 transition-colors"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex-shrink-0">
                  {getFileIcon(file.name || file.display_name || "")}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {file.name || file.display_name}
                  </span>
                  <span className="text-xs text-gray-500 uppercase">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {file.url && (
                  <div className="flex items-center gap-2">
                    {(isImage(file.url) || isPdf(file.url)) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-teal-600 hover:bg-teal-50 gap-1"
                        onClick={() => setPreviewIndex(idx)}
                      >
                        <Eye size={14} />
                        Переглянути
                      </Button>
                    )}
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-teal-600 transition-colors"
                      title="Відкрити в новій вкладці"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* --- PREVIEW SLIDER MODAL --- */}
      {previewFile && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewIndex(null)}
        >
          {/* Close - Top Right for Desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-[10000] rounded-full bg-white/10 hover:bg-white/20 text-white hidden md:flex"
            onClick={() => setPreviewIndex(null)}
          >
            <X size={24} />
          </Button>

          {/* Navigation - Sidebar for Desktop */}
          {files.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[10000] p-4 text-white/50 hover:text-white transition-all hidden md:block"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
              >
                <ChevronLeft size={48} strokeWidth={1} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[10000] p-4 text-white/50 hover:text-white transition-all hidden md:block"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
              >
                <ChevronRight size={48} strokeWidth={1} />
              </button>
            </>
          )}

          <div
            className="relative w-full h-full md:h-[90vh] md:max-w-6xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-black/40 md:bg-transparent text-white border-b border-white/10 md:border-none">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-white/10 rounded-xl">
                  {getFileIcon(
                    previewFile.name || previewFile.display_name || "",
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold truncate">
                    {previewFile.name || previewFile.display_name}
                  </span>
                  <span className="text-[10px] text-white/50 uppercase font-black tracking-widest">
                    {previewIndex! + 1} / {files.length}
                  </span>
                </div>
              </div>

              {/* Mobile Close */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full md:hidden text-white"
                onClick={() => setPreviewIndex(null)}
              >
                <X size={20} />
              </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex items-center justify-center p-2 md:p-10">
              {isImage(previewFile.url || "") ? (
                <img
                  src={previewFile.url}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                />
              ) : isPdf(previewFile.url || "") ? (
                <div className="w-full h-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-2xl">
                  <iframe
                    src={`${previewFile.url}#toolbar=0`}
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-center text-white">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                    <FileIcon size={48} className="text-teal-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-bold">
                      Цей формат не підтримує швидкий перегляд
                    </p>
                    <p className="text-sm text-white/50">
                      Ви можете завантажити файл, щоб переглянути його локально
                    </p>
                  </div>
                  <Button
                    asChild
                    className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-12 px-8"
                  >
                    <a
                      href={previewFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <Download size={18} />
                      Завантажити файл
                    </a>
                  </Button>
                </div>
              )}
            </div>

            {/* Bottom Mobile Navigation */}
            {files.length > 1 && (
              <div className="flex md:hidden items-center justify-between p-6 bg-black/40 border-t border-white/10">
                <Button
                  variant="ghost"
                  className="text-white gap-2"
                  onClick={handlePrev}
                >
                  <ChevronLeft size={20} /> Назад
                </Button>
                <span className="text-xs text-white/50 font-black">
                  {previewIndex! + 1} / {files.length}
                </span>
                <Button
                  variant="ghost"
                  className="text-white gap-2"
                  onClick={handleNext}
                >
                  Далі <ChevronRight size={20} />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
