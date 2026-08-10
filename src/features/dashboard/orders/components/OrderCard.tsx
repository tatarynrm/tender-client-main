import React from "react";
import { Clock, User, Calendar, Box, Weight, MapPin, Truck, Mail, Phone, ChevronLeft } from "lucide-react";
import Flag from "react-flagkit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { div } from "three/src/nodes/math/OperatorNode.js";

export interface OrderCardProps {
  order: any;
}

function formatTimeElapsed(dateStr?: string) {
  if (!dateStr) return "Немає даних";

  const datvv = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - datvv.getTime();

  if (diffMs < 0) return "0 хв";

  const diffMins = Math.floor(diffMs / 60000);
  const days = Math.floor(diffMins / (24 * 60));
  const hours = Math.floor((diffMins % (24 * 60)) / 60);
  const minutes = diffMins % 60;

  if (days > 0) return `${days} дн ${hours} год`;
  if (hours > 0) return `${hours} год ${minutes}хв`;
  return `${minutes} хв`;
}

export default function OrderCard({ order }: OrderCardProps) {
  const orderNum = order.zay_num || '—';
  const date = order.zav_date ? new Date(order.zav_date).toLocaleDateString("uk-UA") : '';
  const category = order.vant_name || '';
  const weight = order.vant_ton ? `${order.vant_ton} Т` : '';
  const distance = order.km ? `${order.km} КМ` : '';
  const type = order.pr_type || '';
  const driver = order.driver;
  const timeLeft = formatTimeElapsed(order.datvv);

  const managerName = typeof order.manager === 'object' && order.manager?.imja
    ? `${order.manager.imja} ${order.manager.prizv || ''}`.trim()
    : typeof order.manager === 'string' && order.manager
      ? order.manager
      : order.manager_name || order.author || 'Менеджер ICT';

  const managerEmail = (typeof order.manager === 'object' && order.manager?.email
    ? order.manager.email
    : order.manager_email || order.email) || 'manager@ict.lviv.ua';

  const managerPhone = (typeof order.manager === 'object' && order.manager?.phone
    ? order.manager.phone
    : order.manager_phone || order.usr_phone?.[0]?.phone) || 'Немає телефону';

  const formatLocation = (town?: string, country?: string, obl?: string) => {
    if (!town) return 'Невідомо';
    if (country?.toUpperCase() === 'UA' && obl) {
      const cleanObl = obl.replace(/\s*(обл\.?|область)\s*/gi, "").trim();
      return `${town} (${cleanObl} обл.)`;
    }
    return town;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-bold text-[#8BA6EB] dark:text-blue-400/80 uppercase tracking-wider">
          Заявка № {orderNum} {date && `від ${date}`}
        </div>
        <div className="text-[15px] text-slate-800 dark:text-slate-100 font-extrabold flex flex-wrap items-center gap-x-2 gap-y-1 uppercase tracking-wide">
          <span className="flex items-center gap-1.5">
            {order.zav_country && (
              <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[11px] font-bold">
                <Flag country={order.zav_country} size={14} />
                {order.zav_country}
              </span>
            )}
            <span className="text-[#3B52B4] dark:text-blue-400">
              {formatLocation(order.zav_town, order.zav_country, order.zav_obl)}
            </span>
          </span>
          <span className="text-[#8BA6EB] font-light text-sm">➔</span>
          <span className="flex items-center gap-1.5">
            {order.rozv_country && (
              <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[11px] font-bold">
                <Flag country={order.rozv_country} size={14} />
                {order.rozv_country}
              </span>
            )}
            <span className="text-[#3B52B4] dark:text-blue-400">
              {formatLocation(order.rozv_town, order.rozv_country, order.rozv_obl)}
            </span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-bold text-[#7C93B8] dark:text-slate-400 uppercase tracking-wider mt-1">
          {date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 opacity-70" />
              <span>Дата завантаження: {date}</span>
            </div>
          )}
          {category && (
            <div className="flex items-center gap-1">
              <Box className="w-3.5 h-3.5 opacity-70" />
              <span>Вантаж: {category}</span>
            </div>
          )}
          {weight && (
            <div className="flex items-center gap-1">
              <Weight className="w-3.5 h-3.5 opacity-70" />
              <span>Вага: {weight}</span>
            </div>
          )}
          {distance && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 opacity-70" />
              <span>Відстань: {distance}</span>
            </div>
          )}
          {type && (
            <div className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 opacity-70" />
              <span>Транспорт: {type}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:ml-auto">
        {/* Manager Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-700 rounded-full border border-[#D9E2F2] dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition outline-none">
              <div className="p-0.5 border border-[#D9E2F2] dark:border-slate-500 rounded-full">
                <User size={10} className="text-[#51648B] dark:text-slate-300" />
              </div>
              <span className="text-[11px] font-semibold text-[#51648B] dark:text-slate-200">
                {managerName}
              </span>
              <ChevronLeft size={12} className="text-[#8B9EC7] -rotate-90" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl border-[#D9E2F2] dark:border-slate-700 shadow-sm p-1 bg-white dark:bg-slate-800">
            <DropdownMenuItem
              className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-[#F4F7FB] dark:hover:bg-slate-700 focus:bg-[#F4F7FB] dark:focus:bg-slate-700 text-[#51648B] dark:text-slate-200"
              onClick={(e) => { e.stopPropagation(); if (managerEmail && managerEmail !== "Немає email") window.location.href = `mailto:${managerEmail}`; }}
            >
              <Mail size={14} className="text-[#8B9EC7]" />
              <span className="text-[11px] font-medium truncate">{managerEmail}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-[#F4F7FB] dark:hover:bg-slate-700 focus:bg-[#F4F7FB] dark:focus:bg-slate-700 text-[#51648B] dark:text-slate-200"
              onClick={(e) => { e.stopPropagation(); if (managerPhone && managerPhone !== "Немає телефону") window.location.href = `tel:${managerPhone.replace(/[^0-9+]/g, '')}`; }}
            >
              <Phone size={14} className="text-[#8B9EC7]" />
              <span className="text-[11px] font-medium">{managerPhone}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {driver && driver !== 'Не призначено' && (
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600 dark:text-slate-300">
            <User className="w-4 h-4 opacity-70" />
            <span className="text-[#32538D]">{driver}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FDE8EB] dark:bg-red-500/10 text-[#E44042] dark:text-red-400 font-bold text-[12px] border border-[#E44042] dark:border-red-500/20">
          <Clock className="w-4 h-4" />
          <span>{timeLeft}</span>
        </div>
      </div>
    </div>

  );
}
