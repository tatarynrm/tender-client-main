// import React, { useState, useEffect } from "react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/shared/components/ui/popover";
// import { Button } from "@/shared/components/ui/button";
// import { Label } from "@/shared/components/ui/label";
// import { Calendar } from "lucide-react";

// import { registerLocale } from "react-datepicker";
// import { uk } from "date-fns/locale";

// registerLocale("uk", uk);

// type DateTimePickerProps = {
//   value?: Date | null;                // значення ззовні (наприклад із RHF)
//   onChange?: (date: Date | null) => void; // передаємо дату назовні
//   label?: string;
//   placeholder?: string;
//   showSeconds?: boolean;
//   timeIntervals?: number;
// };

// export default function DateTimePicker({
//   value = null,
//   onChange,
//   label = "Дата і час",
//   placeholder = "Оберіть дату та час",
//   showSeconds = false,
//   timeIntervals = 15,
// }: DateTimePickerProps) {
//   const [open, setOpen] = useState(false);
//   const [selected, setSelected] = useState<Date | null>(value);

//   // коли зовнішнє значення змінюється — оновлюємо локальний стейт
//   useEffect(() => {
//     setSelected(value ?? null);
//   }, [value]);

//   function handleChange(date: Date | null) {
//     setSelected(date);
//     onChange?.(date); // повідомляємо форму
//   }

//   const timeFormat = showSeconds ? "HH:mm:ss" : "HH:mm";

//   return (
//     <div className="w-full max-w-sm">
//       <Label className="mb-1 block">{label}</Label>

//       <Popover open={open} onOpenChange={setOpen}>
//         <PopoverTrigger asChild>
//           <Button
//             variant="outline"
//             className="w-full justify-between"
//             aria-label={placeholder}
//           >
//             <div className="flex items-center gap-2">
//               <Calendar className="h-4 w-4" />
//               <span className="text-sm">
//                 {selected
//                   ? selected.toLocaleString("uk-UA", {
//                       year: "numeric",
//                       month: "2-digit",
//                       day: "2-digit",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       second: showSeconds ? "2-digit" : undefined,
//                     })
//                   : placeholder}
//               </span>
//             </div>
//           </Button>
//         </PopoverTrigger>

//         <PopoverContent className="w-[350px] p-2">
//           <DatePicker
//             selected={selected}
//             onChange={handleChange}
//             inline
//             showTimeSelect
//             timeFormat={timeFormat}
//             timeIntervals={timeIntervals}
//             timeCaption="Час"
//             dateFormat={`dd.MM.yyyy ${timeFormat}`}
//             locale="uk"
//             shouldCloseOnSelect={false}
//           />

//           <div className="mt-3 flex gap-2 justify-end">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => {
//                 setSelected(null);
//                 onChange?.(null);
//                 setOpen(false);
//               }}
//             >
//               Очистити
//             </Button>

//             <Button size="sm" onClick={() => setOpen(false)}>
//               Готово
//             </Button>
//           </div>
//         </PopoverContent>
//       </Popover>

//       <input
//         type="hidden"
//         value={selected ? selected.toISOString() : ""}
//         readOnly
//         name="datetime"
//       />
//     </div>
//   );
// }
"use client";

import React, { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { uk } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Calendar, Clock } from "lucide-react";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

registerLocale("uk", uk);

type DateTimePickerProps = {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  showSeconds?: boolean;
  timeIntervals?: number;
};

export default function DateTimePicker({
  value = null,
  onChange,
  label = "Дата і час",
  placeholder = "Оберіть дату та час",
  showSeconds = false,
  timeIntervals = 15,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | null>(value);
  const { config } = useFontSize();

  useEffect(() => {
    setSelected(value ?? null);
  }, [value]);

  function handleChange(date: Date | null) {
    setSelected(date);
    onChange?.(date);
  }

  const timeFormat = showSeconds ? "HH:mm:ss" : "HH:mm";

  return (
    <div className="w-full max-w-[400px]">
      <Label 
        className={`${config?.label || "text-[10px]"} text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2 block font-bold ml-2`}
      >
        {label}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-12 px-4 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border-slate-200 dark:border-white/10 rounded-2xl shadow-sm hover:bg-white/80 transition-all"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Calendar className="h-4 w-4 text-blue-500 shrink-0" />
              <span className={`${config?.label || "text-sm"} truncate text-slate-700 dark:text-slate-200`}>
                {selected
                  ? selected.toLocaleString("uk-UA", {
                      year: "numeric", month: "2-digit", day: "2-digit",
                      hour: "2-digit", minute: "2-digit",
                      second: showSeconds ? "2-digit" : undefined,
                    })
                  : placeholder}
              </span>
            </div>
            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent 
          side="bottom" 
          align="start"
          className="w-auto p-0 overflow-hidden bg-white/95 dark:bg-slate-950 backdrop-blur-2xl border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl"
        >
          <div className="custom-datepicker-container flex h-[340px]">
            <DatePicker
              selected={selected}
              onChange={handleChange}
              inline
              showTimeSelect
              timeFormat={timeFormat}
              timeIntervals={timeIntervals}
              timeCaption="Час"
              dateFormat={`dd.MM.yyyy ${timeFormat}`}
              locale="uk"
              shouldCloseOnSelect={false}
              showTimeInput
            />
          </div>

          <div className="p-3 bg-slate-50/50 dark:bg-white/5 flex gap-2 justify-end border-t border-slate-100 dark:border-white/5">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-500 hover:text-red-500 rounded-xl"
              onClick={() => {
                setSelected(null);
                onChange?.(null);
                setOpen(false);
              }}
            >
              Очистити
            </Button>
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 rounded-xl"
              onClick={() => setOpen(false)}
            >
              Готово
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <input type="hidden" value={selected ? selected.toISOString() : ""} name="datetime" />

      <style jsx global>{`
        /* Контейнер для обмеження висоти */
        .custom-datepicker-container .react-datepicker {
          border: none !important;
          background: transparent !important;
          display: flex !important;
          height: 100% !important;
        }

        /* Календар (ліва частина) */
        .custom-datepicker-container .react-datepicker__month-container {
          padding: 10px !important;
        }

        /* Блок часу (права частина) */
        .custom-datepicker-container .react-datepicker__time-container {
          border-left: 1px solid rgba(148, 163, 184, 0.1) !important;
          width: 85px !important;
        }

        .custom-datepicker-container .react-datepicker__time-box {
          width: 100% !important;
          height: calc(100% - 40px) !important; /* Віднімаємо висоту заголовка "Час" */
        }

        .custom-datepicker-container .react-datepicker__time-list {
          height: 250px !important; /* Строго фіксуємо висоту скролу */
          padding: 0 !important;
        }

        /* Кастомізація скролбару для часу */
        .react-datepicker__time-list::-webkit-scrollbar {
          width: 4px;
        }
        .react-datepicker__time-list::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
        }

        /* Темна тема */
        .dark .react-datepicker__header,
        .dark .react-datepicker__current-month,
        .dark .react-datepicker__day-name,
        .dark .react-datepicker__day,
        .dark .react-datepicker__time-name {
          color: #f1f5f9 !important;
        }

        .dark .react-datepicker__header {
          background: transparent !important;
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
        }

        .dark .react-datepicker__day:hover {
          background: rgba(59, 130, 246, 0.2) !important;
        }

        .react-datepicker__day--selected {
          background: #3b82f6 !important;
          border-radius: 8px !important;
        }

        /* Інпут ручного введення */
        .react-datepicker__input-time-container {
          margin: 0 !important;
          padding: 8px !important;
          text-align: center;
        }
        .react-datepicker-time__input input {
          width: 100% !important;
          background: rgba(148,163,184,0.1) !important;
          border: 1px solid rgba(148,163,184,0.2) !important;
          border-radius: 6px;
          color: inherit;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}