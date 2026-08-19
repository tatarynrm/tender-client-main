"use client";

import { User, Phone, Truck, Mail, ChevronLeft, Calendar, Weight, Box } from "lucide-react";
import Flag from "react-flagkit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

function formatLocation(town?: string | null, country?: string | null, obl?: string | null) {
  if (!town) return "Невідомо";
  if (country?.toUpperCase() === "UA" && obl) {
    const cleanObl = obl.replace(/\s*(обл\.?|область)\s*/gi, "").trim();
    return `${town} (${cleanObl} обл.)`;
  }
  return town;
}

function formatNumber(value?: number | null) {
  if (value == null) return "";
  return new Intl.NumberFormat("uk-UA").format(value);
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date
    .toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" })
    .replace(/\./g, ".");
}

function getStatusColor(codeStatus?: string | null) {
  switch (codeStatus) {
    case "ZAMOVL":
      return "bg-slate-100 text-slate-600";
    case "PLAN":
      return "bg-blue-100 text-blue-600";
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-600";
    case "DOC_WAIT":
      return "bg-indigo-100 text-blue-600";
    case "DOC_WAIT_20":
      return "bg-yellow-100 text-yellow-700";
    case "DOC_NO_SET":
      return "bg-red-100 text-red-600";
    case "DOC_ACT":
      return "bg-rose-100 text-rose-700";
    case "DOC_OPR":
      return "bg-indigo-100 text-indigo-600";
    case "OPL_GRAFIK":
      return "bg-purple-100 text-purple-600";
    case "CLOSED":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

export interface ITransportationCardManager {
  imja?: string | null;
  prizv?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface ITransportationCardItem {
  kod_zay: number;
  zay_num: string;
  zav_date?: string | null;
  zav_town?: string | null;
  zav_country?: string | null;
  zav_obl?: string | null;
  rozv_town?: string | null;
  rozv_country?: string | null;
  rozv_obl?: string | null;
  rozv_date?: string | null;
  am?: string | null;
  pr?: string | null;
  driver?: string | null;
  driver_phone?: string | null;
  manager?: ITransportationCardManager | null;
  fraht?: number | null;
  valut?: string | null;
  vant_name?: string | null;
  vant_ton?: number | null;
  code_status?: string | null;
  status_name?: string | null;
}

/**
 * Картка перевезення — єдиний формат для /dashboard/cabinet/transportations
 * і вкладки "Невиставлені рахунки" у фінансах (обидва списки повертає та сама
 * процедура p_carrier.run → perev_list, тож формат навмисно спільний).
 */
export const TransportationCard = ({
  item,
  onClick,
  showStatus = false,
}: {
  item: ITransportationCardItem;
  onClick?: () => void;
  showStatus?: boolean;
}) => {
  const statusColor = getStatusColor(item.code_status);

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden transition ${onClick ? "cursor-pointer hover:shadow-md hover:border-blue-200 dark:hover:border-slate-700" : ""
        }`}
    >
      {/* Top row */}
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:p-6 md:flex-row md:items-start md:justify-between lg:gap-6">
        <div className="flex flex-col gap-1 min-w-0 md:w-[55%] lg:w-[60%]">
          <div className="text-[10px] font-bold text-[#8BA6EB] uppercase tracking-wider">
            Заявка № {item.zay_num} {item.zav_date && `від ${formatDate(item.zav_date)}`}
          </div>
          <div className="text-[15px] text-slate-800 dark:text-slate-100 font-extrabold flex flex-wrap items-center gap-x-2 gap-y-1 uppercase tracking-wide break-words">
            <span className="flex items-center gap-1.5">
              {item.zav_country && (
                <span className="flex items-center gap-1 text-slate-400 text-[11px] font-bold">
                  <Flag country={item.zav_country} size={14} className="rounded-[2px] shadow-sm" />
                  {item.zav_country}
                </span>
              )}
              <span className="text-[#3B52B4] dark:text-blue-400">
                {formatLocation(item.zav_town?.split(",")[0], item.zav_country, item.zav_obl)}
              </span>
            </span>
            <span className="text-[#8BA6EB] font-light text-sm">➔</span>
            <span className="flex items-center gap-1.5">
              {item.rozv_country && (
                <span className="flex items-center gap-1 text-slate-400 text-[11px] font-bold">
                  <Flag country={item.rozv_country} size={14} className="rounded-[2px] shadow-sm" />
                  {item.rozv_country}
                </span>
              )}
              <span className="text-[#3B52B4] dark:text-blue-400">
                {formatLocation(item.rozv_town?.split(",")[0], item.rozv_country, item.rozv_obl)}
              </span>
            </span>
          </div>

          <div className="flex flex-col gap-1 text-[11px] font-bold text-[#7C93B8] uppercase tracking-wider mt-1">
            {item.zav_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 opacity-70 shrink-0" />
                <span>Дата завантаження: {formatDate(item.zav_date)}</span>
              </div>
            )}
            {item.rozv_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 opacity-70 shrink-0" />
                <span>Дата розвантаження: {formatDate(item.rozv_date)}</span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {item.vant_ton != null && (
                <div className="flex items-center gap-1">
                  <Weight className="w-3.5 h-3.5 opacity-70 shrink-0" />
                  <span>Вага: {item.vant_ton} Т</span>
                </div>
              )}
              {item.vant_name && (
                <div className="flex items-center gap-1">
                  <Box className="w-3.5 h-3.5 opacity-70 shrink-0" />
                  <span>Вантаж: {item.vant_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 shrink-0 items-start md:items-end md:text-right">
          <span className="text-[10px] font-bold text-[#8BA6EB] uppercase tracking-widest whitespace-nowrap">
            Сума фрахту
          </span>
          <span className="text-lg sm:text-xl font-bold text-[#3B52B4] dark:text-blue-400 leading-tight whitespace-nowrap">
            {formatNumber(item.fraht)} {item.valut}
          </span>
        </div>
      </div>

      {/* Middle row — статус перевезення по центру картки */}
      {showStatus && item.status_name && (
        <div className="border-t border-blue-50 dark:border-slate-800 bg-blue-50/40 dark:bg-slate-800/40 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
          <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-widest whitespace-nowrap">
            Статус
          </span>
          <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ring-1 ring-inset ring-black/5 ${statusColor}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {item.status_name}
          </span>
          {item.code_status === "DOC_WAIT_20" && (
            <span className="text-[12px] font-semibold text-yellow-600 whitespace-nowrap">
              більше 20 днів
            </span>
          )}
        </div>
      )}

      {/* Bottom row (Driver info & Manager) */}
      <div className="border-t border-blue-50 dark:border-slate-800 px-4 py-2.5 sm:px-5 lg:px-6 flex flex-wrap items-center justify-between gap-y-2 text-xs text-blue-400">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 min-w-0">
          <div className="flex items-center gap-1.5 font-medium min-w-0">
            <Truck size={14} className="text-gray-400 shrink-0" />
            <span className="uppercase text-gray-700 dark:text-slate-300 truncate">{item.am}</span>
            {item.pr && <span className="uppercase text-gray-500 dark:text-slate-400 truncate">/ {item.pr}</span>}
          </div>
          <div className="flex items-center gap-1.5 font-medium min-w-0">
            <User size={14} className="text-gray-400 shrink-0" />{" "}
            <span className="truncate text-gray-700 dark:text-slate-300">{item.driver}</span>
          </div>
        </div>

        <div className="flex items-center shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-full border border-blue-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition outline-none">
                <div className="p-1 border border-blue-100 dark:border-slate-600 rounded-full">
                  <User size={12} className="text-blue-300" />
                </div>
                <span className="text-[12px] font-medium text-blue-500 dark:text-blue-400 hidden sm:block">
                  {item.manager?.imja} {item.manager?.prizv}
                </span>
                <span className="text-[12px] font-medium text-blue-500 dark:text-blue-400 sm:hidden">
                  Менеджер
                </span>
                <ChevronLeft size={14} className="text-blue-300 -rotate-90" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-blue-100 dark:border-slate-700 shadow-sm p-1 bg-white dark:bg-slate-800">
              <DropdownMenuItem
                className="flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 focus:bg-blue-50 dark:focus:bg-slate-700 text-gray-600 dark:text-slate-200"
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.manager?.email) window.location.href = `mailto:${item.manager.email}`;
                }}
              >
                <Mail size={16} className="text-blue-300" />
                <span className="text-xs font-medium truncate">{item.manager?.email || "Немає email"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 focus:bg-blue-50 dark:focus:bg-slate-700 text-gray-600 dark:text-slate-200"
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.manager?.phone)
                    window.location.href = `tel:${item.manager.phone.replace(/[^0-9+]/g, "")}`;
                }}
              >
                <Phone size={16} className="text-blue-300" />
                <span className="text-xs font-medium">{item.manager?.phone || "Немає телефону"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
