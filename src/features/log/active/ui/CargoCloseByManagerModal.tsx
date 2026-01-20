"use client";

import * as z from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarDays,
  Loader2,
  CheckCircle2,
  Banknote,
  UserCheck,
} from "lucide-react";
import { uk } from "react-day-picker/locale";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import { cn } from "@/shared/utils";
import { Dropdowns, LoadApiItem } from "../../types/load.type";

/* ===================== SCHEMA ===================== */

const formSchema = z.object({
  id_crm_load: z.number(),
  id_usr_closed: z.string().min(1, "Оберіть менеджера"),
  // Використовуємо .coerce або обробляємо undefined для коректної валідації порожнього поля
  car_count: z.number({ message: "Введіть число" }).min(1, "Мінімум 1 машина"),
  date_close: z.date({ message: "Виберіть дату" }),
  ids_valut: z.string().min(1, "Оберіть валюту"),
  price: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Введіть коректну ціну",
    })
    .optional(),
  notes: z.string().optional(),
});

export type CloseCargoFormValues = z.infer<typeof formSchema>;

interface CargoCloseModalProps {
  load: LoadApiItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CloseCargoFormValues) => void;
  isLoading?: boolean;
  dropdowns?: Dropdowns;
}

export function CargoCloseByManagerModal({
  load,
  open,
  onOpenChange,
  onSubmit,
  dropdowns,
  isLoading,
}: CargoCloseModalProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<CloseCargoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_crm_load: load.id,
      id_usr_closed: "",
      car_count: 1,
      date_close: new Date(),
      ids_valut: "UAH",
      price: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        id_crm_load: load.id,
        id_usr_closed: "",
        car_count: 1,
        date_close: new Date(),
        ids_valut: "UAH",
        price: "",
        notes: "",
      });
    }
  }, [load.id, open, form]);

  // Слідкуємо за значенням
  const watchedCarCount = form.watch("car_count");
  const totalRequired = load.car_count_actual || 1;

  // Перевірки (якщо watchedCarCount порожній, вважаємо його за 0)
  const currentCount = watchedCarCount || 0;
  const isOverLimit = currentCount > totalRequired;
  const isLastCar = currentCount === 1;

  const handleSubmit = async (data: CloseCargoFormValues) => {
    try {
      const payload = {
        ...data,
        id_usr_closed: Number(data.id_usr_closed),
        date_close: format(data.date_close, "yyyy-MM-dd"),
        price: data.price === "" ? 0 : Number(data.price),
      };
      await onSubmit(payload as any);
      onOpenChange(false);
    } catch (error) {
      console.error("Error closing cargo:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-zinc-950">
        <DialogHeader className="px-6 pt-6 pb-4 bg-emerald-50 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-white/5">
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <div className="bg-emerald-600 p-1 rounded-md">
              <CheckCircle2 size={18} className="text-white" />
            </div>
            Закриття заявки{" "}
            <span className="text-emerald-600 font-mono">#{load.id}</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 px-6 py-6"
          >
            {/* Менеджер */}
            <FormField
              control={form.control}
              name="id_usr_closed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1">
                    <UserCheck size={12} /> Хто закриває
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="font-bold">
                        <SelectValue placeholder="Оберіть менеджера" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[110]">
                      {dropdowns?.manager_dropdown?.map((m) => (
                        <SelectItem
                          key={m.ids.toString()}
                          value={m.ids.toString()}
                        >
                          {m.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Кількість авто */}
              <FormField
                control={form.control}
                name="car_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-zinc-400">
                      К-сть авто (Потрібно: {totalRequired})
                    </FormLabel>
                    <FormControl>
                      <Input
                        // Міняємо на text + inputMode, щоб на мобілці була цифрова клавіатура
                        type="text"
                        inputMode="numeric"
                        placeholder="Введіть к-сть"
                        // Якщо значення 0 або undefined, показуємо порожній рядок для стирання
                        value={field.value === 0 ? "" : (field.value ?? "")}
                        className={cn(
                          "font-bold",
                          isOverLimit &&
                            "border-red-500 focus-visible:ring-red-500",
                        )}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value;

                          // 1. Дозволяємо порожнє поле для стирання
                          if (val === "") {
                            field.onChange(""); // Важливо передати порожній рядок
                            return;
                          }

                          // 2. Дозволяємо вводити тільки цифри
                          const cleanValue = val.replace(/[^0-9]/g, "");

                          // 3. Передаємо число в форму
                          if (cleanValue !== "") {
                            field.onChange(Number(cleanValue));
                          } else {
                            field.onChange("");
                          }
                        }}
                        // При виході з поля, якщо воно порожнє, ставимо 1 (необов'язково)
                        onBlur={(e) => {
                          if (!e.target.value) field.onChange(1);
                        }}
                      />
                    </FormControl>

                    {isLastCar && !isOverLimit && (
                      <p className="text-[11px] text-amber-600 font-medium mt-1 animate-in fade-in slide-in-from-top-1">
                        ⚠️ Якщо ви закриєте 1 авто, заявка перейде в архів!
                      </p>
                    )}

                    {isOverLimit && (
                      <p className="text-[11px] text-red-500 font-bold mt-1">
                        ❌ Не більше ніж {totalRequired}!
                      </p>
                    )}
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              {/* Дата закриття */}
              <FormField
                control={form.control}
                name="date_close"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[10px] font-black uppercase text-zinc-400 mb-2">
                      Дата закриття
                    </FormLabel>
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="pl-3 text-left font-bold w-full"
                          >
                            {field.value
                              ? format(field.value, "dd.MM.yy")
                              : "Дата"}
                            <CalendarDays className="ml-auto h-4 w-4 opacity-50 text-emerald-600" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 z-[100]"
                        align="start"
                      >
                        <Calendar
                          locale={uk}
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setIsCalendarOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Ціна */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-zinc-400">
                      Ціна (ставка)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          inputMode="numeric"
                          className="pl-8 font-bold"
                          // placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.replace(/[^0-9]/g, ""),
                            )
                          }
                        />
                        <Banknote className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Валюта */}
              <FormField
                control={form.control}
                name="ids_valut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-zinc-400">
                      Валюта
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="font-bold">
                          <SelectValue placeholder="Оберіть" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[110]">
                        {dropdowns?.valut_dropdown?.slice(0, 4).map((v) => (
                          <SelectItem
                            key={v.ids.toString()}
                            value={v.ids.toString()}
                          >
                            <span className="font-mono mr-2">{v.ids}</span>
                            <span className="text-xs text-zinc-500">
                              ({v.valut_name})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-zinc-400">
                    Коментар
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Нотатки..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={isLoading || isOverLimit || !watchedCarCount}
                className={cn(
                  "w-full h-11 text-base font-bold transition-all",
                  isOverLimit
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700",
                )}
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                {isOverLimit
                  ? "Перевищено ліміт"
                  : isLoading
                    ? "Обробка..."
                    : "Підтвердити та закрити"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
