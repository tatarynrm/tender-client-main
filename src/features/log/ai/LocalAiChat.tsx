"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { cn } from "@/shared/utils/index";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Cpu, Loader2, PanelLeft } from "lucide-react";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useDeleteAllLocalAiSessions,
  useDeleteLocalAiSession,
  useLocalAiHealth,
  useLocalAiMessages,
  useLocalAiSessions,
  useSendLocalAiMessage,
} from "../hooks/useLocalAi";
import { AiComposer } from "./components/AiComposer";
import { AiMessage } from "./components/AiMessage";
import { AiOrb } from "./components/AiOrb";
import { AiSessionList } from "./components/AiSessionList";
import { AiThinking } from "./components/AiThinking";
import { AiWelcome } from "./components/AiWelcome";
import { ILocalAiMessage } from "./types/local-ai.types";

/**
 * Фон декоративний і тягне за собою three.js, тому вантажимо його окремим
 * чанком уже після того, як чат став інтерактивним. SSR вимкнено — компонент
 * усе одно працює лише в браузері (WebGL).
 */
const ParticleWave = dynamic(
  () =>
    import("@/shared/components/ui/particle-wave").then((m) => m.ParticleWave),
  { ssr: false },
);

/**
 * Робот теж тягне three.js і теж працює лише в браузері — окремий чанк
 * і ssr:false з тих самих причин, що й фон.
 */
const AiRobot = dynamic(
  () => import("./components/robot/AiRobot").then((m) => m.AiRobot),
  { ssr: false },
);

/** За скільки пікселів до верху починаємо тягнути старіші повідомлення. */
const LOAD_MORE_THRESHOLD = 200;

/**
 * Чат із AI-помічником (Google Gemini на бекенді; провайдер видно в health).
 *
 * Стрімінгу немає навмисно: відповідь формується у два кроки на сервері
 * (вибір функції → виконання SQL → переказ результату), тож проміжного тексту
 * просто не існує. Замість фейкового стріму — етапний індикатор роботи
 * (AiThinking) і посимвольна поява вже готової відповіді (AiMessage).
 *
 * Історія приходить сторінками з кінця розмови: відкриваємось одразу на
 * останньому повідомленні, старіше довантажується при скролі вгору.
 */
export default function LocalAiChat() {
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  /** Стрічку прокрутили від верху — потрібно, щоб робот не наїхав на текст. */
  const [scrolledFromTop, setScrolledFromTop] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  /** Відстань від низу, зафіксована перед довантаженням старіших повідомлень. */
  const restoreFromBottomRef = useRef<number | null>(null);
  /** Після відновлення позиції один автоскрол униз треба пропустити. */
  const skipAutoScrollRef = useRef(false);
  /** Для якої сесії вже зробили початковий стрибок у кінець. */
  const jumpedForRef = useRef<string | undefined>(undefined);

  const { data: health } = useLocalAiHealth();
  const { data: sessions = [], isLoading: sessionsLoading } =
    useLocalAiSessions();

  const {
    data: messagePages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: messagesLoading,
  } = useLocalAiMessages(sessionId);

  const sendMessage = useSendLocalAiMessage(setSessionId);
  const deleteSession = useDeleteLocalAiSession();
  const deleteAllSessions = useDeleteAllLocalAiSessions();

  /**
   * Сторінки лежать від найновішої до найстарішої — розгортаємо в хронологію.
   * Дедуплікація за id обов'язкова: offset рахується від кінця розмови, тож
   * повідомлення, яке з'явилося між запитами сторінок, зсуває вікно на одиницю.
   */
  const messages = useMemo<ILocalAiMessage[]>(() => {
    if (!messagePages) return [];

    const seen = new Set<string>();
    const result: ILocalAiMessage[] = [];

    for (const page of [...messagePages.pages].reverse()) {
      for (const message of page.messages) {
        if (seen.has(message.id)) continue;
        seen.add(message.id);
        result.push(message);
      }
    }

    return result;
  }, [messagePages]);

  const totalMessages = messagePages?.pages[0]?.total ?? 0;

  // Друкуємо лише ту відповідь, що прийшла останньою мутацією.
  // Історію при перемиканні розмов показуємо одразу цілою.
  const freshMessageId = sendMessage.data?.message.id;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  /**
   * Відкрили розмову — одразу опиняємось на останньому повідомленні,
   * без анімованої прокрутки через усю історію.
   */
  useLayoutEffect(() => {
    if (!messages.length || jumpedForRef.current === sessionId) return;

    jumpedForRef.current = sessionId;
    scrollToBottom("auto");
    setAtBottom(true);
  }, [sessionId, messages.length, scrollToBottom]);

  /**
   * Довантажили старіші — тримаємо в кадрі те саме повідомлення.
   * Рахуємо від НИЗУ: висота контенту щойно змінилася, а відстань до низу — ні.
   */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || restoreFromBottomRef.current === null) return;

    el.scrollTop = el.scrollHeight - restoreFromBottomRef.current;
    restoreFromBottomRef.current = null;
    skipAutoScrollRef.current = true;
  }, [messages.length]);

  // Автоскрол лише коли користувач і так унизу — інакше не висмикуємо його
  // з середини довгої таблиці й не стрибаємо після довантаження історії.
  useEffect(() => {
    if (skipAutoScrollRef.current) {
      skipAutoScrollRef.current = false;
      return;
    }
    // На вітальному екрані прокручувати нікуди: інакше він поїде вгору
    // під закріплений шар робота
    if (atBottom && messages.length) scrollToBottom();
  }, [messages.length, sendMessage.isPending, atBottom, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setScrolledFromTop(el.scrollTop > 24);
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);

    if (
      el.scrollTop < LOAD_MORE_THRESHOLD &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      restoreFromBottomRef.current = el.scrollHeight - el.scrollTop;
      fetchNextPage();
    }
  };

  const handleSend = (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || sendMessage.isPending) return;

    setInput("");
    setAtBottom(true);
    sendMessage.mutate({ text: value, sessionId });
  };

  /**
   * «Нова розмова» лише очищає екран — сесію створює сервер разом із першим
   * повідомленням. Інакше кожен клік займав би слот у ліміті розмов і витісняв
   * найстарішу справжню переписку порожньою.
   */
  const handleCreate = () => {
    setSessionId(undefined);
    setInput("");
    setAtBottom(true);
    setSheetOpen(false);
  };

  const handleSelect = (id: string) => {
    setSessionId(id);
    setSheetOpen(false);
    setAtBottom(true);
    // Інша розмова — потрібен новий початковий стрибок у кінець
    jumpedForRef.current = undefined;
  };

  const handleDelete = (id: string) => {
    deleteSession.mutate(id);
    if (id === sessionId) setSessionId(undefined);
  };

  const handleDeleteAll = () => {
    deleteAllSessions.mutate();
    // Активна розмова щойно зникла разом з рештою — інакше екран показував би
    // повідомлення, яких на сервері вже немає
    setSessionId(undefined);
    setSheetOpen(false);
  };

  const online = Boolean(health?.available && health?.loaded);

  // Розмова почалася — робот звільняє центр екрана під відповіді
  const hasConversation = messages.length > 0 || sendMessage.isPending;

  /**
   * Вітальний екран. Перевірка `!sessionId` окрема й перша: без відкритої
   * розмови запит історії вимкнений, а вимкнений useInfiniteQuery лишається
   * у стані pending — на самий лише `messagesLoading` спиратися не можна.
   */
  const showWelcome =
    !sendMessage.isPending &&
    messages.length === 0 &&
    (!sessionId || !messagesLoading);

  const sessionPanel = (
    <AiSessionList
      sessions={sessions}
      activeId={sessionId}
      isLoading={sessionsLoading}
      maxSessions={health?.limits?.maxSessions}
      onSelect={handleSelect}
      onCreate={handleCreate}
      onDelete={handleDelete}
      onDeleteAll={handleDeleteAll}
    />
  );

  return (
    <div className="relative h-[calc(100vh-120px)] overflow-hidden rounded-2xl border border-slate-200/70 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
      {/* Ледь помітна сітка з частинок — вона сама читає тему застосунку */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.15] dark:opacity-25">
        <ParticleWave transparent amount={90} opacity={0.3} mouseStrength={1.1} />
      </div>

      {/* Одна м'яка пляма акценту замість неонових туманностей */}
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-blue-400/10 blur-[110px] dark:bg-blue-500/20" />

      <div className="relative flex h-full gap-3 p-3 sm:gap-4 sm:p-4">
        <aside className="hidden w-64 shrink-0 lg:block">{sessionPanel}</aside>

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/70 bg-white/75 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
          <header className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-3 py-2.5 sm:px-4 dark:border-white/10">
            <div className="flex min-w-0 items-center gap-2.5">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Розмови"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-blue-600 lg:hidden dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-blue-400"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-72 border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900"
                >
                  <SheetHeader className="p-0 pb-3">
                    <SheetTitle className="text-sm">Розмови</SheetTitle>
                  </SheetHeader>
                  {sessionPanel}
                </SheetContent>
              </Sheet>

              <AiOrb size={26} active={sendMessage.isPending} />

              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  AI помічник ICT
                </h1>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {health?.provider === "lmstudio"
                    ? "локальна модель — дані не залишають мережу компанії"
                    : "Google Gemini — доступ до бази лише на читання"}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                online
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300",
              )}
              title={
                health?.available
                  ? health.loaded
                    ? health.model
                    : `${health.model} — модель не завантажена`
                  : "модель недоступна"
              }
            >
              <span className="relative flex h-1.5 w-1.5">
                {online && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={cn(
                    "relative inline-flex h-1.5 w-1.5 rounded-full",
                    online ? "bg-emerald-500" : "bg-amber-500",
                  )}
                />
              </span>
              <Cpu className="h-3 w-3" />
              <span className="hidden max-w-[160px] truncate sm:inline">
                {health?.available
                  ? health.loaded
                    ? health.model
                    : "модель не завантажена"
                  : "модель недоступна"}
              </span>
            </div>
          </header>

          <div className="relative min-h-0 flex-1">
            {/*
              Мех-спостерігач. Один канвас на весь час життя чату: він герой
              порожнього екрана, а з початком розмови від'їжджає у кут і лишається
              вартовим. Перемонтувати його не можна — WebGL-контекст дорогий,
              а на сторінці вже є другий (ParticleWave).

              Розмір шару фіксований, а стани різняться лише `left` і `scale`.
              Це принципово: анімація width/height змушувала б ResizeObserver
              щокадру викликати renderer.setSize, тобто переалокувати буфер
              канваса — саме від цього робот мигав під час переходу.
            */}
            <div
              className={cn(
                "pointer-events-none absolute top-3 z-0 h-56 w-56 origin-top",
                "-translate-x-1/2 transition-[left,transform,opacity] duration-700 ease-out",
                hasConversation
                  ? "left-[calc(100%-3.75rem)] scale-[0.70]"
                  : "left-1/2 scale-100",
                // Шар закріплений, а вітальний текст прокручується — щоб вони
                // не накладались на низькому екрані, робот іде з дороги
                !hasConversation && scrolledFromTop && "opacity-0",
              )}
            >
              {/* Підсвітка: у темній темі корпус інакше зливається з фоном */}
              <div className="pointer-events-none absolute inset-4 rounded-full bg-blue-400/10 blur-2xl dark:bg-blue-500/20" />

              <AiRobot
                className="relative h-full w-full"
                state={sendMessage.isPending ? "thinking" : "idle"}
              />
            </div>

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="scrollbar-thin relative z-10 h-full overflow-y-auto"
            >
              <div className="mx-auto flex max-w-3xl flex-col gap-5 px-3 py-5 sm:px-5">
                {/* Довантаження історії вгорі */}
                {isFetchingNextPage && (
                  <div className="flex items-center justify-center gap-2 py-1 text-[11px] text-slate-400 dark:text-slate-500">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Завантажую попередні повідомлення
                  </div>
                )}

                {!hasNextPage && messages.length > 0 && (
                  <p className="text-center text-[11px] text-slate-400 dark:text-slate-600">
                    Початок розмови · повідомлень: {totalMessages}
                  </p>
                )}

                {showWelcome && <AiWelcome onPick={handleSend} />}

                {messages.map((message) => (
                  <AiMessage
                    key={message.id}
                    message={message}
                    animate={message.id === freshMessageId}
                  />
                ))}

                <AnimatePresence>
                  {sendMessage.isPending && <AiThinking />}
                </AnimatePresence>

                <div ref={bottomRef} className="h-px" />
              </div>
            </div>

            {/* Кнопка повернення вниз — коли читаєш стару частину розмови */}
            <AnimatePresence>
              {!atBottom && (
                <motion.button
                  type="button"
                  onClick={() => {
                    setAtBottom(true);
                    scrollToBottom();
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  aria-label="До останнього повідомлення"
                  className="absolute bottom-4 left-1/2 z-20 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition-colors hover:text-blue-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-blue-400"
                >
                  <ArrowDown className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <AiComposer
            value={input}
            onChange={setInput}
            onSend={() => handleSend()}
            isPending={sendMessage.isPending}
          />
        </section>
      </div>
    </div>
  );
}
