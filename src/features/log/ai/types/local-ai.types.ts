export interface ILocalAiSession {
  id: string;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

/**
 * Сторінка списку розмов: сервер віддає найсвіжіші, старіші довантажуються
 * при скролі списку вниз.
 */
export interface ILocalAiSessionPage {
  sessions: ILocalAiSession[];
  /** Скільки розмов у користувача взагалі — для лічильника «N з 50». */
  total: number;
  hasMore: boolean;
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

/**
 * Сторінка історії: сервер віддає хвіст розмови, а старіше довантажується
 * при скролі вгору. `hasMore` — чи лишилося щось СТАРІШЕ за цю сторінку.
 */
export interface ILocalAiMessagePage {
  messages: ILocalAiMessage[];
  total: number;
  hasMore: boolean;
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
  /** Хто відповідає: хмарний Gemini чи локальна модель у LM Studio. */
  provider?: "gemini" | "lmstudio";
  model: string;
  loaded: boolean;
  error?: string;
  nativeToolCalling: boolean;
  /** Скільки функцій доступно користувачу. Назви сервер назовні не віддає. */
  toolsCount: number;
  /** Обмеження, задані на сервері. */
  limits?: {
    /** Скільки розмов зберігається на користувача; найстаріші видаляються самі. */
    maxSessions: number;
  };
}
