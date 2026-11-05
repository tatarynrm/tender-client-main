"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/components/ui";
import Loading from "@/shared/components/ui/Loading";
import { toast } from "sonner";
import { Truck, UserCog, Gavel } from "lucide-react";
import { useNotificationRateSettings } from "../hooks/useNotificationRateSettings";
import { NotificationChannelsTable } from "../components/NotificationChannelsTable";

interface RateDestination {
  ids_notify_type: string;
  value: string;
  to_web: boolean;
  to_email: boolean;
  to_telegram: boolean;
  to_viber?: boolean;
  to_whatsapp?: boolean;
}

interface RateFormValues {
  id: string | number | null;
  notify_destination: RateDestination[];
}

// Підписи й опис подій ставок за типом. Процедура може віддавати власне `value`
// — тоді беремо його; ці константи лишаються як дефолт/запасний варіант.
const RATE_EVENTS: Record<
  string,
  { label: string; hint: string; Icon: typeof Truck }
> = {
  TENDER_RATE_CARRIER: {
    label: "Нова ставка від перевізника",
    hint: "Коли перевізник подає або оновлює ставку у вашому тендері",
    Icon: Truck,
  },
  TENDER_RATE_MANAGER: {
    label: "Нова ставка від нашого менеджера",
    hint: "Коли менеджер ICT подає ставку від імені перевізника",
    Icon: UserCog,
  },
  TENDER_RATE: {
    label: "Про внесення ставки тендеру",
    hint: "Коли у вашому тендері зʼявляється нова ставка",
    Icon: Gavel,
  },
};

// Дефолтні рядки — щоб екран був готовий до розподілу «перевізник / менеджер»
// ще до того, як процедура почне віддавати обидва типи.
const DEFAULT_RATE_EVENTS: RateDestination[] = [
  {
    ids_notify_type: "TENDER_RATE_CARRIER",
    value: RATE_EVENTS.TENDER_RATE_CARRIER.label,
    to_web: false,
    to_email: false,
    to_telegram: false,
    to_viber: false,
    to_whatsapp: false,
  },
  {
    ids_notify_type: "TENDER_RATE_MANAGER",
    value: RATE_EVENTS.TENDER_RATE_MANAGER.label,
    to_web: false,
    to_email: false,
    to_telegram: false,
    to_viber: false,
    to_whatsapp: false,
  },
];

export function RateNotificationsTab() {
  const { data, isLoading, updateMutation } = useNotificationRateSettings();

  const form = useForm<RateFormValues>({
    defaultValues: { id: null, notify_destination: DEFAULT_RATE_EVENTS },
  });
  const { control, handleSubmit, reset, watch, setValue } = form;

  useEffect(() => {
    if (!data) return;

    const existing: RateDestination[] = data.notify_destination || [];

    // Строго два налаштування — перевізник і менеджер. Значення беремо з БД за
    // типом, решту типів ігноруємо.
    const merged = DEFAULT_RATE_EVENTS.map((def) => {
      const fromDb = existing.find(
        (e) => e?.ids_notify_type === def.ids_notify_type,
      );
      return fromDb ? { ...def, ...fromDb } : def;
    });

    reset({
      id: data.id ?? null,
      notify_destination: merged,
    });
  }, [data, reset]);

  if (isLoading)
    return (
      <div className="py-20 flex justify-center">
        <Loading />
      </div>
    );

  const items = watch("notify_destination") || [];

  // Дружні підписи для таблиці (значення форми лишаються як у БД).
  const displayItems = items.map((it) => ({
    ...it,
    value: RATE_EVENTS[it.ids_notify_type]?.label || it.value,
  }));

  const toggleAll = (
    field: "to_telegram" | "to_email" | "to_web",
    value: boolean,
  ) => {
    const current = watch("notify_destination");
    setValue(
      "notify_destination",
      current.map((item) => ({ ...item, [field]: value })),
    );
  };

  const onSubmit = (formData: RateFormValues) => {
    toast.promise(updateMutation.mutateAsync(formData), {
      loading: "Збереження налаштувань...",
      success: "Налаштування сповіщень про ставки збережено",
      error: "Не вдалося зберегти налаштування",
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 animate-in fade-in duration-500 pb-24"
    >
      {/* Пояснювальні картки: від кого приходять сповіщення */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DEFAULT_RATE_EVENTS.map((e) => {
          const meta = RATE_EVENTS[e.ids_notify_type];
          const Icon = meta.Icon;
          return (
            <div
              key={e.ids_notify_type}
              className="flex items-start gap-3 p-4 rounded-[20px] border border-[#D0DDF0] bg-[#EEF4FB] dark:bg-zinc-900/40"
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-[#D0DDF0] flex items-center justify-center text-[#4863D4]">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-zinc-100 leading-tight">
                  {meta.label}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-snug">
                  {meta.hint}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Канали для кожного типу ставки */}
      <NotificationChannelsTable
        control={control}
        nameRef="notify_destination"
        items={displayItems}
        toggleAll={toggleAll}
        title="Сповіщення про ставки"
      />

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-500/20 transition-all"
        >
          {updateMutation.isPending ? "Збереження..." : "Зберегти налаштування"}
        </Button>
      </div>
    </form>
  );
}
