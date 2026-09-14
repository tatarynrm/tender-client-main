import { AxiosError } from "axios";

export const trainingErrorMessage = (error: unknown, fallback: string) => {
  const err = error as AxiosError<{ message?: string | string[] }>;
  if (err.response?.status === 413) return "Файл завеликий (максимум 2 ГБ)";
  const message = err.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
};

export const formatFileSize = (bytes: number) => {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} ГБ`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} МБ`;
  return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
};
