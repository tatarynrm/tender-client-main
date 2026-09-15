import { useState } from "react";
import { toast } from "sonner";
import { documentsService } from "../../services/documents.service";
import { IDocFile } from "../types/documents.type";
import { docErrorMessage } from "../utils/documents.utils";

export interface ZipEntry {
  file: IDocFile;
  /** Шлях усередині архіву, напр. «ФОП Іванов/Виписка.pdf» */
  path: string;
}

const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

/** Архів збирається в браузері (jszip) — бекенду не потрібна окрема логіка. */
export const useDownloadZip = () => {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const downloadZip = async (entries: ZipEntry[], archiveName: string) => {
    if (!entries.length) {
      toast.info("Немає файлів для скачування");
      return;
    }
    if (progress) return;

    setProgress({ done: 0, total: entries.length });
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();

      for (let i = 0; i < entries.length; i++) {
        const blob = await documentsService.fetchBlob(entries[i].file.id);
        zip.file(entries[i].path, blob);
        setProgress({ done: i + 1, total: entries.length });
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveBlob(content, `${archiveName}.zip`);
    } catch (error) {
      toast.error(docErrorMessage(error, "Не вдалося сформувати архів"));
    } finally {
      setProgress(null);
    }
  };

  return { downloadZip, zipProgress: progress };
};
