import React, { useState } from "react";
import {
  User2,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { FaTelegram, FaViber, FaWhatsapp } from "react-icons/fa";
import { IRateCompany, ITender } from "../../types/tender.type";

export function TenderRatesList({
  cargo,
  onSetWinner,
  onRemoveWinner,
}: {
  cargo: ITender;
  // Змінюємо тип onSetWinner, щоб він приймав обрану кількість машин
  onSetWinner?: (rate: IRateCompany, carCount: number) => void;
  onRemoveWinner?: (rate: IRateCompany) => void;
}) {
  // Локальний стан для відображення інпуту кількості авто
  // Зберігаємо ID ставки, для якої зараз вводимо машини
  const [editingRateId, setEditingRateId] = useState<number | null>(null);
  const [carCount, setCarCount] = useState<number>(1);

  // Витягуємо дані безпосередньо з cargo
  const rates = cargo.rate_company;
  const currency = cargo.valut_name || "—";

  if (!rates || rates.length === 0) return null;

  const sortedRates = [...rates].sort((a, b) => {
    // Якщо price_proposed є null або undefined, беремо Infinity
    const priceA = a?.price_proposed ?? Infinity;
    const priceB = b?.price_proposed ?? Infinity;

    return priceA - priceB;
  });

  const isAnalyze = cargo.ids_status === "ANALYZE";

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar pb-2">
      {sortedRates.map((rate, idx) => {
        const isTop1 = idx === 0;
        const isTop2 = idx === 1;
        const isTop3 = idx === 2;
        const isTopThree = idx < 3;

        const isWinner = rate.car_count_winner > 0;
        const isEditing = editingRateId === rate.id;

        return (
          <div
            key={`${rate.id || rate.author}-${idx}`}
            className={cn(
              "relative flex flex-col sm:flex-row items-start justify-between p-3.5 rounded-xl border transition-all duration-300 gap-4",
              isWinner
                ? "bg-blue-50/80 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700/50 shadow-md ring-1 ring-blue-500/30"
                : isTop1
                  ? "bg-emerald-50/60 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/40 shadow-sm"
                  : isTop2
                    ? "bg-slate-50/80 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700"
                    : isTop3
                      ? "bg-orange-50/30 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30"
                      : "bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:border-slate-200",
            )}
          >
            {/* Візуальні бейджі */}
            {(isTopThree || isWinner) && (
              <div
                className={cn(
                  "absolute -left-1 top-2 text-[8px] font-black px-2 py-0.5 rounded-r-full shadow-sm text-white",
                  isWinner
                    ? "bg-blue-600 text-[9px] pl-3"
                    : isTop1
                      ? "bg-emerald-500"
                      : isTop2
                        ? "bg-slate-400"
                        : "bg-amber-600",
                )}
              >
                {isWinner
                  ? `ПЕРЕМОЖЕЦЬ (${rate.car_count_winner} авто)`
                  : isTop1
                    ? "BEST PRICE"
                    : `TOP ${idx + 1}`}
              </div>
            )}

            <div className="flex flex-col min-w-0 flex-1 gap-2.5 w-full">
              {/* Компанія та Автор */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <Building2
                    size={13}
                    className={cn(
                      "shrink-0",
                      isWinner
                        ? "text-blue-500"
                        : isTop1
                          ? "text-emerald-500"
                          : "text-slate-400",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[12px] font-bold truncate uppercase tracking-wide",
                      isTopThree || isWinner
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-700 dark:text-slate-200",
                    )}
                  >
                    {rate.company_name || "Компанія не вказана"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="flex items-center gap-1">
                    <User2 size={11} className="text-slate-400 shrink-0" />
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {rate.author}
                    </span>
                  </div>
                  {rate.email && (
                    <a
                      href={`mailto:${rate.email}`}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      <Mail size={11} />
                      <span className="truncate max-w-[120px]">
                        {rate.email}
                      </span>
                    </a>
                  )}
                </div>
              </div>

              {/* Телефони */}
              {rate?.person_phone && rate?.person_phone?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {rate.person_phone.map((p: any) => {
                    const cleanPhone = p.phone.replace(/\D/g, "");
                    return (
                      <div
                        key={p.id}
                        className="group/phone flex items-center gap-2 bg-white/50 dark:bg-slate-800/40 p-1 pr-2 rounded-lg border border-slate-100 dark:border-slate-700/50 shadow-xs"
                      >
                        <a
                          href={`tel:${p.phone}`}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 pl-1"
                        >
                          <div className="w-5 h-5 rounded-md bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                            <Phone size={10} />
                          </div>
                          {p.phone}
                        </a>
                        <div className="flex items-center gap-2 ml-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                          {p.is_viber && (
                            <a
                              href={`viber://chat?number=%2B${cleanPhone}`}
                              className="hover:scale-125 transition-transform text-[#7360f2]"
                            >
                              <FaViber size={14} />
                            </a>
                          )}
                          {p.is_telegram && (
                            <a
                              href={`https://t.me/+${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:scale-125 transition-transform text-[#229ED9]"
                            >
                              <FaTelegram size={14} />
                            </a>
                          )}
                          {p.is_whatsapp && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:scale-125 transition-transform text-[#25D366]"
                            >
                              <FaWhatsapp size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Блок ціни та екшенів */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700/50 pt-3 sm:pt-0">
              <div className="flex flex-col items-start sm:items-end">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">
                  Пропозиція
                </div>
                <div
                  className={cn(
                    "text-base font-black tracking-tight leading-none transition-colors",
                    isWinner
                      ? "text-blue-600 dark:text-blue-400 text-lg"
                      : isTop1
                        ? "text-emerald-600 dark:text-emerald-400 text-lg"
                        : "text-slate-700 dark:text-slate-200",
                  )}
                >
                  {rate?.price_proposed?.toLocaleString()}
                  <span className="text-[10px] ml-1 opacity-70 font-bold">
                    {currency}
                  </span>
                </div>

                {rate.redemption_price && (
                  <div
                    className={cn(
                      "mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border shadow-xs",
                      rate.redemption_price === "Редукціон"
                        ? "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20"
                        : "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
                    )}
                  >
                    {rate.redemption_price}
                  </div>
                )}
              </div>

              {/* Кнопки вибору переможця (тільки в режимі ANALYZE) */}
              {isAnalyze && (
                <div className="mt-0 sm:mt-3 flex items-center justify-end">
                  {isWinner ? (
                    // Кнопка СКАСУВАТИ
                    <button
                      onClick={() => onRemoveWinner?.(rate)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-red-200 dark:border-red-800/50 shadow-sm"
                    >
                      <XCircle size={14} />
                      Скасувати
                    </button>
                  ) : isEditing ? (
                    // === БЛОК ВВОДУ КІЛЬКОСТІ АВТО ===
                    <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Авто:
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={carCount}
                        onChange={(e) =>
                          setCarCount(Math.max(1, Number(e.target.value)))
                        }
                        className="w-12 h-7 px-1 text-center text-[12px] font-bold border border-slate-200 rounded-md dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          onSetWinner?.(rate, carCount); // Передаємо ставку і кількість
                          setEditingRateId(null);
                        }}
                        className="flex items-center gap-1 px-2.5 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[10px] font-bold uppercase transition-colors"
                      >
                        ОК
                      </button>
                      <button
                        onClick={() => setEditingRateId(null)}
                        className="flex items-center justify-center w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 rounded-md transition-colors"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  ) : (
                    // Кнопка ОБРАТИ
                    <button
                      onClick={() => {
                        setEditingRateId(rate.id);
                        // За замовчуванням підставляємо те, що запропонував перевізник (або 1)
                        setCarCount(rate.car_count_proposed || 1);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm shadow-blue-500/30"
                    >
                      <CheckCircle2 size={14} />
                      Обрати
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
