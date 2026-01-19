"use client";

import * as z from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarDays, Loader2, Plus } from "lucide-react";
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

/* ===================== SCHEMA ===================== */

const formSchema = z.object({
  id_crm_load: z.number(),
  car_count: z.number().min(1, "Мінімум 1 машина"),
  to_date: z.date({ message: "Виберіть дату" }),
  notes: z.string().optional(),
});

export type AddCarsFormValues = z.infer<typeof formSchema>;

/* ===================== PROPS ===================== */

interface AddCarsModalProps {
  loadId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AddCarsFormValues) => void;
  isLoading?: boolean;
}

/* ===================== COMPONENT ===================== */

export function AddCarsModal({
  loadId,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: AddCarsModalProps) {
  const form = useForm<AddCarsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_crm_load: loadId,
      car_count: 1,
      to_date: new Date(),
      notes: "",
    },
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  // Оновлення при зміні loadId
  useEffect(() => {
    form.reset({
      id_crm_load: loadId,
      car_count: 1,
      to_date: new Date(),
      notes: "",
    });
  }, [loadId, form]);

  const handleSubmit = async (data: AddCarsFormValues) => {
    try {
      // 1. Форматуємо дані
      const payload = {
        ...data,
        to_date: format(data.to_date, "yyyy-MM-dd"),
      };

      // 2. Чекаємо на виконання onSubmit
      // (Примітка: переконайтеся, що функція onSubmit у батьківському компоненті повертає Promise)
      await onSubmit(payload as any);

      // 3. Якщо успішно — закриваємо модалку
      onOpenChange(false);

      // 4. Опційно: скидаємо форму до початкових значень
      form.reset();
    } catch (error) {
      console.error("Помилка при додаванні машин:", error);
      // Тут вікно не закриється, користувач зможе виправити помилку або спробувати ще раз
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-zinc-950">
        <DialogHeader className="px-6 pt-6 pb-4 bg-zinc-50 dark:bg-zinc-900/50 border-b">
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <div className="bg-blue-600 p-1 rounded-md">
              <Plus size={16} className="text-white" />
            </div>
            Додати машини{" "}
            <span className="text-blue-600 text-lg font-mono">#{loadId}</span>
          </DialogTitle>
        </DialogHeader>

        <Form<AddCarsFormValues> {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5 px-6 py-6"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Кількість */}
              <FormField
                control={form.control} // додав control для стабільності типізації
                name="car_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-zinc-400">
                      Кількість
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)} // Використовуємо valueAsNumber
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              {/* Дата */}
              {/* Дата */}
              <FormField
                name="to_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[10px] font-black uppercase text-zinc-400 mb-2">
                      На коли
                    </FormLabel>
                    {/* ДОДАЄМО КЕРУВАННЯ СТАНОМ ТУТ */}
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn("pl-3 text-left font-bold")}
                          >
                            {field.value
                              ? format(field.value, "dd.MM.yy")
                              : "Виберіть"}
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
                            setIsCalendarOpen(false); // Тепер це спрацює, бо Popover слухає стан
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

            {/* Примітки */}
            <FormField
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-zinc-400">
                    Примітки
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Опційно" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
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
