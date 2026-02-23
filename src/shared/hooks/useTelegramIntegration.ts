import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

import { telegramService } from '../services/telegram.service';
import { toast } from 'sonner';

export const useTelegramIntegration = (onProfileUpdate: () => void) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  const handleConnect = useCallback(async (email: string) => {
    if (!botUsername) {
      toast.error('Конфігурація бота відсутня. Зверніться до підтримки.');
      return;
    }

    setIsConnecting(true);
    try {
      const token = await telegramService.getConnectToken(email);
      const botUrl = `https://t.me/${botUsername}?start=${token}`;
      
      window.open(botUrl, '_blank');
      toast.success('Перейдіть у Telegram та натисніть "Start"');
      
    } catch (error) {
      // Правильна типізація помилки Axios
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Помилка підключення бота';
      
      console.error('[Telegram Connect Error]:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, [botUsername]); // Залежність тільки від username

  const handleDisconnect = useCallback(async (telegramId: number) => {
    const isConfirmed = window.confirm('Ви впевнені, що хочете відключити Telegram сповіщення?');
    if (!isConfirmed) return;

    setIsDisconnecting(true);
    try {
      await telegramService.disconnect(telegramId);
      
      toast.success('Telegram успішно відключено');
      onProfileUpdate();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Не вдалося відключити Telegram';
      
      console.error('[Telegram Disconnect Error]:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDisconnecting(false);
    }
  }, [onProfileUpdate]); // Залежність від функції оновлення

  return {
    isConnecting,
    isDisconnecting,
    handleConnect,
    handleDisconnect,
  };
};