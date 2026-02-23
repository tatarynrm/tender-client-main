import api from "../api/instance.api";
import { IUserProfile } from "../types/user.types";


class TelegramService {
  /**
   * Отримання профілю користувача
   */
  public async findProfile(): Promise<IUserProfile> {
    const { data } = await api.get<IUserProfile>("/users/profile");
    return data;
  }

  /**
   * Генерація токена для підключення Telegram бота
   * @param email Email користувача, для якого генерується токен
   */
  public async getConnectToken(email: string): Promise<string> {
    // Якщо бекенд повертає просто рядок, data буде типом string
    // Якщо об'єкт { token: string }, замініть type на { token: string } та повертайте data.token
    const { data } = await api.post<string>("/telegram-token/get-token", { 
      email 
    });
    
    return data;
  }

  /**
   * Відключення Telegram бота від акаунта
   * @param telegramId ID телеграм акаунта, який треба відв'язати
   */
  public async disconnect(telegramId: number): Promise<{ success: boolean; telegram_id: null }> {
    const { data } = await api.post<{ success: boolean; telegram_id: null }>("/telegram-token/disconnect", {
      telegram_id: telegramId,
    });
    
    return data;
  }
}

export const telegramService = new TelegramService();