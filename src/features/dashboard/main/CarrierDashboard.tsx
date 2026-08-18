"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, differenceInMonths, differenceInYears } from "date-fns";
import { uk } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { useProfile } from "@/shared/hooks/useProfile";
import {
  carrierStatisticService,
  ICarrierStatistic,
  ITenderStatistic,
  ILastEvent,
  IActiveDog,
  IDirectionMn,
  IDirectionReg,
} from "./services/carrier-statistic.service";
import Loader from "@/shared/components/Loaders/MainLoader";
import {
  Handshake,
  Truck,
  Wallet,
  FileText,
  Clock,
  Route,
  CalendarClock,
  FileCheck2,
} from "lucide-react";

const CustomXAxisTick = ({ x, y, payload }: any) => {
  const date = parseISO(payload.value);
  const month = format(date, "MMM", { locale: uk });
  const year = format(date, "yyyy");
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#3B52B4" fontSize={12} fontWeight={700}>
        {month.charAt(0).toUpperCase() + month.slice(1)}
      </text>
      <text x={0} y={0} dy={30} textAnchor="middle" fill="#8BA6EB" fontSize={12} fontWeight={500}>
        {year}
      </text>
    </g>
  );
};

type ChartPoint = { month: string; count: number; current_month: number };

/**
 * Графік «Перевезення по місяцях» винесено в окремий memo-компонент, щоб
 * інтерактив в інших блоках (перемикання договорів/напрямків) не перемальовував
 * його й не запускав повторну анімацію recharts. Анімацію теж вимкнено —
 * дашборд статичний, зайве блимання цифр не потрібне.
 */
const MonthlyChart = React.memo(function MonthlyChart({
  chartData,
}: {
  chartData: ChartPoint[];
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D4DEF8] flex flex-col h-[300px]">
      <h3 className="text-sm font-bold text-[#3B52B4] uppercase tracking-wider mb-4 pb-3 border-b border-[#D4DEF8]">
        ПЕРЕВЕЗЕННЯ ПО МІСЯЦЯХ
      </h3>
      <div className="flex-1 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 10 }}>
            <XAxis
              dataKey="month"
              tick={<CustomXAxisTick />}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border border-[#7C98CB] shadow-md rounded-lg">
                      <p className="text-xs font-bold text-slate-700">{payload[0].value} рейсів</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={32} isAnimationActive={false}>
              <LabelList
                dataKey="count"
                position="top"
                content={(props: any) => {
                  const { x, y, width, value, index } = props;
                  const isCurrent = chartData[index]?.current_month === 1;
                  return (
                    <text
                      x={x + width / 2}
                      y={y - 8}
                      fill={isCurrent ? "#3B52B4" : "#8BA6EB"}
                      textAnchor="middle"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {value}
                    </text>
                  );
                }}
              />
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.current_month === 1 ? "#3B52B4" : "#D4DEF8"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

/**
 * Блок «Умови співпраці». Тримає власний стан обраного договору, тому клік по
 * договору перемальовує лише цю картку, а не всю сторінку (і не графік).
 */
function CooperationTerms({ dogList }: { dogList: IActiveDog[] }) {
  const [activeDogIndex, setActiveDogIndex] = useState(0);

  const activeDog =
    dogList.length > 0 ? dogList[activeDogIndex] || dogList[0] : null;

  const hasEdo = activeDog?.edo_vchasno === 1 || activeDog?.edo_medok === 1;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D4DEF8] flex flex-col gap-4">
      <h3 className="text-sm font-bold text-[#3B52B4] uppercase tracking-wider">
        ДОГОВОРИ
      </h3>

      {dogList.length > 0 ? (
        <>
          {/* Перемикач договорів */}
          <div className="flex flex-wrap gap-2">
            {dogList.map((dog, idx) => (
              <span
                key={dog.kod_dog ?? idx}
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

          {/* Рядки умов — легкі картки-рядки з іконками для читабельності */}
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[#F7F9FF]">
              <span className="flex items-center gap-2 text-[#8BA6EB] font-medium shrink-0">
                <FileText className="w-4 h-4" /> Договір
              </span>
              <span className="font-bold text-[#3B52B4] text-right">
                {activeDog?.dog_num ? `№ ${activeDog.dog_num} ` : "Без номера "}
                від {activeDog?.dog_date ? format(parseISO(activeDog.dog_date), "dd.MM.yyyy") : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[#F7F9FF]">
              <span className="flex items-center gap-2 text-[#8BA6EB] font-medium shrink-0">
                <Clock className="w-4 h-4" /> Відстрочка оплати
              </span>
              <span className="font-bold text-slate-700 text-right">{activeDog?.payment_procedure || "—"}</span>
            </div>

            <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[#F7F9FF]">
              <span className="flex items-center gap-2 text-[#8BA6EB] font-medium shrink-0">
                <Route className="w-4 h-4" /> Напрямки співпраці
              </span>
              <div className="flex flex-wrap justify-end gap-1.5">
                {activeDog?.perev_mn === 1 && (
                  <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#3B52B4] rounded-full text-[10px] font-bold">Міжнародні</span>
                )}
                {activeDog?.perev_ukr === 1 && (
                  <span className="px-2 py-0.5 bg-[#FFF7ED] text-[#EA580C] rounded-full text-[10px] font-bold">Локальні</span>
                )}
                {activeDog?.perev_mn !== 1 && activeDog?.perev_ukr !== 1 && (
                  <span className="font-bold text-slate-400">—</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[#F7F9FF]">
              <span className="flex items-center gap-2 text-[#8BA6EB] font-medium shrink-0">
                <CalendarClock className="w-4 h-4" /> Термін дії договору
              </span>
              <span className="font-bold text-slate-700 text-right">
                {activeDog?.termin ? format(parseISO(activeDog.termin), "dd.MM.yyyy") : "—"}
              </span>
            </div>

            {hasEdo && (
              <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[#F7F9FF]">
                <span className="flex items-center gap-2 text-[#8BA6EB] font-medium shrink-0">
                  <FileCheck2 className="w-4 h-4" /> Документообіг
                </span>
                <span className="font-bold text-emerald-600 text-right">
                  {activeDog?.edo_vchasno === 1 ? "ЕДО «Вчасно»" : "ЕДО «M.E.Doc»"}
                </span>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-sm text-slate-500 pb-2">Немає активних договорів</div>
      )}
    </div>
  );
}

/**
 * Блок «Напрямки співпраці». Стан перемикача (регіональні / міжнародні)
 * локальний, тому не зачіпає решту сторінки.
 */
function CooperationDirections({
  directionMn,
  directionReg,
}: {
  directionMn: IDirectionMn[];
  directionReg: IDirectionReg[];
}) {
  const [activeDirectionTab, setActiveDirectionTab] = useState<"reg" | "mn">("reg");

  const activeDirectionsList =
    activeDirectionTab === "reg" ? directionReg : directionMn;
  const activeDirectionsCount =
    activeDirectionsList.reduce((acc, cur) => acc + (cur.zay_count || 0), 0) || 1;
  const activeDirections = activeDirectionsList.slice(0, 6);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D4DEF8] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#3B52B4] uppercase tracking-wider">
          НАПРЯМКИ СПІВПРАЦІ
        </h3>
      </div>

      <div className="flex gap-2">
        <span
          onClick={() => setActiveDirectionTab("reg")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-colors ${activeDirectionTab === "reg"
            ? "bg-[#EEF2FF] text-[#3B52B4] border-[#C7D2FE]"
            : "bg-white text-[#8BA6EB] font-medium border-slate-200 hover:bg-slate-50"
            }`}
        >
          Регіональні
        </span>
        <span
          onClick={() => setActiveDirectionTab("mn")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-colors ${activeDirectionTab === "mn"
            ? "bg-[#EEF2FF] text-[#3B52B4] border-[#C7D2FE]"
            : "bg-white text-[#8BA6EB] font-medium border-slate-200 hover:bg-slate-50"
            }`}
        >
          Міжнародні
        </span>
      </div>

      <div className="flex flex-col gap-4 mt-1">
        {activeDirections.length > 0 ? (
          activeDirections.map((dir: any, idx: number) => {
            const percentage = Math.round((dir.zay_count / activeDirectionsCount) * 100);
            const title = activeDirectionTab === "reg" ? `${dir.obl_zav} → ${dir.obl_rozv}` : `${dir.country_zav} → ${dir.country_rozv}`;

            return (
              <div key={idx} className="flex items-center gap-4">
                <span className="font-bold text-slate-700 text-sm w-[45%] truncate" title={title}>
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
          <div className="text-sm text-slate-500">
            {activeDirectionTab === "reg" ? "Немає регіональних напрямків" : "Немає міжнародних напрямків"}
          </div>
        )}
      </div>
    </div>
  );
}

export const CarrierDashboard = () => {
  const router = useRouter();
  const { profile, isProfileLoading } = useProfile();
  const [data, setData] = useState<ICarrierStatistic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (profile?.company?.migrate_id) {
        try {
          const stats = await carrierStatisticService.getCarrierStatistic(
            profile.company.migrate_id
          );
          setData(stats);
        } catch (error) {
          console.error("Failed to fetch carrier statistic", error);
        } finally {
          setLoading(false);
        }
      } else if (!isProfileLoading) {
        // If profile is loaded but no migrate_id, stop loading
        setLoading(false);
      }
    };
    fetchData();
  }, [profile, isProfileLoading]);

  if (isProfileLoading || loading) return <Loader />;
  if (!data) return <div className="text-center p-4">Немає даних для відображення</div>;

  // Зведення співпраці тепер приходить вкладеним у cooperation.
  const coop = data.cooperation;

  // Тривалість співпраці для синьої стрічки.
  let durationStr = "";
  if (coop?.work_begin) {
    const beginDate = parseISO(coop.work_begin);
    const years = differenceInYears(new Date(), beginDate);
    const months = differenceInMonths(new Date(), beginDate) % 12;
    durationStr = `${years} років ${months} місяців`;
  }

  // Форматування обороту (як на сторінці «Співпраця»).
  const formatOborot = (val: number | string) => {
    if (!val) return "0 грн";
    const num = Number(val);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(0)} млн грн`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)} тис. грн`;
    }
    return `${num} грн`;
  };

  const currMonthPayable = Array.isArray(coop?.curr_month_payable)
    ? coop.curr_month_payable
    : [];

  const chartData: ChartPoint[] = Array.isArray(data.zay_chart) ? data.zay_chart : [];

  // Тендери — з процедури Postgres tender_statistic, яку бекенд доклеює
  // до оракловської статистики. Може бути відсутня, тому все через ?? 0.
  const tenderStatistic: ITenderStatistic | null = data.tender_statistic ?? null;
  const tendersPlannedActive =
    (tenderStatistic?.count_plan ?? 0) + (tenderStatistic?.count_active ?? 0);
  const tendersEndingToday = tenderStatistic?.count_ending ?? 0;

  // Oracle не знає про тендери й віддає в last_events лише порожній
  // плейсхолдер TENDER — реальна подія приходить з tender_statistic.event.
  // Підставляємо її на місце плейсхолдера, а порожній плейсхолдер ховаємо.
  const oracleEvents: ILastEvent[] = Array.isArray(data.last_events)
    ? data.last_events
    : [];

  const tenderEvent = tenderStatistic?.event;
  const hasTenderEvent =
    !!tenderEvent &&
    Object.values(tenderEvent).some(
      (value) => value !== null && value !== undefined && value !== ""
    );

  const lastEvents: ILastEvent[] = hasTenderEvent
    ? [...oracleEvents]
    : oracleEvents.filter((item) => item.code !== "TENDER");

  if (hasTenderEvent) {
    const mergedTenderEvent: ILastEvent = {
      code: "TENDER",
      label: "Тендер",
      date: null,
      info: null,
      info2: null,
      ...tenderEvent,
    };
    const tenderIdx = lastEvents.findIndex((item) => item.code === "TENDER");

    if (tenderIdx >= 0) lastEvents[tenderIdx] = mergedTenderEvent;
    else lastEvents.unshift(mergedTenderEvent);
  }

  return (
    <div className="flex flex-col gap-4 mt-4 w-full">
      {/* 1. Блакитний банер — дані співпраці (cooperation) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#3B52B4] via-[#3F57BE] to-[#2E409A] text-white shadow-md">
        {/* Декоративні кола */}
        <div className="pointer-events-none absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-20 -left-8 w-52 h-52 rounded-full bg-white/5" />

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:divide-x divide-white/15">
          {/* Початок співпраці */}
          <div className="flex items-center gap-4 md:pr-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 shrink-0">
              <Handshake className="w-6 h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-2xl font-extrabold leading-tight">
                {durationStr || "—"}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-blue-200">
                Співпраця з {coop?.work_begin ? format(parseISO(coop.work_begin), "dd.MM.yyyy") : "—"}
              </span>
            </div>
          </div>

          {/* Рейсів виконано */}
          <div className="flex items-center gap-4 md:px-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-3xl font-extrabold leading-tight">
                {(coop?.zay_count_all ?? 0).toLocaleString("uk-UA")}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-blue-200">
                Рейсів виконано з початку співпраці
              </span>
            </div>
          </div>

          {/* Загальний оборот */}
          <div className="flex items-center gap-4 md:pl-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-3xl font-extrabold leading-tight">
                {formatOborot(coop?.oborot ?? 0)}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-blue-200">
                Загальний оборот
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4 картки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-[#D4DEF8] flex flex-col justify-between">
          <div className="flex items-center gap-4 pb-3 border-b border-[#D4DEF8]">
            <span className="text-4xl font-bold text-[#3B52B4] w-10 text-center">{tendersPlannedActive}</span>
            <span className="text-sm font-bold text-[#3B52B4] leading-tight">Заплановані та активні<br />тендери</span>
          </div>
          <div className="flex items-center gap-4 pt-3">
            <span className="text-3xl font-bold text-[#EF4444] w-10 text-center">{tendersEndingToday}</span>
            <span className="text-sm font-bold text-[#EF4444] leading-tight">Завершуються сьогодні</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-[#D4DEF8] flex items-center justify-center gap-6">
          <span className="text-[56px] font-bold text-[#3B52B4] leading-none">
            {coop?.zay_count_active ?? 0}
          </span>
          <span className="text-sm font-bold text-[#3B52B4] leading-tight">
            Перевезення<br />в роботі
          </span>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-[#D4DEF8] flex flex-col justify-between">
          <div className="flex items-center gap-4 pb-3 border-b border-[#D4DEF8]">
            <span className="text-3xl font-bold text-[#3B52B4] w-8 text-center">{coop?.doc_waiting ?? 0}</span>
            <span className="text-sm font-bold text-[#3B52B4]">Очікуються документи</span>
          </div>
          <div className="flex items-center gap-4 pt-3">
            <span className="text-3xl font-bold text-[#3B52B4] w-8 text-center">{coop?.doc_no_set ?? 0}</span>
            <span className="text-sm font-bold text-[#3B52B4]">Рахунки до врегулювання</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#D4DEF8] flex items-center gap-4">
          <div className="flex flex-col pl-2 justify-center">
            <span className="text-sm font-bold text-[#3B52B4] leading-tight mb-2">
              Плановано до оплати в поточному місяці
            </span>
            <div className="flex flex-col">
              {currMonthPayable.length > 0 ? (
                currMonthPayable.map((fp: any, idx: number) => (
                  <span key={idx} className="text-[22px] font-bold text-emerald-500 whitespace-nowrap leading-tight">
                    {Number(fp.suma).toLocaleString("uk-UA")} {fp.valut_code || fp.valut}
                  </span>
                ))
              ) : (
                <span className="text-[22px] font-bold text-slate-400 leading-tight">0 грн</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Графік та Актуальні події */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MonthlyChart chartData={chartData} />

        {/* Актуальні події */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D4DEF8] flex flex-col h-[300px]">
          <h3 className="text-sm font-bold text-[#3B52B4] uppercase tracking-wider mb-4 pb-3 border-b border-[#D4DEF8]">
            АКТУАЛЬНІ ПОДІЇ
          </h3>
          <div className="flex flex-col flex-1 overflow-y-auto pr-2 custom-scrollbar">

            {lastEvents.length > 0 ? (
              lastEvents.map((event, idx) => {
                // Тендерна подія веде на список активних тендерів, де цей тендер
                // підсвічується. id віддає процедура tender_statistic; поки його
                // немає — рядок лишається звичайним, некликабельним.
                const tenderId = event.code === "TENDER" ? event.id : null;
                const openTender = tenderId
                  ? () => router.push(`/dashboard/tender/active?highlight=${tenderId}`)
                  : undefined;

                return (
                  <div
                    key={idx}
                    onClick={openTender}
                    onKeyDown={
                      openTender
                        ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openTender();
                          }
                        }
                        : undefined
                    }
                    role={openTender ? "button" : undefined}
                    tabIndex={openTender ? 0 : undefined}
                    title={openTender ? "Перейти до тендера" : undefined}
                    className={`group flex items-center justify-between py-3 border-b border-slate-100 last:border-0 ${openTender
                      ? "cursor-pointer -mx-2 px-2 rounded-lg transition-colors hover:bg-[#F3F7FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B52B4]"
                      : ""
                      }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className={`text-sm font-bold text-[#3B52B4] ${openTender ? "group-hover:underline" : ""}`}>{event.info || "Подія"}</span>
                      {event.info2 && (
                        <span className="text-sm font-normal text-[#3B52B4]">{event.info2}</span>
                      )}
                      {event.date && (
                        <span className="text-xs text-[#8BA6EB] font-medium">{format(parseISO(event.date), "dd.MM.yy")}</span>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold ${(event.code ?? event.label ?? '').toLowerCase().includes("oplata") || (event.code ?? event.label ?? '').toLowerCase().includes("оплата")
                        ? "bg-[#D1FAE5] text-[#059669]"
                        : (event.code ?? event.label ?? '').toLowerCase().includes("docin") || (event.code ?? event.label ?? '').toLowerCase().includes("документ")
                          ? "bg-[#FFEDD5] text-[#D97706]"
                          : "bg-[#E0E7FF] text-[#3B52B4]"
                        }`}
                    >
                      {event.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-slate-500 py-3">Немає актуальних подій</div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Умови співпраці (зліва) + Напрямки співпраці (справа) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <CooperationTerms dogList={data.dog_list_active ?? []} />
        <CooperationDirections
          directionMn={data.direction_list_mn ?? []}
          directionReg={data.direction_list_reg ?? []}
        />
      </div>
    </div>
  );
};
