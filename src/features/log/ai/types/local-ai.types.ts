export interface ILocalAiSession {
  id: string;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ILocalAiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  /** Яка серверна функція дала дані для цієї відповіді. */
  toolName?: string;
  /** Табличні дані, збережені разом із повідомленням. */
  rows?: Record<string, any>[];
  meta?: Record<string, any>;
}

export interface ILocalAiAnswer {
  sessionId: string;
  message: ILocalAiMessage;
  rows: Record<string, any>[];
  toolName?: string;
  meta?: Record<string, any>;
  /** Попередню розмову вже видалено (ліміт або строк зберігання) — це нова. */
  sessionReplaced?: boolean;
}

export interface ILocalAiHealth {
  available: boolean;
  model: string;
  loaded: boolean;
  error?: string;
  nativeToolCalling: boolean;
  tools: string[];
  /** Обмеження, задані на сервері. */
  limits?: {
    /** Скільки розмов зберігається на користувача; найстаріші видаляються самі. */
    maxSessions: number;
  };
}
