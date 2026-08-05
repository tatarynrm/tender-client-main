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
import { ArrowDown, Cpu, PanelLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
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

/**
 * Фон декоративний і тягне за собою three.js (~100 kB), тому вантажимо його
 * окремим чанком уже після того, як чат став інтерактивним. SSR вимкнено —
 * компонент усе одно працює лише в браузері (WebGL).
 */
const ParticleWave = dynamic(
  () => import("@/shared/components/ui/particle-wave").then((m) => m.ParticleWave),
  { ssr: false },
);

/**
 * Чат із локальною моделлю (LM Studio).
 *
 * Стрімінгу немає навмисно: відповідь формується у два кроки на сервері
 * (вибір функції → виконання SQL → переказ результату), тож проміжного тексту
 * просто не існує. Замість фейкового стріму — етапний індикатор роботи
 * (AiThinking) і посимвольна поява вже готової відповіді (AiMessage).
 */
export default function LocalAiChat() {
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: health } = useLocalAiHealth();
  const { data: sessions = [], isLoading: sessionsLoading } =
    useLocalAiSessions();
  const { data: messages = [] } = useLocalAiMessages(sessionId);

  const sendMessage = useSendLocalAiMessage(setSessionId);
  const deleteSession = useDeleteLocalAiSession();
  const deleteAllSessions = useDeleteAllLocalAiSessions();

  // Друкуємо лише ту відповідь, що прийшла останньою мутацією.
  // Історію при перемиканні розмов показуємо одразу цілою.
  const freshMessageId = sendMessage.data?.message.id;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  // Автоскрол лише коли користувач і так унизу — інакше не висмикуємо його
  // з середини довгої таблиці.
  useEffect(() => {
    if (atBottom) scrollToBottom();
  }, [messages.length, sendMessage.isPending, atBottom, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
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
    <div className="relative h-[calc(100vh-120px)] overflow-hidden rounded-3xl border border-violet-900/50 bg-[#070718]">
      {/* Частинки */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <ParticleWave transparent amount={100} opacity={0.35} mouseStrength={1.2} />
      </div>

      {/* Туманності — кольорові світлові плями */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-violet-700/25 blur-[120px]" />
      <div className="pointer-events-none absolute -left-16 bottom-1/3 h-64 w-64 rounded-full bg-fuchsia-700/20 blur-[100px]" />
      <div className="pointer-events-none absolute left-1/2 -bottom-10 h-56 w-56 -translate-x-1/2 rounded-full bg-indigo-700/20 blur-[90px]" />

      {/* Загальне затемнення, щоб частинки не пробивались надто сильно */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#070718]/60 via-transparent to-[#070718]/80" />

      <div className="relative flex h-full gap-4 p-3 sm:p-4">
        <aside className="hidden w-64 shrink-0 lg:block">{sessionPanel}</aside>

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-violet-800/30 bg-white/[0.03] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
          <header className="flex items-center justify-between gap-3 border-b border-violet-800/30 px-3 py-2.5 sm:px-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Розмови"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-800/50 text-zinc-500 transition-colors hover:text-violet-300 lg:hidden"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 border-violet-900/50 bg-[#070718] p-4">
                  <SheetHeader className="p-0 pb-3">
                    <SheetTitle className="text-sm text-zinc-200">Розмови</SheetTitle>
                  </SheetHeader>
                  {sessionPanel}
                </SheetContent>
              </Sheet>

              <AiOrb size={26} active={sendMessage.isPending} />

              <div className="min-w-0">
                <h1 className="truncate bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-sm font-semibold text-transparent">
                  AI помічник ICT
                </h1>
                <p className="truncate text-[11px] text-zinc-600">
                  локальна модель — дані не залишають мережу компанії
                </p>
              </div>
            </div>

            <div
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur",
                online
                  ? "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300"
                  : "border-amber-500/25 bg-amber-500/[0.08] text-amber-300",
              )}
              title={
                health?.available
                  ? health.loaded
                    ? health.model
                    : `${health.model} — модель не завантажена`
                  : "LM Studio недоступний"
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
                  : "LM Studio недоступний"}
              </span>
            </div>
          </header>

          <div className="relative min-h-0 flex-1">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="scrollbar-thin scrollbar-thumb-violet-800/50 scrollbar-track-transparent h-full overflow-y-auto"
            >
              <div className="mx-auto flex max-w-3xl flex-col gap-5 px-3 py-5 sm:px-5">
                {messages.length === 0 && !sendMessage.isPending && (
                  <AiWelcome onPick={handleSend} />
                )}

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
                  className="absolute bottom-4 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-violet-800/50 bg-[#070718]/80 text-zinc-500 shadow-lg backdrop-blur-xl transition-colors hover:text-violet-300"
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
