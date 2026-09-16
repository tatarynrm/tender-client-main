import api from "@/shared/api/instance.api";
import { IApiResponse } from "@/shared/api/api.type";
import { XHR_HEADERS } from "@/shared/api/xhr.headers";
import {
  ITrainingStreamToken,
  ITrainingVideo,
  ITrainingVideoForm,
} from "../training/types/training.type";

export const TRAINING_MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // як на бекенді
export const TRAINING_ALLOWED_EXT = [".mp4", ".m4v", ".webm", ".mov"];

export const trainingService = {
  getList: async (): Promise<IApiResponse<ITrainingVideo[]>> => {
    const { data } = await api.get("/training");
    return data;
  },

  upload: async (
    payload: ITrainingVideoForm & { file: File },
    onProgress?: (percent: number) => void,
  ): Promise<ITrainingVideo> => {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("topic", payload.topic);
    formData.append("description", payload.description);
    formData.append("file", payload.file);

    const { data } = await api.post("/training", formData, {
      timeout: 0,
      headers: XHR_HEADERS,
      onUploadProgress: (e) => {
        if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100));
      },
    });
    return data;
  },

  update: async (id: string, payload: ITrainingVideoForm): Promise<ITrainingVideo> => {
    const { data } = await api.patch(`/training/${id}`, payload, { headers: XHR_HEADERS });
    return data;
  },

  remove: async (id: string): Promise<{ id: string }> => {
    const { data } = await api.delete(`/training/${id}`, { headers: XHR_HEADERS });
    return data;
  },

  getStreamToken: async (id: string): Promise<ITrainingStreamToken> => {
    const { data } = await api.get(`/training/${id}/token`);
    return data;
  },

  /** Посилання для <video>. Кука сесії йде разом із запитом, токен живе 2 години. */
  getStreamUrl: (id: string, token: string) =>
    `${process.env.NEXT_PUBLIC_SERVER_URL}/training/${id}/stream?t=${encodeURIComponent(token)}`,
};
