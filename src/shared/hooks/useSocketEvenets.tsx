import { useEffect } from "react";
import { useSockets } from "../providers/SocketProvider";

import { registerUserEvents } from "../socket/UserEvents";
import { registerLoadEvents } from "../socket/LoadEvents";
import { registerChatEvents } from "../socket/ChatEvents";
import { unregisterEvents } from "../socket/utils/utils";
import {
  GLOBAL_LOAD_EVENTS,
  GLOBAL_USER_EVENTS,
} from "../socket/constants/constants";

export const useSocketEvents = () => {
  const { user, load, tender, chat } = useSockets();

  useEffect(() => {
    // Реєструємо івенти, якщо сокет існує
    if (user) registerUserEvents(user);
    if (load) registerLoadEvents(load);
    // if (tender) registerLoadEvents(tender); // Перевір, чи тут не має бути registerTenderEvents?
    // if (chat) registerChatEvents(chat);

    return () => {
      // Очищення: передаємо сокети, тільки якщо вони існують
      if (user) unregisterEvents(user, GLOBAL_USER_EVENTS);
      if (load) unregisterEvents(load, GLOBAL_LOAD_EVENTS);
      // Додай очищення для chat/tender, якщо вони мають глобальні списки
    };
    
    // ВАЖЛИВО: додаємо ВСІ сокети в залежності
  }, [user, load, tender, chat]); 
};
