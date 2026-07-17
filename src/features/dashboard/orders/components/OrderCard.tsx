import React from "react";
import { Clock, User, Calendar, Box, Weight, MapPin, Truck } from "lucide-react";

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
  const driver = order.driver || 'Не призначено';
  const timeLeft = formatTimeElapsed(order.datvv);

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

      <div className="flex items-center gap-6 md:ml-auto">
        <div className="flex items-center gap-2 text-[15px] font-semibold text-slate-600 dark:text-slate-300">
          <User className="w-5 h-5 opacity-70" />
          <span className="text-[#32538D]">{driver}</span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FDE8EB] dark:bg-red-500/10 text-[#E44042] dark:text-red-400 font-bold text-[15px] border border-[#E44042] dark:border-red-500/20">
          <Clock className="w-5 h-5" />
          <span>{timeLeft}</span>
        </div>
      </div>
    </div>
  );
}
