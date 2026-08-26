"use client";

import {
  Phone as PhoneIcon,
  Send as TelegramIcon,
  MessageCircle as WhatsappIcon,
  PhoneCall as ViberIcon,
  ChevronDown,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/utils";
import { IPersonPhone } from "@/features/log/types/tender.type";

// Опис месенджерів для галочок person_phone.
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

// Іконки месенджерів, у яких доступний номер.
const MessengerBadges = ({
  phone,
  showLabel = false,
}: {
  phone: IPersonPhone;
  showLabel?: boolean;
}) => {
  const active = MESSENGERS.filter(
    (m) => (phone as unknown as Record<string, boolean>)[m.key],
  );
  if (active.length === 0) return null;

  return (
    <span className="flex items-center gap-1">
      {active.map(({ key, label, Icon, color, bg }) => (
        <span
          key={key}
          title={label}
          className={cn(
            "flex items-center gap-1 rounded-full px-1 py-0.5",
            bg,
            color,
          )}
        >
          <Icon size={11} />
          {showLabel && (
            <span className="text-[10px] font-bold leading-none">{label}</span>
          )}
        </span>
      ))}
    </span>
  );
};

interface TenderPhonesProps {
  phones?: IPersonPhone[];
  className?: string;
}

// Телефони автора тендера: один — інлайн поруч із поштою, декілька — випадайка.
// Адаптивно: інлайн-варіант переноситься у flex-wrap футера, у випадайці —
// повноширинні рядки з tel-посиланнями.
export const TenderPhones = ({ phones, className }: TenderPhonesProps) => {
  const list = (phones ?? []).filter((p) => p?.phone?.trim());

  if (list.length === 0) return null;

  // Один телефон — показуємо поруч із поштою як звичайне посилання.
  if (list.length === 1) {
    const p = list[0];
    return (
      <a
        href={`tel:${p.phone}`}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex items-center gap-1 text-indigo-500 hover:text-indigo-600 transition-colors",
          className,
        )}
      >
        <PhoneIcon size={13} />
        <span>{p.phone}</span>
        <MessengerBadges phone={p} />
      </a>
    );
  }

  // Декілька телефонів — компактна кнопка з випадайкою.
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "flex items-center gap-1 text-indigo-500 hover:text-indigo-600 transition-colors",
            className,
          )}
        >
          <PhoneIcon size={13} />
          <span>{list.length} тел.</span>
          <ChevronDown size={12} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        onClick={(e) => e.stopPropagation()}
        className="w-[min(20rem,calc(100vw-2rem))] p-2"
      >
        <p className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
          Телефони менеджера
        </p>
        <ul className="flex flex-col gap-0.5">
          {list.map((p) => (
            <li key={p.id}>
              <a
                href={`tel:${p.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-2 text-[13px] font-semibold text-zinc-700 dark:text-zinc-200">
                  <PhoneIcon size={14} className="text-indigo-500 shrink-0" />
                  {p.phone}
                </span>
                <MessengerBadges phone={p} showLabel />
              </a>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
