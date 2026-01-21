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
import { Textarea } from "@/shared/components/ui";
import { cn } from "@/shared/utils";

import NativeSelect from "@/shared/components/Select/NativeSelect";
import { Dropdowns, LoadApiItem } from "../../types/load.type";

/* ===================== PROPS ===================== */

interface CargoCarRemoveModalProps {
  load: LoadApiItem;
  open: boolean;
  dropdowns?: Dropdowns;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: any) => void;
  isLoading?: boolean;
}

/* ===================== COMPONENT ===================== */

export function CargoCarRemoveModal({
  load,
  open,
  dropdowns,
  onOpenChange,
  onSubmit,
  isLoading,
}: CargoCarRemoveModalProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const carCountActual = load.car_count_actual || 0;

  /* ===================== SCHEMA ===================== */

  const formSchema = z.object({
    id_crm_load: z.number(),

    car_count: z
      .number({ message: "Введіть число" })
      .min(1, "Мінімум 1 машина")
      .max(carCountActual, `Максимум ${carCountActual} машин`),

    date_canceled: z.date({ message: "Виберіть дату" }),

    ids_cancel_type: z.string().min(1, "Оберіть причину"),

    price_client: z.number().min(0, "Ціна не може бути відʼємною").nullable(),

    notes: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  /* ===================== FORM ===================== */

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      id_crm_load: load.id,
      car_count: carCountActual,
      date_canceled: new Date(),
      ids_cancel_type: "",

      price_client: null,
      notes: "",
    },
  });

  const watchedCarCount = form.watch("car_count");
  const isArchiving = Number(watchedCarCount) === carCountActual;

  /* ===================== EFFECT ===================== */

  useEffect(() => {
    if (open) {
      form.reset({
        id_crm_load: load.id,
        car_count: carCountActual,
        date_canceled: new Date(),
        ids_cancel_type: "",

        price_client: null,
        notes: "",
      });
    }
  }, [open, load.id, carCountActual, form]);

  /* ===================== SUBMIT ===================== */

  const handleSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      date_canceled: format(data.date_canceled, "yyyy-MM-dd"),
    };

    console.log(payload, "PAYLOAD");

    await onSubmit(payload);
    onOpenChange(false);
  };

  /* ===================== RENDER ===================== */
  console.log(form.formState.errors);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 bg-zinc-50 border-b">
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-lg">
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
            className="space-y-4 px-6 py-6"
          >
            {/* COUNT + DATE */}
            <div className="grid grid-cols-2 gap-4">
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
                        inputMode="numeric"
                        value={field.value ?? ""}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, "");

                          if (raw === "") {
                            field.onChange(null);
                            return;
                          }

                          const num = Number(raw);
                          field.onChange(
                            num > carCountActual ? carCountActual : num,
                          );
                        }}
                        className="h-10 font-bold text-lg"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_canceled"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-zinc-400 mb-2">
                      Дата відміни
                    </FormLabel>
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="h-10 w-full">
                            {format(field.value, "dd.MM.yy")}
                            <CalendarDays className="ml-auto h-4 w-4" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
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
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* DROPDOWNS */}
            <NativeSelect
              label="Причина скасування"
              value={form.watch("ids_cancel_type")}
              onChange={(v) =>
                form.setValue("ids_cancel_type", v as string, {
                  shouldValidate: true,
                })
              }
              options={dropdowns?.load_cancel_type_dropdown}
              placeholder="Оберіть причину..."
            />

            <FormField
              control={form.control}
              name="price_client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-zinc-400">
                    Ціна закриття
                  </FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        field.onChange(raw === "" ? null : Number(raw));
                      }}
                      className="h-10 font-bold text-lg"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            {/* ARCHIVE WARNING */}
            {isArchiving && (
              <div className="flex gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <p className="text-[11px] text-amber-700 font-medium">
                  Ви віднімаєте останню машину. Заявка піде в{" "}
                  <strong>архів</strong>.
                </p>
              </div>
            )}

            {/* NOTES */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-zinc-400">
                    Примітки
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[80px] rounded-xl" />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-11 font-bold uppercase",
                  isArchiving
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-red-600 hover:bg-red-700",
                )}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
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
