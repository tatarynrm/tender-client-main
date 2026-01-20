"use client";

import * as z from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarDays, Loader2, Minus, AlertTriangle } from "lucide-react";
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
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import { cn } from "@/shared/utils";
import { LoadApiItem } from "../../types/load.type";
import { Textarea } from "@/shared/components/ui";

/* ===================== PROPS ===================== */

interface CargoCarRemoveModalProps {
  load: LoadApiItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: any) => void;
  isLoading?: boolean;
}

export function CargoCarRemoveModal({
  load,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CargoCarRemoveModalProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const carCountActual = load.car_count_actual || 0;

  /* ===================== SCHEMA & TYPES ===================== */

  const formSchema = z.object({
    id_crm_load: z.number(),
    // car_count: z.preprocess(
    //   (val) => (val === "" || val === undefined ? undefined : Number(val)),
    //   z
    //     .number({ invalid_type_error: "Введіть число" })
    //     .min(1, "Мінімум 1")
    //     .max(carCountActual, `Максимум: ${carCountActual}`),
    // ),
    car_count: z
      .number({ message: "Введіть число" })
      .min(1, "Мінімум 1 машина")
      .max(carCountActual, `Максимум ${carCountActual} машин`), // Додаємо обмеження
    date_canceled: z.date({ message: "Виберіть дату" }),
    notes: z.string().optional(),
  });

  // Автоматичне отримання типів зі схеми (це виправить помилку Control)
  type AddCarsFormValues = z.infer<typeof formSchema>;

  const form = useForm<AddCarsFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      id_crm_load: load.id,
      car_count: 1,
      date_canceled: new Date(),
      notes: "",
    },
  });

  /* ===================== LOGIC ===================== */

  const watchedCarCount = form.watch("car_count");
  const isArchiving = Number(watchedCarCount) === carCountActual;

  useEffect(() => {
    if (open) {
      form.reset({
        id_crm_load: load.id,
        car_count: 1,
        date_canceled: new Date(),
        notes: "",
      });
    }
  }, [load.id, open, form]);

  const handleSubmit = async (data: AddCarsFormValues) => {
    try {
      const payload = {
        ...data,
        date_canceled: format(data.date_canceled, "yyyy-MM-dd"),
      };
      await onSubmit(payload);
      onOpenChange(false);
    } catch (error) {
      console.error("Помилка:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-zinc-950">
        <DialogHeader className="px-6 pt-6 pb-4 bg-zinc-50 dark:bg-zinc-900/50 border-b">
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-lg shadow-sm">
              <Minus size={18} className="text-white" />
            </div>
            Відняти машини
            <span className="text-blue-600 font-mono text-lg ml-1">
              #{load.id}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5 px-6 py-6"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Кількість */}
              <FormField
                control={form.control}
                name="car_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-zinc-400">
                      К-сть (В наявності: {carCountActual})
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                 
                        // Використовуємо value as string для інпуту, щоб дозволити порожнє поле
                        value={field.value ?? ""}
                        className={cn(
                          "font-bold text-lg focus-visible:ring-red-500",
                          form.formState.errors.car_count && "border-red-500",
                        )}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            field.onChange(""); // RHF обробить це через preprocess в Zod
                            return;
                          }
                          const cleanVal = val.replace(/[^0-9]/g, "");
                          const num = cleanVal === "" ? "" : Number(cleanVal);

                          if (typeof num === "number") {
                            field.onChange(
                              num > carCountActual ? carCountActual : num,
                            );
                          } else {
                            field.onChange("");
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              {/* Дата */}
              <FormField
                control={form.control}
                name="date_canceled"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[10px] font-black uppercase text-zinc-400 mb-2">
                      Дата відміни
                    </FormLabel>
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="pl-3 text-left font-bold border-zinc-200 dark:border-zinc-800"
                          >
                            {field.value
                              ? format(field.value, "dd.MM.yy")
                              : "Дата"}
                            <CalendarDays className="ml-auto h-4 w-4 opacity-50 text-blue-600" />
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
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Архівна плашка */}
            {isArchiving && (
              <div className="flex gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-snug">
                  Ви віднімаєте останню машину. Заявка піде в{" "}
                  <strong>архів</strong>.
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-zinc-400">
                    Примітки
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Причина..."
                      {...field}
                      className="bg-zinc-50 dark:bg-zinc-900/50 border-none shadow-none focus-visible:ring-1"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={
                  isLoading || !form.formState.isValid || !watchedCarCount
                }
                className={cn(
                  "w-full h-11 text-sm font-bold uppercase tracking-wider transition-all",
                  isArchiving
                    ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
                    : "bg-red-600 hover:bg-red-700 shadow-red-200",
                )}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : isArchiving ? (
                  "Відняти та архівувати"
                ) : (
                  "Підтвердити операцію"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
