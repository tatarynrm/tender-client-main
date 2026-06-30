"use client";

import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
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
  IActiveTransport,
} from "./services/carrier-statistic.service";
import Loader from "@/shared/components/Loaders/MainLoader";

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

export const CarrierDashboard = () => {
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

  const beginYear = data.work_begin
    ? new Date(data.work_begin).getFullYear()
    : 2014;

  const firstPaymentDate = data.debt_payment?.[0]?.date;

  const waitingPayments = Array.isArray(data.waiting_payment)
    ? data.waiting_payment
    : data.waiting_payment
      ? [data.waiting_payment as any]
      : [];

  const firstPayments = Array.isArray(data.debt_payment)
    ? data.debt_payment
    : data.debt_payment
      ? [data.debt_payment as any]
      : [];

  console.log("Дані з бекенду (waitingPayments):", waitingPayments);
  console.log("Дані з бекенду (firstPayments):", firstPayments);

  // Dynamically find the array of active transports
  const activeTransports: IActiveTransport[] = Array.isArray(data)
    ? (data as unknown as IActiveTransport[])
    : ((Object.values(data).find(
        (val) => Array.isArray(val) && val.length > 0 && "kod_zay" in val[0]
      ) ||
        data.zay_list ||
        data.page_main ||
        data.active_transports ||
        []) as IActiveTransport[]);

  return (
    <div className="flex flex-col gap-4 mt-4 w-full">
      {/* 1. Блакитний банер */}
      <div className="bg-[#3B52B4] rounded-2xl p-6 text-white shadow-sm w-full flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <div className="text-sm text-blue-100">
            Співпраця з <span className="font-bold text-white ml-1">{data.work_begin ? format(parseISO(data.work_begin), "dd.MM. yyyy") : "22.05. 2014"}</span>
          </div>
          <div className="text-sm text-blue-100">
            Всього виконаних рейсів <span className="font-bold text-white ml-1">{data.zay_count_all}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <div className="text-sm text-blue-100">
            Виграно тендерів <span className="font-bold text-white ml-1">126</span>
          </div>
          <div className="text-sm text-blue-100">
            Успішність участі в тендерах <span className="font-bold text-white ml-1">90%</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/3 md:items-end md:text-right">
          <div className="text-sm text-blue-100 flex gap-2 md:justify-end">
            <span>Очікування надходжень</span>
            <div className="flex flex-col items-start md:items-end">
              {waitingPayments.length ? (
                waitingPayments.map((payment, idx) => (
                  <span key={idx} className="font-bold text-white whitespace-nowrap">
                    {payment.sum.toLocaleString("uk-UA")} {payment.ids || payment.code || payment.valut}
                  </span>
                ))
              ) : (
                <span className="font-bold text-white">154 820 грн</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4 картки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-[#D4DEF8] flex flex-col justify-between">
          <div className="flex items-center gap-4 pb-3 border-b border-[#D4DEF8]">
            <span className="text-4xl font-bold text-[#3B52B4] w-10 text-center">7</span>
            <span className="text-sm font-bold text-[#3B52B4] leading-tight">Заплановані та активні<br />тендери</span>
          </div>
          <div className="flex items-center gap-4 pt-3">
            <span className="text-3xl font-bold text-[#EF4444] w-10 text-center">2</span>
            <span className="text-sm font-bold text-[#EF4444] leading-tight">Завершуються сьогодні</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-[#D4DEF8] flex items-center justify-center gap-6">
          <span className="text-[56px] font-bold text-[#3B52B4] leading-none">
            {data.zay_count_active}
          </span>
          <span className="text-sm font-bold text-[#3B52B4] leading-tight">
            Активні<br />перевезення
          </span>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-[#D4DEF8] flex flex-col justify-between">
          <div className="flex items-center gap-4 pb-3 border-b border-[#D4DEF8]">
            <span className="text-3xl font-bold text-[#3B52B4] w-8 text-center">{data.doc_waiting}</span>
            <span className="text-sm font-bold text-[#3B52B4]">Очікуються документи</span>
          </div>
          <div className="flex items-center gap-4 pt-3">
            <span className="text-3xl font-bold text-[#3B52B4] w-8 text-center">{data.doc_no_set}</span>
            <span className="text-sm font-bold text-[#3B52B4]">Некомплектні документи</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#D4DEF8] flex items-center gap-4">
          <div className="flex flex-col items-center justify-center w-1/3 border-r border-[#D4DEF8] pr-2">
            <span className="text-[40px] font-bold text-[#3B52B4] leading-none">
              {firstPaymentDate ? format(parseISO(firstPaymentDate), "d") : "28"}
            </span>
            <span className="text-sm font-bold text-[#3B52B4] mt-1">
              {firstPaymentDate ? format(parseISO(firstPaymentDate), "MMMM", { locale: uk }) : "червня"}
            </span>
          </div>
          <div className="flex flex-col w-2/3 pl-2 justify-center">
            <span className="text-sm font-bold text-[#3B52B4] leading-tight mb-2">
              Запланована дата<br/>та сума оплати
            </span>
            <div className="flex flex-col">
              {firstPayments.length ? (
                firstPayments.map((fp, idx) => (
                  <span key={idx} className={`text-lg font-bold ${firstPaymentDate ? 'text-emerald-500' : 'text-emerald-500'} whitespace-nowrap leading-none`}>
                    {fp.sum.toLocaleString("uk-UA")} {fp.ids || fp.code || fp.valut}
                  </span>
                ))
              ) : (
                <span className="text-lg font-bold text-emerald-500 leading-none">54 000 грн</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Графік та Списки */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Графік */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D4DEF8] flex flex-col h-[300px]">
          <h3 className="text-sm font-bold text-[#3B52B4] uppercase tracking-wider mb-4 pb-3 border-b border-[#D4DEF8]">
            ПЕРЕВЕЗЕННЯ ПО МІСЯЦЯХ
          </h3>
          <div className="flex-1 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.zay_chart} margin={{ top: 20, right: 0, left: 0, bottom: 10 }}>
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
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={32}>
                  <LabelList
                    dataKey="count"
                    position="top"
                    content={(props: any) => {
                      const { x, y, width, value, index } = props;
                      const isCurrent = data.zay_chart[index].current_month === 1;
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
                  {data.zay_chart.map((entry, index) => (
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

        {/* Актуальні події */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D4DEF8] flex flex-col h-[300px]">
          <h3 className="text-sm font-bold text-[#3B52B4] uppercase tracking-wider mb-4 pb-3 border-b border-[#D4DEF8]">
            АКТУАЛЬНІ ПОДІЇ
          </h3>
          <div className="flex flex-col flex-1 overflow-y-auto pr-2 custom-scrollbar">

            {data.last_events && data.last_events.length > 0 ? (
              data.last_events.map((event, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-[#3B52B4]">{event.info}</span>
                    <span className="text-xs text-[#8BA6EB] font-medium">{format(parseISO(event.date), "dd.MM.yy")}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      event.label.toLowerCase().includes("oplata") || event.label.toLowerCase().includes("оплата")
                        ? "bg-[#D1FAE5] text-[#059669]"
                        : event.label.toLowerCase().includes("docin") || event.label.toLowerCase().includes("документ")
                        ? "bg-[#FFEDD5] text-[#D97706]"
                        : "bg-[#E0E7FF] text-[#3B52B4]"
                    }`}
                  >
                    {event.label === 'OPLATA' ? 'Оплата' : event.label === 'DOCIN' ? 'Документ' : event.label}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500 py-3">Немає актуальних подій</div>
            )}
          </div>
        </div>
      </div>


      {activeTransports && activeTransports.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D4DEF8] flex flex-col w-full">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#D4DEF8]">
            <h3 className="text-sm font-bold text-[#3B52B4] uppercase tracking-wider">
              ПЕРЕВЕЗЕННЯ
            </h3>
            <button className="text-sm font-bold text-[#3B52B4] hover:underline">
              Переглянути всі
            </button>
          </div>
          <div className="flex flex-col overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
            {activeTransports.map((transport, idx) => (
              <div
                key={transport.kod_zay || idx}
                className="flex items-center justify-between py-3 border-b border-[#D4DEF8] last:border-0"
              >
                <div className="flex flex-col w-1/3 pr-2">
                  <span className="text-sm font-bold text-[#3B52B4] truncate">
                    {transport.zav_town} - {transport.rozv_town}
                  </span>
                  <span className="text-xs text-[#8BA6EB] font-medium truncate">
                    {transport.zay_num}{" "}
                    {transport.zav_date
                      ? format(parseISO(transport.zav_date), "dd.MM.yyyy")
                      : ""}{" "}
                    {transport.manager}
                  </span>
                </div>
                <div className="flex flex-col w-1/3 px-2">
                  <span className="text-sm font-bold text-[#334155] truncate">
                    {transport.am_mark || ""} {transport.am} {transport.pr ? `/ ${transport.pr}` : ""}
                  </span>
                  <span className="text-xs text-[#8BA6EB] font-medium truncate">
                    {transport.driver} ({transport.driver_phone})
                  </span>
                </div>
                <div className="flex items-center justify-end w-1/3 pl-2 gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                      transport.status && (transport.status.toLowerCase().includes("активн") || transport.status.toLowerCase().includes("робот"))
                        ? "bg-[#E0E7FF] text-[#3B52B4]"
                        : transport.status && transport.status.toLowerCase().includes("документ")
                        ? "bg-[#FFEDD5] text-[#D97706]"
                        : "bg-[#D1FAE5] text-[#059669]"
                    }`}
                  >
                    {transport.status || "Доставлено"}
                  </span>
                  <span className="text-lg font-bold text-emerald-500 whitespace-nowrap w-32 text-right">
                    {transport.fraht ? `${transport.fraht.toLocaleString("uk-UA")} ${transport.valut_code || transport.valut || ""}` : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
