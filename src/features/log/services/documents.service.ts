import api from "@/shared/api/instance.api";
import { IApiResponse } from "@/shared/api/api.type";
import { XHR_HEADERS } from "@/shared/api/xhr.headers";
import {
  IDocFile,
  IDocFolder,
  IDocumentsTree,
  IUploadItem,
  IUploadResult,
} from "../documents/types/documents.type";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

// Усі змінювальні запити — з XHR_HEADERS: без нього бекенд (XhrOnlyGuard) відповідає 403.
export const documentsService = {
  getTree: async (): Promise<IApiResponse<IDocumentsTree>> => {
    const { data } = await api.get("/documents");
    return data;
  },

  createFolder: async (payload: { name: string; parentId: string | null }): Promise<IDocFolder> => {
    const { data } = await api.post("/documents/folders", payload, { headers: XHR_HEADERS });
    return data;
  },

  updateFolder: async (
    id: string,
    payload: { name?: string; parentId?: string | null },
  ): Promise<IDocFolder> => {
    const { data } = await api.patch(`/documents/folders/${id}`, payload, { headers: XHR_HEADERS });
    return data;
  },

  /** confirm — слово ICT з діалогу; без нього бекенд видаляти відмовиться. */
  deleteFolder: async (id: string, confirm: string) => {
    const { data } = await api.delete(`/documents/folders/${id}`, {
      params: { confirm },
      headers: XHR_HEADERS,
    });
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
      headers: XHR_HEADERS,
      onUploadProgress: (e) => onProgress?.(e.loaded),
    });
    return data;
  },

  updateFile: async (
    id: string,
    payload: { name?: string; folderId?: string | null },
  ): Promise<IDocFile> => {
    const { data } = await api.patch(`/documents/files/${id}`, payload, { headers: XHR_HEADERS });
    return data;
  },

  /** Масові операції — один запит на всю пачку (без ліміту запитів і часткових збоїв). */
  deleteFiles: async (ids: string[], confirm: string) => {
    const { data } = await api.post(
      "/documents/files/bulk-delete",
      { ids, confirm },
      { headers: XHR_HEADERS },
    );
    return data as { deleted: number; missing: number };
  },

  moveFiles: async (ids: string[], folderId: string | null) => {
    const { data } = await api.patch(
      "/documents/files/bulk-move",
      { ids, folderId },
      { headers: XHR_HEADERS },
    );
    return data as { moved: number; missing: number };
  },

  deleteFile: async (id: string, confirm: string) => {
    const { data } = await api.delete(`/documents/files/${id}`, {
      params: { confirm },
      headers: XHR_HEADERS,
    });
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
