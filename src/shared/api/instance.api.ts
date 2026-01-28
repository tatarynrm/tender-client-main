import axios, { AxiosError } from "axios";
import { toast } from "sonner"; // Імпортуємо toast з sonner

export type ErrorResponse = {
  message: string | string[];
  error: string;
  statusCode: number;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL!,
  withCredentials: true,
});

// Глобальні налаштування кешування
api.defaults.headers["Cache-Control"] = "no-cache";
api.defaults.headers["Pragma"] = "no-cache";
api.defaults.headers["Expires"] = "0";

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response) {
      const { status, data } = error.response;

      // if (status === 404) {
      //   console.log(data, "DATA ----");

      //   // Викликаємо Sonner
      //   toast.error("Помилка 404", {
      //     description: `${data.message}`,
      //   });
      // }

      // // Додатково: обробка помилок валідації NestJS (400 Bad Request)
      // if (status === 400) {
      //   const message = Array.isArray(data.message)
      //     ? data.message[0]
      //     : data.message;
      //   toast.error("Помилка даних", { description: message });
      // }

      // Помилка авторизації
      // if (status === 401) {
      //   toast.error("Неавторизовано", {
      //     description: "Будь ласка, увійдіть у систему.",
      //   });
      // }
    } else {
      toast.error("Помилка мережі", {
        description: "Не вдалося з'єднатися з сервером.",
      });
    }

    return Promise.reject(error);
  },
);

export default api;
