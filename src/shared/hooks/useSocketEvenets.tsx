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
    if (user) registerUserEvents(user); // Тільки звуки/тости/модальні вікна
    if (load) registerLoadEvents(load); // Тільки звуки/тости/модальні вікна
    if (tender) registerLoadEvents(tender); // Тільки звуки/тости/модальні вікна
    if (chat) registerChatEvents(chat); // Тільки звуки/тости/модальні вікна

    return () => {
      // Видаляємо ТІЛЬКИ глобальні івенти
      unregisterEvents(user, GLOBAL_USER_EVENTS);
      unregisterEvents(load, GLOBAL_LOAD_EVENTS);

      // Твій useLoads зі своїми івентами ("new_load", "edit_load")
      // залишиться працювати, бо їх немає в цих списках!
    };
  }, [user, load]);
};
