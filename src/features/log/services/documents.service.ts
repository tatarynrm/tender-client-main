import api from "@/shared/api/instance.api";
import { IApiResponse } from "@/shared/api/api.type";
import {
  IDocFile,
  IDocFolder,
  IDocumentsTree,
  IUploadItem,
  IUploadResult,
} from "../documents/types/documents.type";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export const documentsService = {
  getTree: async (): Promise<IApiResponse<IDocumentsTree>> => {
    const { data } = await api.get("/documents");
    return data;
  },

  createFolder: async (payload: { name: string; parentId: string | null }): Promise<IDocFolder> => {
    const { data } = await api.post("/documents/folders", payload);
    return data;
  },

  updateFolder: async (
    id: string,
    payload: { name?: string; parentId?: string | null },
  ): Promise<IDocFolder> => {
    const { data } = await api.patch(`/documents/folders/${id}`, payload);
    return data;
  },

  /** confirm — слово ICT з діалогу; без нього бекенд видаляти відмовиться. */
  deleteFolder: async (id: string, confirm: string) => {
    const { data } = await api.delete(`/documents/folders/${id}`, { params: { confirm } });
    return data as { id: string; deletedFolders: number; deletedFiles: number };
  },

  /** Один запит на пачку файлів; розбиття на пачки — у хуку завантаження. */
  upload: async (
    items: IUploadItem[],
    folderId: string | null,
    onProgress?: (loadedBytes: number) => void,
  ): Promise<IUploadResult> => {
    const formData = new FormData();
    formData.append("folderId", folderId ?? "");
    formData.append("paths", JSON.stringify(items.map((i) => i.path)));
    items.forEach((i) => formData.append("files", i.file));

    const { data } = await api.post("/documents/files", formData, {
      timeout: 0,
      onUploadProgress: (e) => onProgress?.(e.loaded),
    });
    return data;
  },

  updateFile: async (
    id: string,
    payload: { name?: string; folderId?: string | null },
  ): Promise<IDocFile> => {
    const { data } = await api.patch(`/documents/files/${id}`, payload);
    return data;
  },

  deleteFile: async (id: string, confirm: string) => {
    const { data } = await api.delete(`/documents/files/${id}`, { params: { confirm } });
    return data as { id: string };
  },

  /** Для iframe/img і відкриття в новій вкладці — кука сесії йде з запитом. */
  viewUrl: (id: string) => `${SERVER_URL}/documents/files/${id}/view`,
  downloadUrl: (id: string) => `${SERVER_URL}/documents/files/${id}/download`,

  fetchBlob: async (id: string): Promise<Blob> => {
    const { data } = await api.get(`/documents/files/${id}/download`, {
      responseType: "blob",
      timeout: 0,
    });
    return data;
  },
};
