import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Paperclip,
  FileText,
  Image as ImageIcon,
  FileArchive,
  FileIcon,
  Download,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui";


interface FileItem {
  id: number | string;
  display_name: string;
  url: string;
  extension: string;
  file_size?: number;
  [key: string]: any;
}

interface FilesPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileItem[];
  title?: string;
}

const getFileIcon = (ext: string) => {
  const e = ext.toLowerCase();
  switch (e) {
    case "pdf": return <FileText className="text-red-500" />;
    case "doc":
    case "docx": return <FileText className="text-blue-500" />;
    case "xls":
    case "xlsx": return <FileText className="text-green-500" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "webp": return <ImageIcon className="text-purple-500" />;
    case "zip":
    case "rar": return <FileArchive className="text-orange-500" />;
    default: return <FileIcon className="text-gray-500" />;
  }
};

const isImage = (url: string) => {
  const ext = url.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "");
};

const isPdf = (url: string) => {
  const ext = url.split(".").pop()?.toLowerCase();
  return ext === "pdf";
};

import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Loader2 } from "lucide-react";

export function FilesPreviewModal({ isOpen, onClose, files, title = "Документи" }: FilesPreviewModalProps) {
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const groupedFiles = useMemo(() => {
    return files.reduce((acc, file) => {
      const ext = (file.extension || file.display_name.split(".").pop() || "other").toUpperCase();
      if (!acc[ext]) acc[ext] = [];
      acc[ext].push(file);
      return acc;
    }, {} as Record<string, FileItem[]>);
  }, [files]);

  const allFilesList = useMemo(() => files, [files]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePreviewIndex === null) return;
    setActivePreviewIndex((prev) => (prev !== null && prev < allFilesList.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePreviewIndex === null) return;
    setActivePreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : allFilesList.length - 1));
  };

  const handleDownloadAll = async () => {
    if (files.length === 0 || isDownloading) return;
    
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
      
      const downloadPromises = files.map(async (file) => {
        try {
          // Використовуємо проксі на бекенді, щоб обійти CORS при завантаженні з S3
          const proxyUrl = `${serverUrl}/files/proxy?url=${encodeURIComponent(file.url)}`;
          const response = await fetch(proxyUrl);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const blob = await response.blob();
          zip.file(file.display_name, blob);
        } catch (error) {
          console.error(`Failed to download ${file.display_name}:`, error);
        }
      });

      await Promise.all(downloadPromises);
      
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `Documents_${title.replace(/\s+/g, "_")}.zip`);
    } catch (error) {
      console.error("Failed to create archive:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      if (activePreviewIndex !== null) {
        setActivePreviewIndex(null);
      } else {
        onClose();
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape" && activePreviewIndex !== null) {
        e.preventDefault();
        e.stopPropagation();
        setActivePreviewIndex(null);
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [activePreviewIndex, isOpen, allFilesList.length]);

  const previewFile = activePreviewIndex !== null ? allFilesList[activePreviewIndex] : null;

  if (!mounted) return null;

  return createPortal(
    <>
      <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-2 bg-white dark:bg-zinc-950 scrollbar-none no-scrollbar transition-all duration-300">
          <DialogHeader className="flex flex-row items-center justify-between gap-4 pr-12 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-20 p-4 rounded-t-3xl border-b border-zinc-100 dark:border-zinc-800/50">
            <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-zinc-800 dark:text-zinc-100">
              <Paperclip className="text-indigo-600 dark:text-indigo-400" />
              {title}
            </DialogTitle>
            
            {files.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-2xl border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 font-black text-[10px] gap-2 h-9 px-4 uppercase transition-all active:scale-95"
                onClick={handleDownloadAll}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Download size={14} />
                )}
                ЗАВАНТАЖИТИ ВСЕ (.ZIP)
              </Button>
            )}
          </DialogHeader>

          <div className="space-y-8 p-4">
            {Object.entries(groupedFiles).map(([ext, items]) => (
              <div key={ext} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] whitespace-nowrap bg-zinc-50 dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-800">
                    {ext} ({items.length})
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-zinc-100 dark:from-zinc-800 to-transparent" />
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {items.map((file) => {
                    const globalIdx = allFilesList.findIndex(f => f.id === file.id);
                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3.5 bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-white dark:hover:bg-zinc-900 border border-zinc-100/50 dark:border-zinc-800/50 rounded-2xl transition-all duration-300 group ring-1 ring-transparent hover:ring-indigo-500/10 dark:hover:ring-indigo-500/20 shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-700/50 group-hover:scale-110 transition-transform duration-300">
                            {getFileIcon(file.extension || "")}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold truncate text-zinc-700 dark:text-zinc-200">
                              {file.display_name}
                            </span>
                            {file.file_size && (
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                                {(file.file_size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                          {(isImage(file.url) || isPdf(file.url)) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl gap-1.5 text-[10px] font-black uppercase tracking-wider"
                              onClick={() => setActivePreviewIndex(globalIdx)}
                            >
                              <Eye size={14} strokeWidth={3} />
                              ДИВИТИСЬ
                            </Button>
                          )}
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink size={14} />
                            </a>
                          </Button>
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                            <a href={file.url} download={file.display_name}>
                              <Download size={14} />
                            </a>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {files.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-800 gap-4">
                <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
                  <FileIcon size={64} strokeWidth={1} />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">Файлів не знайдено</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Slider View Overlay */}
      {previewFile && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePreviewIndex(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6 z-[100001] rounded-full bg-white/10 hover:bg-white/20 text-white"
            onClick={() => setActivePreviewIndex(null)}
          >
            <X size={24} />
          </Button>

          {allFilesList.length > 1 && (
            <>
              <button
                className="absolute left-6 top-1/2 -translate-y-1/2 z-[100001] p-4 text-white/50 hover:text-white transition-all outline-none"
                onClick={handlePrev}
              >
                <ChevronLeft size={64} strokeWidth={1} />
              </button>
              <button
                className="absolute right-6 top-1/2 -translate-y-1/2 z-[100001] p-4 text-white/50 hover:text-white transition-all outline-none"
                onClick={handleNext}
              >
                <ChevronRight size={64} strokeWidth={1} />
              </button>
            </>
          )}

          <div className="w-full h-full flex flex-col items-center justify-center p-10 select-none">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center space-y-1">
              <h3 className="text-white font-bold text-sm tracking-tight">{previewFile.display_name}</h3>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                {activePreviewIndex! + 1} / {allFilesList.length}
              </p>
            </div>

            <div
              className="w-full h-full flex items-center justify-center animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {isImage(previewFile.url) ? (
                <img
                  src={previewFile.url}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              ) : isPdf(previewFile.url) ? (
                <div className="w-full h-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl">
                  <iframe src={`${previewFile.url}#toolbar=0`} className="w-full h-full border-none" />
                </div>
              ) : (
                <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 flex flex-col items-center gap-6 text-white text-center">
                  <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                    <FileIcon size={48} />
                  </div>
                  <p className="text-lg font-bold">Цей формат не підтримує швидкий перегляд</p>
                  <Button asChild className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl h-12 px-8">
                    <a href={previewFile.url} download={previewFile.display_name}>Завантажити</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
