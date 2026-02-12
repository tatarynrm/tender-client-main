"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  FileText,
  Archive,
  Download,
  File as FileIcon,
  Search,
} from "lucide-react";
import Loader from "@/shared/components/Loaders/MainLoader";
import { AppButton } from "@/shared/components/Buttons/AppButton";

interface FileData {
  name: string;
  size: string;
  url: string;
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/files")
      .then((res) => res.json())
      .then((data: FileData[]) => {
        if (Array.isArray(data)) setFiles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Помилка завантаження:", err);
        setLoading(false);
      });
  }, []);

  const getFileMeta = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return {
          icon: <FileText className="w-5 h-5 text-red-400" />,
          group: "Документи PDF",
        };
      case "doc":
      case "docx":
        return {
          icon: <FileText className="w-5 h-5 text-blue-400" />,
          group: "Файли Word",
        };
      case "zip":
      case "rar":
        return {
          icon: <Archive className="w-5 h-5 text-orange-400" />,
          group: "Архіви",
        };
      default:
        return {
          icon: <FileIcon className="w-5 h-5 text-gray-400" />,
          group: "Інші файли",
        };
    }
  };

  const groupedFiles = useMemo(() => {
    return files.reduce(
      (acc, file) => {
        const { group } = getFileMeta(file.name);
        if (!acc[group]) acc[group] = [];
        acc[group].push(file);
        return acc;
      },
      {} as Record<string, FileData[]>,
    );
  }, [files]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 p-4 md:p-6 min-h-screen text-foreground animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-center md:text-left">
          Файловий менеджер
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
          Згруповано за типом • {files.length} файлів
        </p>
      </div>

      {Object.keys(groupedFiles).length > 0 ? (
        Object.entries(groupedFiles).map(([groupName, groupFiles]) => (
          <div
            key={groupName}
            className="space-y-3 animate-in slide-in-from-bottom-2 duration-500"
          >
            <h2 className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
              {groupName}
            </h2>

            {/* Контейнер: на мобільці без бордерів для економії місця, на десктопі - таблиця */}
            <div className="md:rounded-xl md:border  md:shadow-sm overflow-hidden">
              <div className="hidden md:block">
                {/* ДЕСТОПНА ТАБЛИЦЯ */}
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {groupFiles.map((file) => {
                      const { icon } = getFileMeta(file.name);
                      return (
                        <tr
                          key={file.name}
                          className="hover:bg-muted/30 transition-colors group"
                        >
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                              {icon}
                              <span className="font-medium truncate max-w-md">
                                {file.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 align-middle text-muted-foreground w-32">
                            {file.size}
                          </td>
                          <td className="p-4 align-middle text-right w-40">
                            <a href={file.url} download={file.name}>
                              <AppButton
                                variant="outline"
                                size="sm"
                                className="gap-2 h-8"
                              >
                                <Download className="w-4 h-4" /> Скачати
                              </AppButton>
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* МОБІЛЬНИЙ СПИСОК (CARDS) */}
              <div className="grid grid-cols-1 gap-2 md:hidden">
                {groupFiles.map((file) => {
                  const { icon } = getFileMeta(file.name);
                  return (
                    <div
                      key={file.name}
                      className="flex items-center justify-between p-3  border rounded-lg active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex-shrink-0 p-2 bg-muted rounded-md">
                          {icon}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium truncate pr-2">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {file.size}
                          </span>
                        </div>
                      </div>
                      <a
                        href={file.url}
                        download={file.name}
                        className="flex-shrink-0 ml-2"
                      >
                        <AppButton
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 rounded-full"
                        >
                          <Download className="w-4 h-4" />
                        </AppButton>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl border-muted opacity-50">
          <Search className="w-10 h-10 mb-2" />
          <p className="text-muted-foreground">Файлів не знайдено</p>
        </div>
      )}

      <div className="text-[10px] text-muted-foreground/50 text-center pt-10 uppercase tracking-widest">
        End of list
      </div>
    </div>
  );
}
