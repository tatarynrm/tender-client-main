import React from "react";
import { User2, Building2, Phone, Mail, ExternalLink } from "lucide-react";
import { cn } from "@/shared/utils";
import { FaTelegram, FaViber, FaWhatsapp } from "react-icons/fa";

interface ITenderRate {
  author: string;
  price_proposed: number;
  redemption_price?: string | number;
  company_name?: string;
  email?: string;
  usr_phone?: {
    id: number;
    phone: string;
    is_viber?: boolean;
    is_telegram?: boolean;
    is_whatsapp?: boolean;
  }[];
}

export function TenderRatesList({
  rates,
  currency = "—",
}: {
  rates?: ITenderRate[];
  currency: string;
}) {
  if (!rates || rates.length === 0) return null;

  // 1. Сортуємо копію масиву від найнижчої ціни
  const sortedRates = [...rates].sort(
    (a, b) => a.price_proposed - b.price_proposed
  );

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar pb-2">
      {sortedRates.map((rate, idx) => {
        // Визначаємо, чи входить ставка в ТОП-3
        const isTop1 = idx === 0;
        const isTop2 = idx === 1;
        const isTop3 = idx === 2;
        const isTopThree = idx < 3;

        return (
          <div
            key={`${rate.author}-${idx}`}
            className={cn(
              "relative flex items-start justify-between p-3.5 rounded-xl border transition-all duration-300",
              // Спеціальні фони для ТОП-3
              isTop1 &&
                "bg-emerald-50/60 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/40 shadow-sm",
              isTop2 &&
                "bg-slate-50/80 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700",
              isTop3 &&
                "bg-orange-50/30 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30",
              !isTopThree &&
                "bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:border-slate-200"
            )}
          >
            {/* Візуальні бейджі для ТОП-3 */}
            {isTopThree && (
              <div
                className={cn(
                  "absolute -left-1 top-2 text-[8px] font-black px-2 py-0.5 rounded-r-full shadow-sm text-white",
                  isTop1 && "bg-emerald-500",
                  isTop2 && "bg-slate-400",
                  isTop3 && "bg-amber-600"
                )}
              >
                {isTop1 ? "BEST PRICE" : `TOP ${idx + 1}`}
              </div>
            )}

            <div className="flex flex-col min-w-0 flex-1 gap-2.5">
              {/* Компанія та Автор */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <Building2
                    size={13}
                    className={cn(
                      "shrink-0",
                      isTop1 ? "text-emerald-500" : "text-slate-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[12px] font-bold truncate uppercase tracking-wide",
                      isTopThree
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-700 dark:text-slate-200"
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

              {/* Телефони (ваша логіка з месенджерами) */}
              {rate.usr_phone && rate.usr_phone.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {rate.usr_phone.map((p) => {
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
                              className="hover:scale-125 text-[#7360f2]"
                            >
                              <FaViber size={14} />
                            </a>
                          )}
                          {p.is_telegram && (
                            <a
                              href={`https://t.me/+${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:scale-125 text-[#229ED9]"
                            >
                              <FaTelegram size={14} />
                            </a>
                          )}
                          {p.is_whatsapp && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:scale-125 text-[#25D366]"
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

            {/* Блок ціни */}
            <div className="flex flex-col items-end shrink-0 ml-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">
                Пропозиція
              </div>
              <div
                className={cn(
                  "text-base font-black tracking-tight leading-none transition-colors",
                  isTop1
                    ? "text-emerald-600 dark:text-emerald-400 text-lg"
                    : "text-slate-700 dark:text-slate-200"
                )}
              >
                {rate.price_proposed.toLocaleString()}
                <span className="text-[10px] ml-1 opacity-70 font-bold">
                  {currency}
                </span>
              </div>

              {rate.redemption_price && (
                <div
                  className={cn(
                    "mt-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border shadow-xs",
                    rate.redemption_price === "Редукціон"
                      ? "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20"
                      : "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                  )}
                >
                  {rate.redemption_price}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
