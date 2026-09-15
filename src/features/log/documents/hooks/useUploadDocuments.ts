import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { documentsService } from "../../services/documents.service";
import { IUploadItem } from "../types/documents.type";
import {
  DOC_UPLOAD_BATCH,
  docErrorMessage,
  filterUploadItems,
} from "../utils/documents.utils";
import { DOCUMENTS_QUERY_KEY } from "./useDocuments";

export interface UploadState {
  total: number;
  done: number;
  totalBytes: number;
  loadedBytes: number;
  targetName: string;
}

/**
 * Завантаження пачками по DOC_UPLOAD_BATCH файлів — бекенд приймає до 200 за раз,
 * а маленькі пачки дають плавний прогрес. Проміжні папки бекенд перевикористовує
 * за назвою, тож структура між пачками не дублюється.
 */
export const useUploadDocuments = () => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<UploadState | null>(null);

  const upload = async (rawItems: IUploadItem[], folderId: string | null, targetName: string) => {
    if (state) {
      toast.warning("Дочекайтесь завершення поточного завантаження");
      return;
    }

    const { accepted, unsupported, tooLarge } = filterUploadItems(rawItems);
    if (unsupported.length) {
      toast.warning(`Пропущено непідтримуваних файлів: ${unsupported.length}`, {
        description: unsupported.slice(0, 5).join(", ") + (unsupported.length > 5 ? "…" : ""),
      });
    }
    if (tooLarge.length) {
      toast.warning(`Пропущено файлів понад 200 МБ: ${tooLarge.length}`, {
        description: tooLarge.slice(0, 5).join(", "),
      });
    }
    if (!accepted.length) return;

    const totalBytes = accepted.reduce((sum, i) => sum + i.file.size, 0);
    setState({ total: accepted.length, done: 0, totalBytes, loadedBytes: 0, targetName });

    let uploadedBytes = 0;
    let uploaded = 0;
    let createdFolders = 0;

    try {
      for (let start = 0; start < accepted.length; start += DOC_UPLOAD_BATCH) {
        const batch = accepted.slice(start, start + DOC_UPLOAD_BATCH);
        const batchBytes = batch.reduce((sum, i) => sum + i.file.size, 0);

        const res = await documentsService.upload(batch, folderId, (loaded) =>
          setState((s) =>
            s && { ...s, loadedBytes: uploadedBytes + Math.min(loaded, batchBytes) },
          ),
        );

        uploadedBytes += batchBytes;
        uploaded += res.files.length;
        createdFolders += res.createdFolders;
        setState((s) => s && { ...s, done: uploaded, loadedBytes: uploadedBytes });
      }

      toast.success(`Завантажено файлів: ${uploaded}`, {
        description: createdFolders ? `Створено папок: ${createdFolders}` : undefined,
      });
    } catch (error) {
      toast.error(docErrorMessage(error, "Помилка завантаження"), {
        description: uploaded ? `Встигли завантажитись ${uploaded} з ${accepted.length}` : undefined,
      });
    } finally {
      setState(null);
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    }
  };

  return { upload, state };
};
