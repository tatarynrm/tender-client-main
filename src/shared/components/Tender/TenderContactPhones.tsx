"use client";

import {
  Phone,
  Send as TelegramIcon,
  MessageCircle as WhatsappIcon,
  PhoneCall as ViberIcon,
} from "lucide-react";

import { cn } from "@/shared/utils";
import { IPersonPhone } from "@/features/log/types/tender.type";

// Месенджери, доступні для номера (галочки person_phone).
const MESSENGERS = [
  {
    key: "is_telegram",
    label: "Telegram",
    Icon: TelegramIcon,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    key: "is_viber",
    label: "Viber",
    Icon: ViberIcon,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    key: "is_whatsapp",
    label: "WhatsApp",
    Icon: WhatsappIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
] as const;

const MessengerBadges = ({ phone }: { phone: IPersonPhone }) => {
  const active = MESSENGERS.filter(
    (m) => (phone as unknown as Record<string, boolean>)[m.key],
  );
  if (active.length === 0) return null;

  return (
    <span className="ml-auto flex items-center gap-1">
      {active.map(({ key, label, Icon, color, bg }) => (
        <span
          key={key}
          title={label}
          className={cn(
            "flex items-center justify-center rounded-full p-1",
            bg,
            color,
          )}
        >
          <Icon size={12} />
        </span>
      ))}
    </span>
  );
};

interface TenderContactPhonesProps {
  phones?: IPersonPhone[];
}

// Телефони автора тендера в блоці «Контактна інформація» деталей тендера:
// по одному рядку на кожен номер у тому ж стилі, що й решта рядків картки,
// з tel-посиланням і бейджами месенджерів. Якщо номерів немає —
// лишаємо колишній напис «Немає телефону».
export const TenderContactPhones = ({ phones }: TenderContactPhonesProps) => {
  const list = (phones ?? []).filter((p) => p?.phone?.trim());

  if (list.length === 0) {
    return (
      <div className="flex items-center gap-4 h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 px-4">
        <Phone size={16} className="text-slate-400" />
        <span className="text-[13px] font-bold text-slate-900 dark:text-white">
          Немає телефону
        </span>
      </div>
    );
  }

  return (
    <>
      {list.map((p) => (
        <a
          key={p.id}
          href={`tel:${p.phone}`}
          className="flex items-center gap-4 h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 px-4 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Phone size={16} className="text-slate-400 shrink-0" />
          <span className="text-[13px] font-bold text-slate-900 dark:text-white">
            {p.phone}
          </span>
          <MessengerBadges phone={p} />
        </a>
      ))}
    </>
  );
};
