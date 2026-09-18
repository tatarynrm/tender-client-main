import { AxiosError } from "axios";
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

/** Скільки разів повторювати шматок при збої мережі чи 5xx. */
const CHUNK_RETRIES = 3;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Повторюємо лише те, що може минути саме: обрив мережі, 5xx, 408/429. */
const isRetryable = (error: unknown) => {
  const status = (error as AxiosError)?.response?.status;
  return !status || status >= 500 || status === 408 || status === 429;
};

interface IUploadInit {
  uploadId: string;
  chunkSize: number;
  totalChunks: number;
}

export const trainingService = {
  getList: async (): Promise<IApiResponse<ITrainingVideo[]>> => {
    const { data } = await api.get("/training");
    return data;
  },

  /**
   * Завантаження частинами: один запит на весь файл обривався на великих
   * відео (~600MB — ліміт проксі / таймаут запиту). Шматки йдуть по черзі,
   * кожен із повторами; при остаточній помилці сесія на сервері скасовується.
   */
  upload: async (
    payload: ITrainingVideoForm & { file: File },
    onProgress?: (percent: number) => void,
  ): Promise<ITrainingVideo> => {
    const { file } = payload;

    const { data: init } = await api.post<IUploadInit>(
      "/training/upload/init",
      {
        title: payload.title,
        topic: payload.topic,
        description: payload.description,
        fileName: file.name,
        size: file.size,
      },
      { headers: XHR_HEADERS },
    );
    const { uploadId, chunkSize, totalChunks } = init;

    try {
      for (let index = 0; index < totalChunks; index++) {
        const start = index * chunkSize;
        const blob = file.slice(start, Math.min(file.size, start + chunkSize));

        for (let attempt = 1; ; attempt++) {
          try {
            await api.put(
              `/training/upload/${uploadId}/chunks/${index}`,
              blob,
              {
                timeout: 0,
                headers: {
                  ...XHR_HEADERS,
                  "Content-Type": "application/octet-stream",
                },
                onUploadProgress: (e) => {
                  // Не показуємо 100%, доки сервер не збере файл
                  const percent = ((start + e.loaded) / file.size) * 100;
                  onProgress?.(Math.min(99, Math.round(percent)));
                },
              },
            );
            break;
          } catch (error) {
            if (attempt >= CHUNK_RETRIES || !isRetryable(error)) throw error;
            await sleep(1000 * attempt);
          }
        }
      }

      // Усі байти на сервері — діалог показує «Обробка на сервері…»
      onProgress?.(100);
      const { data } = await api.post<ITrainingVideo>(
        `/training/upload/${uploadId}/complete`,
        {},
        { headers: XHR_HEADERS },
      );
      return data;
    } catch (error) {
      // Не лишаємо на сервері недокачаний файл до нічного прибирання
      api
        .delete(`/training/upload/${uploadId}`, { headers: XHR_HEADERS })
        .catch(() => undefined);
      throw error;
    }
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
