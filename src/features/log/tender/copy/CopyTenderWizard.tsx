"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  CalendarClock,
  Clock,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
} from "lucide-react";
import { ZodError } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { InputDateWithTime } from "@/shared/components/Inputs/InputDateWithTime";
import { useModalStore } from "@/shared/stores/useModalStore";
import api from "@/shared/api/instance.api";
import { buildCopyTenderDto } from "./buildCopyTenderDto";
import { cn } from "@/shared/utils";

interface WizardValues {
  date_load: Date | null;
  date_load2: Date | null;
  date_unload: Date | null;
  time_start: Date | null;
  time_end: Date | null;
  ids_valut: string;
  price_start?: number | null;
  price_step?: number | null;
  price_redemption?: number | null;
  price_client?: number | null;
}

const toDate = (v: any): Date | null =>
  v ? (v instanceof Date ? v : new Date(v)) : null;

const STEPS = [
  { title: "Дати завантаження / розвантаження", icon: CalendarClock },
  { title: "Час проведення тендеру", icon: Clock },
  { title: "Бюджет тендеру", icon: Wallet },
];

export const CopyTenderWizard = ({ source }: { source: any }) => {
  const { closeModal } = useModalStore();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const idsType: string = source?.ids_type;
  const isReduction =
    idsType === "REDUCTION" || idsType === "REDUCTION_WITH_REDEMPTION";
  const isRedemption = idsType === "REDUCTION_WITH_REDEMPTION";

  const valutOptions = useMemo(() => {
    const base = ["UAH", "USD", "EUR"];
    if (source?.ids_valut && !base.includes(source.ids_valut))
      base.unshift(source.ids_valut);
    return base;
  }, [source?.ids_valut]);

  const { control, register, getValues, trigger } = useForm<WizardValues>({
      defaultValues: {
        date_load: toDate(source?.date_load),
        date_load2: toDate(source?.date_load2),
        date_unload: toDate(source?.date_unload),
        time_start: toDate(source?.time_start),
        time_end: toDate(source?.time_end),
        ids_valut: source?.ids_valut || "UAH",
        price_start: source?.price_start ?? undefined,
        price_step: source?.price_step ?? undefined,
        price_redemption: source?.price_redemption ?? undefined,
        price_client: source?.price_client ?? undefined,
      },
    });

  const next = async () => {
    if (step === 0) {
      if (!(await trigger("date_load"))) return;
    }
    if (step === 1) {
      const ok = await trigger(["time_start", "time_end"]);
      if (!ok) return;
      const { time_start, time_end } = getValues();
      if (!time_start || !time_end) {
        toast.error("Вкажіть початок і кінець проведення тендеру");
        return;
      }
      if (time_end <= time_start) {
        toast.error("Кінець має бути пізніше за початок");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    const v = getValues();
    if (!v.date_load || !v.time_start || !v.time_end) {
      toast.error("Заповніть дати й час проведення");
      return;
    }
    if (isReduction && (!v.price_start || !v.price_step)) {
      toast.error("Для редукціону вкажіть стартову ціну і крок");
      setStep(2);
      return;
    }
    if (isRedemption && !v.price_redemption) {
      toast.error("Вкажіть ціну викупу");
      setStep(2);
      return;
    }

    let dto: any;
    try {
      dto = buildCopyTenderDto(source, {
        date_load: v.date_load,
        date_load2: v.date_load2,
        date_unload: v.date_unload,
        time_start: v.time_start,
        time_end: v.time_end,
        ids_valut: v.ids_valut,
        price_start: v.price_start ?? undefined,
        price_step: v.price_step ?? undefined,
        price_redemption: v.price_redemption ?? undefined,
        price_client: v.price_client ?? undefined,
      });
    } catch (e) {
      const msg =
        e instanceof ZodError
          ? e.issues[0]?.message || "Перевірте дані тендера"
          : "Не вдалося підготувати копію. Відкрийте повну форму створення.";
      toast.error(msg);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("dto", JSON.stringify(dto));

      // Викликаємо API напряму — майстер відкривається в глобальній модалці
      // поза SocketProvider, тому хук useSaveTender (він тягне useSockets) тут не годиться.
      const saveRes = await api.post("/tender/save", formData);
      const content = (saveRes.data as any)?.content;
      const created = Array.isArray(content) ? content[0] : content;
      const newId =
        typeof created === "number"
          ? created
          : (created?.id ?? created?.id_tender ?? created?.tender_id);

      // Куди падає копія: майбутній старт → заплановані, інакше активні
      const targetStatus =
        v.time_start.getTime() > Date.now() ? "PLAN" : "ACTIVE";

      if (newId != null) {
        await api.post("/tender/set-status", {
          id: String(newId),
          ids_status: targetStatus,
        });
        toast.success(
          targetStatus === "PLAN"
            ? "Копію створено — у запланованих"
            : "Копію створено — в активних",
        );
      } else {
        toast.success("Копію тендера створено");
      }

      queryClient.invalidateQueries({ queryKey: ["tenders"] });
      closeModal();
    } catch (e) {
      console.error("Помилка створення копії тендера", e);
      toast.error("Не вдалося створити копію тендера");
    } finally {
      setSubmitting(false);
    }
  };

  const StepIcon = STEPS[step].icon;
  const inputCls =
    "w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors";
  const labelCls =
    "text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 block";

  return (
    <div className="w-full">
      {/* Степ-індикатор */}
      <div className="flex items-center gap-2 mb-5">
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-colors",
                i === step
                  ? "bg-blue-500 text-white"
                  : i < step
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800",
              )}
            >
              <s.icon size={13} />
              <span className="hidden sm:inline">Крок {i + 1}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-[2px] bg-slate-100 dark:bg-slate-800" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <StepIcon size={18} className="text-blue-500" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {STEPS[step].title}
        </h3>
      </div>

      {/* Контент кроку */}
      <div className="min-h-[220px]">
        {step === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputDateWithTime
              control={control}
              name="date_load"
              label="Завантаження від"
              required
            />
            <InputDateWithTime
              control={control}
              name="date_load2"
              label="Завантаження до"
            />
            <InputDateWithTime
              control={control}
              name="date_unload"
              label="Розвантаження"
            />
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputDateWithTime
              control={control}
              name="time_start"
              label="Початок проведення"
              required
            />
            <InputDateWithTime
              control={control}
              name="time_end"
              label="Кінець проведення"
              required
            />
            <p className="sm:col-span-2 text-[11px] text-slate-400">
              Якщо початок у майбутньому — копія потрапить у «Заплановані»,
              інакше одразу в «Активні».
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Валюта</label>
              <select className={inputCls} {...register("ids_valut")}>
                {valutOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {isReduction && (
              <div>
                <label className={labelCls}>Старт</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputCls}
                  {...register("price_start", { valueAsNumber: true })}
                />
              </div>
            )}

            {isReduction && (
              <div>
                <label className={labelCls}>Крок</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputCls}
                  {...register("price_step", { valueAsNumber: true })}
                />
              </div>
            )}

            {isRedemption && (
              <div>
                <label className={labelCls}>Викуп</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputCls}
                  {...register("price_redemption", { valueAsNumber: true })}
                />
              </div>
            )}

            <div>
              <label className={labelCls}>Ціна замовника</label>
              <input
                type="number"
                step="0.01"
                className={inputCls}
                {...register("price_client", { valueAsNumber: true })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Навігація */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
        <button
          type="button"
          onClick={step === 0 ? closeModal : back}
          disabled={submitting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <ChevronLeft size={16} />
          {step === 0 ? "Скасувати" : "Назад"}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Далі
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Copy size={16} />
            )}
            Створити копію
          </button>
        )}
      </div>
    </div>
  );
};
