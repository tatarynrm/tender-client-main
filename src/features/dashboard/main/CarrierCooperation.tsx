"use client";

import React, { useEffect, useState } from "react";
import { format, parseISO, differenceInMonths, differenceInYears } from "date-fns";
import { uk } from "date-fns/locale";
import { useProfile } from "@/shared/hooks/useProfile";
import {
  carrierStatisticService,
  ICarrierCooperation,
} from "./services/carrier-statistic.service";
import Loader from "@/shared/components/Loaders/MainLoader";
import { ChevronDown, ArrowRight, Info, CheckCircle2 } from "lucide-react";

export const CarrierCooperation = () => {
  const { profile, isProfileLoading } = useProfile();
  const [data, setData] = useState<ICarrierCooperation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDogIndex, setActiveDogIndex] = useState(0);
  const [activeDirectionTab, setActiveDirectionTab] = useState<'reg' | 'mn'>('reg');

  useEffect(() => {
    const fetchData = async () => {
      if (profile?.company?.migrate_id) {
        try {
          const cooperationData = await carrierStatisticService.getCarrierCooperation(
            profile.company.migrate_id
          );
          setData(cooperationData);
        } catch (error) {
          console.error("Failed to fetch carrier cooperation data", error);
        } finally {
          setLoading(false);
        }
      } else if (!isProfileLoading) {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile, isProfileLoading]);

  if (isProfileLoading || loading) return <Loader />;
  if (!data) return <div className="text-center p-4">Немає даних для відображення</div>;

  // Форматування тривалості
  let durationStr = "";
  if (data.work_begin) {
    const beginDate = parseISO(data.work_begin);
    const years = differenceInYears(new Date(), beginDate);
    const months = differenceInMonths(new Date(), beginDate) % 12;
    durationStr = `${years} р. ${months} місяці`;
  }

  // Форматування обороту
  const formatOborot = (val: number | string) => {
    if (!val) return "0 грн";
    const num = Number(val);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(0)} м. грн`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)} тис. грн`;
    }
    return `${num} грн`;
  };

  // Вибір першого договору для відображення
  const activeDog = data.dog_list_active && data.dog_list_active.length > 0
    ? data.dog_list_active[activeDogIndex] || data.dog_list_active[0]
    : null;

  // Підготовка напрямків (Пріоритети тендерів)
  const priorities = data.direction_list_mn?.slice(0, 4) || [];
  const priorityBadges = [
    { text: "Топ", color: "text-[#059669]", bg: "bg-[#D1FAE5]" },
    { text: "Стабільний", color: "text-[#EA580C]", bg: "bg-[#FFEDD5]" },
    { text: "Зростає", color: "text-[#D97706]", bg: "bg-[#FEF3C7]" },
    { text: "Мало даних", color: "text-[#64748B]", bg: "bg-[#F1F5F9]" },
  ];

  // Підготовка напрямків співпраці (Регіональні / Всі)
  const activeDirectionsList = activeDirectionTab === 'reg' ? data.direction_list_reg : data.direction_list_mn;
  const activeDirectionsCount = activeDirectionsList?.reduce((acc: number, cur: any) => acc + (cur.zay_count || 0), 0) || 1;
  const activeDirections = activeDirectionsList?.slice(0, 6) || [];

  return (
    <div className="flex flex-col gap-3 mt-2 w-full text-slate-800">
      {/* 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1 */}
        <div className="bg-white rounded-3xl px-4 py-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-1">
          <span className="text-3xl font-bold text-[#3B52B4] leading-none">
            {data.zay_count_all || 0}
          </span>
          <span className="text-xs font-medium text-slate-500">Рейсів виконано за весь час</span>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl px-4 py-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-1">
          <span className="text-3xl font-bold text-[#3B52B4] leading-none">
            {formatOborot(data.oborot)}
          </span>
          <span className="text-xs font-medium text-slate-500">Загальний оборот</span>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl px-4 py-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-1">
          <span className="text-3xl font-bold text-[#3B52B4] leading-none">
            {durationStr || data.work_len_days || "—"}
          </span>
          <span className="text-xs font-medium text-slate-500">
            Тривалість з {data.work_begin ? format(parseISO(data.work_begin), "dd.MM.yyyy") : ""}
          </span>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-3xl px-4 py-4 shadow-sm border border-[#3B52B4] flex flex-col items-center justify-center gap-2 text-[#3B52B4]">
          <span className="text-sm font-bold">Всі контакти ICT</span>
          <button className="bg-[#3B52B4] text-white rounded-xl w-full py-2 font-bold text-xs hover:bg-[#2d4090] transition-colors uppercase">
            НАПИСАТИ
          </button>
        </div>
      </div>

      {/* Section 1: УМОВИ СПІВПРАЦІ */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[#3B52B4] uppercase tracking-wider">
          УМОВИ СПІВПРАЦІ
        </h3>

        {data.dog_list_active && data.dog_list_active.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 mb-1">
              {data.dog_list_active.map((dog: any, idx: number) => (
                <span
                  key={idx}
                  onClick={() => setActiveDogIndex(idx)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer transition-colors ${idx === activeDogIndex
                    ? "bg-[#EEF2FF] text-[#3B52B4] border-[#C7D2FE]"
                    : "bg-white text-slate-400 font-medium border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  {dog.firma || "Договір"}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-2 text-sm font-medium">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-[#8BA6EB]">Договір</span>
                <span className="font-bold text-[#3B52B4]">
                  {activeDog?.dog_num ? `№ ${activeDog.dog_num} ` : "Без номера "}
                  від {activeDog?.dog_date ? format(parseISO(activeDog.dog_date), "dd.MM.yyyy") : ""}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-[#8BA6EB]">Відстрочка оплати</span>
                <span className="font-bold text-slate-700">{activeDog?.payment_procedure || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-[#8BA6EB]">Напрямки співпраці</span>
                <div className="flex gap-2">
                  {activeDog?.perev_mn === 1 && (
                    <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#3B52B4] rounded-full text-[10px]">Міжнародні</span>
                  )}
                  {activeDog?.perev_ukr === 1 && (
                    <span className="px-2 py-0.5 bg-[#FFF7ED] text-[#EA580C] rounded-full text-[10px]">Локальні</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-[#8BA6EB]">Термін дії договору</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">
                    {activeDog?.termin ? format(parseISO(activeDog.termin), "dd.MM.yyyy") : "—"}
                  </span>
                  <span className="text-[#8BA6EB] text-[10px]">автопролонгація</span>
                </div>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-[#8BA6EB]">Документообіг</span>
                <span className="font-bold text-slate-700">
                  {activeDog?.edo_vchasno === 1 ? "ЕДО «Вчасно»" : activeDog?.edo_medok === 1 ? "ЕДО «M.E.Doc»" : "Паперовий"}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-50 pb-2 cursor-pointer group">
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-red-400" />
                  <span className="font-bold text-slate-700 group-hover:text-[#3B52B4] transition-colors">Штрафні санкції для перевізника</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              <div className="flex justify-between items-center border-b border-slate-50 pb-2 cursor-pointer group">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-slate-700 group-hover:text-[#3B52B4] transition-colors">Компенсації перевізнику від ICT</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* <div className="flex justify-between items-center pt-1">
                <span className="text-[#8BA6EB]">Повний текст договору</span>
                <button className="flex items-center gap-1 font-bold text-[#3B52B4] hover:underline">
                  Переглянути <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div> */}
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-500 pb-2">Немає активних договорів</div>
        )}
      </div>

      {/* Grid for Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Section 2: ПРІОРИТЕТИ ТЕНДЕРІВ */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex flex-col gap-1 mb-2">
            <h3 className="text-base font-bold text-[#3B52B4] uppercase tracking-wider">
              ПРІОРИТЕТИ ТЕНДЕРІВ
            </h3>
            <span className="text-xs text-[#8BA6EB]">Напрямки з найвищими шансами виграти (Міжнародні)</span>
          </div>

          <div className="flex flex-col gap-4">
            {priorities.length > 0 ? (
              priorities.map((dir: any, idx: number) => {
                const badge = priorityBadges[idx] || priorityBadges[3];
                return (
                  <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? "bg-[#3B52B4] text-white" : "bg-transparent border border-slate-200 text-slate-500"
                        }`}>
                        {idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{dir.country_zav} → {dir.country_rozv}</span>
                        <span className="text-xs text-[#8BA6EB]">{dir.zay_count} виконаних рейсів</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${badge.bg} ${badge.color}`}>
                        {badge.text}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-slate-500">Немає даних про напрямки</div>
            )}
          </div>
        </div>

        {/* Section 3: НАПРЯМКИ СПІВПРАЦІ */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-[#3B52B4] uppercase tracking-wider">
              НАПРЯМКИ СПІВПРАЦІ
            </h3>
            <span className="text-xs font-bold text-[#3B52B4] hover:underline cursor-pointer">Вся історія рейсів</span>
          </div>

          <div className="flex gap-2 mb-4">
            <span
              onClick={() => setActiveDirectionTab('reg')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-colors ${activeDirectionTab === 'reg'
                  ? "bg-[#EEF2FF] text-[#3B52B4] border-[#C7D2FE]"
                  : "bg-white text-[#8BA6EB] font-medium border-slate-200 hover:bg-slate-50"
                }`}
            >
              Регіональні
            </span>
            <span
              onClick={() => setActiveDirectionTab('mn')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-colors ${activeDirectionTab === 'mn'
                  ? "bg-[#EEF2FF] text-[#3B52B4] border-[#C7D2FE]"
                  : "bg-white text-[#8BA6EB] font-medium border-slate-200 hover:bg-slate-50"
                }`}
            >
              Міжнародні
            </span>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {activeDirections.length > 0 ? (
              activeDirections.map((dir: any, idx: number) => {
                const percentage = Math.round((dir.zay_count / activeDirectionsCount) * 100);
                const title = activeDirectionTab === 'reg' ? `${dir.obl_zav} → ${dir.obl_rozv}` : `${dir.country_zav} → ${dir.country_rozv}`;

                return (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="font-bold text-slate-700 text-sm w-[150px] truncate" title={title}>
                      {title}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-[#3B52B4] h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className={`font-bold text-sm w-10 text-right ${idx === 0 ? "text-[#3B52B4]" : "text-slate-500"}`}>
                      {percentage}%
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-slate-500">Немає регіональних напрямків</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
