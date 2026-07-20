import React from "react";
import { Clock, User, Calendar, Box, Weight, MapPin, Truck, Mail, Phone, ChevronLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

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
  const route = `${order.zav_town || 'Невідомо'} -> ${order.rozv_town || 'Невідомо'}`;
  const orderNum = order.zay_num ? `#${order.zay_num}` : '';
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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
      <div className="flex flex-col gap-2.5">
        <div className="text-[17px] text-[#415A88] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wide">
          <span className="text-[#415A88]">{route}</span>
          <span className=" text-[#415A88] dark:text-slate-400 ">{orderNum}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[13px] font-semibold text-[#7C93B8] dark:text-slate-400 uppercase tracking-wider">
          {date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 opacity-70" />
              <span>{date}</span>
            </div>
          )}
          {category && (
            <div className="flex items-center gap-1.5">
              <Box className="w-4 h-4 opacity-70" />
              <span>{category}</span>
            </div>
          )}
          {weight && (
            <div className="flex items-center gap-1.5">
              <Weight className="w-4 h-4 opacity-70" />
              <span>{weight}</span>
            </div>
          )}
          {distance && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 opacity-70" />
              <span>{distance}</span>
            </div>
          )}
          {type && (
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 opacity-70" />
              <span>{type}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 md:ml-auto">
        {/* Manager Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 rounded-full border border-[#D9E2F2] dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition outline-none">
              <div className="p-1 border border-[#D9E2F2] dark:border-slate-500 rounded-full">
                <User size={12} className="text-[#51648B] dark:text-slate-300" />
              </div>
              <span className="text-[13px] font-medium text-[#51648B] dark:text-slate-200">
                {managerName}
              </span>
              <ChevronLeft size={14} className="text-[#8B9EC7] -rotate-90 ml-0.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-[#D9E2F2] dark:border-slate-700 shadow-sm p-1 bg-white dark:bg-slate-800">
            <DropdownMenuItem
              className="flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-[#F4F7FB] dark:hover:bg-slate-700 focus:bg-[#F4F7FB] dark:focus:bg-slate-700 text-[#51648B] dark:text-slate-200"
              onClick={(e) => { e.stopPropagation(); if (managerEmail && managerEmail !== "Немає email") window.location.href = `mailto:${managerEmail}`; }}
            >
              <Mail size={16} className="text-[#8B9EC7]" />
              <span className="text-xs font-medium truncate">{managerEmail}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-[#F4F7FB] dark:hover:bg-slate-700 focus:bg-[#F4F7FB] dark:focus:bg-slate-700 text-[#51648B] dark:text-slate-200"
              onClick={(e) => { e.stopPropagation(); if (managerPhone && managerPhone !== "Немає телефону") window.location.href = `tel:${managerPhone.replace(/[^0-9+]/g, '')}`; }}
            >
              <Phone size={16} className="text-[#8B9EC7]" />
              <span className="text-xs font-medium">{managerPhone}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {driver && driver !== 'Не призначено' && (
          <div className="flex items-center gap-2 text-[15px] font-semibold text-slate-600 dark:text-slate-300">
            <User className="w-5 h-5 opacity-70" />
            <span className="text-[#32538D]">{driver}</span>
          </div>
        )}

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FDE8EB] dark:bg-red-500/10 text-[#E44042] dark:text-red-400 font-bold text-[15px] border border-[#E44042] dark:border-red-500/20">
          <Clock className="w-5 h-5" />
          <span>{timeLeft}</span>
        </div>
      </div>
    </div>
  );
}
