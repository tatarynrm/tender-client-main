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
import { Dropdowns } from "../../types/load.type";

/* ===================== DATA ===================== */

const VALUTS = [
  { ids: "UAH", valut_name: "Українська гривня", idntnum: "980" },
  { ids: "USD", valut_name: "Долари США", idntnum: "840" },
  { ids: "EUR", valut_name: "Євро", idntnum: "978" },
  { ids: "PLN", valut_name: "Польський Злотий", idntnum: "985" },
  { ids: "BGN", valut_name: "Болгарський Лев", idntnum: "975" },
  { ids: "GEL", valut_name: "Грузинський Ларі", idntnum: "981" },
  { ids: "DKK", valut_name: "Датська крона", idntnum: "208" },
  { ids: "MKD", valut_name: "Македонський динар", idntnum: "807" },
  { ids: "MDL", valut_name: "Молдовський лей", idntnum: "498" },
  { ids: "RON", valut_name: "Румунський Лей", idntnum: "946" },
  { ids: "RSD", valut_name: "Сербський динар", idntnum: "941" },
  { ids: "TRY", valut_name: "Турецька Ліра", idntnum: "949" },
  { ids: "HUF", valut_name: "Угорський Форінт", idntnum: "348" },
  { ids: "CZK", valut_name: "Чеська Крона", idntnum: "203" },
  { ids: "SEK", valut_name: "Шведська крона", idntnum: "752" },
  { ids: "CHF", valut_name: "Швейцарський франк", idntnum: "756" },
];

const MANAGERS = [
  { ids: 5, value: "Татарин Роман" },
  { ids: 6, value: "ТЕСТ ТЕСТ" },
];

/* ===================== SCHEMA ===================== */

const formSchema = z.object({
  id_crm_load: z.number(),
  id_usr_closed: z.string().min(1, "Оберіть менеджера"),
  car_count: z.number().min(1, "Мінімум 1 машина"),
  date_close: z.date({ message: "Виберіть дату" }),
  ids_valut: z.string().min(1, "Оберіть валюту"),
  price: z.number().min(0, "Ціна не може бути від'ємною"),
  notes: z.string().optional(),
});

export type CloseCargoFormValues = z.infer<typeof formSchema>;

interface CargoCloseModalProps {
  loadId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CloseCargoFormValues) => void;
  isLoading?: boolean;
  dropdowns?: Dropdowns;
}

export function CargoCloseByManagerModal({
  loadId,
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
      id_crm_load: loadId,
      id_usr_closed: "",
      car_count: 1,
      date_close: new Date(),
      ids_valut: "UAH",
      price: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        id_crm_load: loadId,
        id_usr_closed: "",
        car_count: 1,
        date_close: new Date(),
        ids_valut: "UAH",
        price: 0,
        notes: "",
      });
    }
  }, [loadId, open, form]);

  const handleSubmit = async (data: CloseCargoFormValues) => {
    try {
      const payload = {
        ...data,
        id_usr_closed: Number(data.id_usr_closed), // Конвертуємо в number для API
        date_close: format(data.date_close, "yyyy-MM-dd"),
      };
      console.log(payload, "PAYLOAD");

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
            <span className="text-emerald-600 font-mono">#{loadId}</span>
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
                      {/* Безпечний рендер якщо dropdowns або manager_dropdown порожні */}
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
                      К-сть авто
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
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
                          type="number"
                          className="pl-8 font-bold"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                        <Banknote className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
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
                        {/* Перевірка на undefined через optional chaining та конвертація ids в string */}
                        {dropdowns?.valut_dropdown?.map((v) => (
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
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-base font-bold transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                {isLoading ? "Обробка..." : "Підтвердити та закрити"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
