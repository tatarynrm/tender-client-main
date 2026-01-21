"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Textarea,
  Button,
  Switch,
  Label,
  SelectTrigger,
  SelectValue,
  Select,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui";
import AsyncSelect from "react-select/async";
import { default as ReactSelect } from "react-select";
import api from "@/shared/api/instance.api";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { MyTooltip } from "@/shared/components/Tooltips/MyTooltip";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { GoogleLocationInput } from "@/shared/components/google-location-input/GoogleLocationInput";
import { useSockets } from "@/shared/providers/SocketProvider";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import { selectStyles } from "./config/style.config";
import { useLoadById, useLoads } from "../hooks/useLoads";

// ---------- Schemas ----------
const routeSchema = z.object({
  id: z.number().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  address: z.string().min(1, "Будь ласка, вкажіть адресу (виберіть зі списку)"),
  ids_route_type: z.enum(["LOAD_FROM", "LOAD_TO"]),
  country: z.string().optional(),
  city: z.string().optional(),
  order_num: z.number(),
  ids_region: z.string().nullable().optional(),
});

const trailerSchema = z.object({
  ids_trailer_type: z.string().min(1, "Виберіть тип причепу"),
});

const cargoServerSchema = z.object({
  price: z.number().nullable().optional(),
  ids_valut: z.string().optional(),
  id_client: z.number().optional().nullable(),
  load_info: z.string().optional(),
  crm_load_route_from: z
    .array(routeSchema)
    .min(1, "Додайте точку завантаження"),
  crm_load_route_to: z.array(routeSchema).min(1, "Додайте точку розвантаження"),
  crm_load_trailer: z.array(trailerSchema).min(1, "Оберіть тип транспорту"),
  is_price_request: z.boolean().optional(),
  is_collective: z.boolean().optional(),
  car_count_begin: z.number({ message: "Вкажіть кількість" }).min(1).max(100),
});

export type CargoServerFormValues = z.infer<typeof cargoServerSchema>;

interface LoadFormProps {
  defaultValues?: any;
}

export default function LoadForm({ defaultValues }: LoadFormProps) {
  const { config } = useFontSize();
  const [valutList, setValutList] = useState<any[]>([]);
  const [truckList, setTruckList] = useState<any[]>([]);
  const [isNextCargo, setIsNextCargo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [companyLabel, setCompanyLabel] = useState<string>("");
  const { saveCargo } = useLoads({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const copyId = searchParams.get("copyId");
  const { data: copyData, isLoading: isCopyLoading } = useLoadById(copyId);
  const form = useForm<CargoServerFormValues>({
    resolver: zodResolver(cargoServerSchema),
    defaultValues: {
      load_info: "",
      ids_valut: "UAH",
      crm_load_route_from: [
        {
          address: "",
          lat: 0,
          lon: 0,
          ids_route_type: "LOAD_FROM",
          order_num: 1,
        },
      ],
      crm_load_route_to: [
        {
          address: "",
          lat: 0,
          lon: 0,
          ids_route_type: "LOAD_TO",
          order_num: 1,
        },
      ],
      crm_load_trailer: [],
      price: null,
      car_count_begin: 1,
      is_collective: false,
      is_price_request: false,
      ...defaultValues,
    },
  });

  const { control, handleSubmit, setValue, clearErrors, reset, watch } = form;

  // Спостерігаємо за всіма змінами у формі
  const formValues = watch();
  const {
    fields: fromFields,
    append: appendFrom,
    remove: removeFrom,
  } = useFieldArray({ control, name: "crm_load_route_from" });

  const {
    fields: toFields,
    append: appendTo,
    remove: removeTo,
  } = useFieldArray({ control, name: "crm_load_route_to" });

  // Завантаження довідників
  useEffect(() => {
    api.get("/form-data/getCreateCargoFormData").then(({ data }) => {
      setValutList(
        data.content.valut_dropdown.map((v: any) => ({
          value: v.ids,
          label: v.ids,
        })),
      );
      setTruckList(
        data.content.trailer_type_dropdown.map((t: any) => ({
          value: t.ids,
          label: t.value,
        })),
      );
    });
  }, []);

  // Встановлення назви компанії при редагуванні
  useEffect(() => {
    if (defaultValues?.company_name) {
      setCompanyLabel(defaultValues.company_name);
    }
  }, [defaultValues]);
  const STORAGE_KEY = "load_form_draft";
  // ЕФЕКТ 1: Завантаження даних при старті
  useEffect(() => {
    // Якщо ми редагуємо існуючу заявку (є defaultValues), не підтягуємо чернетку
    if (defaultValues) return;

    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // reset заповнить форму збереженими даними
        reset(parsedData);
      } catch (e) {
        console.error("Помилка парсингу чернетки", e);
      }
    }
  }, [reset, defaultValues]);
  // ЕФЕКТ 2: Збереження при кожній зміні
  useEffect(() => {
    // Не зберігаємо чернетку, якщо ми в режимі редагування
    if (defaultValues) return;

    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formValues));
    }, 500); // затримка 1 сек, щоб не "спамити" в пам'ять при кожному символі

    return () => clearTimeout(timer);
  }, [formValues, defaultValues]);
  useEffect(() => {
    if (copyData && !defaultValues) {
      const prepareForCopy = (data: any) => {
        return {
          ...data,
          id: undefined,
          crm_load_route_from: data.crm_load_route_from?.map((r: any) => ({
            ...r,
            id: undefined,
          })),
          crm_load_route_to: data.crm_load_route_to?.map((r: any) => ({
            ...r,
            id: undefined,
          })),
          crm_load_trailer: data.crm_load_trailer?.map((t: any) => ({
            ...t,
            id: undefined,
          })),
        };
      };

      const cleanedData = prepareForCopy(copyData);
      reset(cleanedData);

      // ВИПРАВЛЕННЯ ТУТ:
      // Використовуємо кастинг до any або опціональний ланцюжок,
      // щоб обійти сувору перевірку інтерфейсу
      const clientData =
        (copyData as any).id_client_info || (copyData as any).client;

      if (clientData?.company_name) {
        setCompanyLabel(clientData.company_name);
      } else if ((copyData as any).company_name) {
        // Іноді процедура повертає назву компанії прямо в корені
        setCompanyLabel((copyData as any).company_name);
      }

      toast.info("Дані успішно скопійовано");
    }
  }, [copyData, reset, defaultValues]);
  const onSubmit: SubmitHandler<CargoServerFormValues> = async (values) => {
    try {
      await saveCargo({ ...values, id: defaultValues?.id });
      toast.success("Готово!");

      // ОЧИЩЕННЯ ПІСЛЯ УСПІХУ
      localStorage.removeItem(STORAGE_KEY);

      if (defaultValues) {
        router.push("/log/load/active");
      } else if (!isNextCargo) {
        reset();
        setCompanyLabel("");
        router.push("/log/load/active");
      }
    } catch (err) {
      toast.error("Помилка збереження");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-10">
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 p-5 rounded-[1.5rem] shadow-sm">
        <h3
          className={`${config.label} text-slate-500 uppercase tracking-widest mb-4 font-bold`}
        >
          {defaultValues ? "Редагування" : "Нова заявка"}
        </h3>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* МАРШРУТ (Двоколонковий) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* КОЛОНКА: ЗВІДКИ */}
              <div className="space-y-3">
                {fromFields.map((field, idx) => (
                  <div key={field.id} className="flex items-end gap-2">
                    <FormField
                      control={control}
                      name={`crm_load_route_from.${idx}.address`}
                      render={({ field: formField }) => (
                        <FormItem className="flex-1">
                          <FormLabel
                            className={`${config.label} text-slate-400`}
                          >
                            {`Адреса завантаження #${idx + 1}`}
                          </FormLabel>
                          <FormControl>
                            <GoogleLocationInput
                              value={formField.value}
                              placeholder="Звідки..."
                              onChange={(location) => {
                                const addr = location.street
                                  ? `${location.street}${location.house ? `, ${location.house}` : ""}`
                                  : location.city || "";

                                formField.onChange(addr);
                                setValue(
                                  `crm_load_route_from.${idx}.lat`,
                                  location.lat,
                                );
                                setValue(
                                  `crm_load_route_from.${idx}.lon`,
                                  location.lng,
                                );
                                setValue(
                                  `crm_load_route_from.${idx}.country`,
                                  location.countryCode,
                                );
                                setValue(
                                  `crm_load_route_from.${idx}.city`,
                                  location.city,
                                );
                                setValue(
                                  `crm_load_route_from.${idx}.ids_region`,
                                  location.regionCode || null,
                                );
                                clearErrors(
                                  `crm_load_route_from.${idx}.address`,
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {fromFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mb-1 text-red-400 hover:text-red-500"
                        onClick={() => removeFrom(idx)}
                      >
                        <Minus size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 text-xs w-full border-dashed border border-slate-300 dark:border-slate-700"
                  onClick={() =>
                    appendFrom({
                      address: "",
                      lat: 0,
                      lon: 0,
                      ids_route_type: "LOAD_FROM",
                      order_num: fromFields.length + 1,
                    })
                  }
                >
                  <Plus size={14} className="mr-1" /> Точка завантаження
                </Button>
              </div>

              {/* КОЛОНКА: КУДИ */}
              <div className="space-y-3">
                {toFields.map((field, idx) => (
                  <div key={field.id} className="flex items-end gap-2">
                    <FormField
                      control={control}
                      name={`crm_load_route_to.${idx}.address`}
                      render={({ field: formField }) => (
                        <FormItem className="flex-1">
                          <FormLabel
                            className={`${config.label} text-slate-400`}
                          >
                            {`Адреса розвантаження #${idx + 1}`}
                          </FormLabel>
                          <FormControl>
                            <GoogleLocationInput
                              value={formField.value}
                              placeholder="Куди..."
                              onChange={(location) => {
                                const addr = location.street
                                  ? `${location.street}${location.house ? `, ${location.house}` : ""}`
                                  : location.city || "";

                                formField.onChange(addr);
                                setValue(
                                  `crm_load_route_to.${idx}.lat`,
                                  location.lat,
                                );
                                setValue(
                                  `crm_load_route_to.${idx}.lon`,
                                  location.lng,
                                );
                                setValue(
                                  `crm_load_route_to.${idx}.country`,
                                  location.countryCode,
                                );
                                setValue(
                                  `crm_load_route_to.${idx}.city`,
                                  location.city,
                                );
                                setValue(
                                  `crm_load_route_to.${idx}.ids_region`,
                                  location.regionCode || null,
                                );
                                clearErrors(`crm_load_route_to.${idx}.address`);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {toFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mb-1 text-red-400 hover:text-red-500"
                        onClick={() => removeTo(idx)}
                      >
                        <Minus size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 text-xs w-full border-dashed border border-slate-300 dark:border-slate-700"
                  onClick={() =>
                    appendTo({
                      address: "",
                      lat: 0,
                      lon: 0,
                      ids_route_type: "LOAD_TO",
                      order_num: toFields.length + 1,
                    })
                  }
                >
                  <Plus size={14} className="mr-1" /> Точка розвантаження
                </Button>
              </div>
            </div>

            {/* КЛІЄНТ ТА ТРАНСПОРТ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="id_client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={config.label}>Клієнт</FormLabel>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      placeholder="Пошук клієнта..."
                      noOptionsMessage={({ inputValue }) =>
                        !inputValue ? "Введіть назву..." : "Не знайдено"
                      }
                      loadOptions={async (v) => {
                        if (v.length < 2) return [];
                        const { data } = await api.get(`/company/name/${v}`);
                        return data.map((c: any) => ({
                          value: c.id,
                          label: c.company_name,
                        }));
                      }}
                      styles={selectStyles(config) as any}
                      onChange={(opt: any) => {
                        field.onChange(opt?.value || null);
                        setCompanyLabel(opt?.label || "");
                      }}
                      value={
                        field.value
                          ? {
                              value: field.value,
                              label: companyLabel || "Завантаження...",
                            }
                          : null
                      }
                      isClearable
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="crm_load_trailer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={config.label}>
                      Тип транспорту
                    </FormLabel>
                    <ReactSelect
                      isMulti
                      closeMenuOnSelect={false}
                      blurInputOnSelect={false}
                      options={truckList}
                      styles={selectStyles(config) as any}
                      placeholder="Оберіть типи..."
                      noOptionsMessage={({ inputValue }) => "Не знайдено"}
                      value={truckList.filter((t) =>
                        field.value?.some(
                          (v: any) => v.ids_trailer_type === t.value,
                        ),
                      )}
                      onChange={(opts: any) =>
                        field.onChange(
                          opts?.map((o: any) => ({
                            ids_trailer_type: o.value,
                          })) || [],
                        )
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ОПИС, КІЛЬКІСТЬ, ЦІНА */}
            <div className="space-y-3">
              <FormField
                control={control}
                name="load_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={`${config.label} text-xs`}>
                      Деталі вантажу
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className={`${config.main} min-h-[45px] h-12 rounded-xl py-2 px-3 text-sm`}
                        placeholder="Вантаж, вага, об'єм..."
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={control}
                  name="car_count_begin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`${config.label} text-xs`}>
                        К-сть машин
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="h-10 rounded-xl"
                          // Використовуємо порожній рядок, якщо значення null/undefined
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            // Якщо рядок порожній, записуємо null (це дозволить стерти цифру)
                            // Якщо ні — перетворюємо на число
                            field.onChange(val === "" ? "" : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`${config.label} text-xs`}>
                        Ставка
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="h-10 rounded-xl"
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="ids_valut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`${config.label} text-xs`}>
                        Валюта
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue placeholder="UAH" />
                        </SelectTrigger>
                        <SelectContent>
                          {valutList.map((v) => (
                            <SelectItem key={v.value} value={v.value}>
                              {v.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ПЕРЕМИКАЧІ */}
            <div className="flex flex-wrap gap-4 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl items-center justify-between border border-slate-100 dark:border-white/5">
              <div className="flex gap-6">
                <FormField
                  control={control}
                  name="is_collective"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_coll"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label
                        htmlFor="is_coll"
                        className={`${config.label} cursor-pointer`}
                      >
                        Збірний
                      </Label>
                    </div>
                  )}
                />
                <FormField
                  control={control}
                  name="is_price_request"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_req"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label
                        htmlFor="is_req"
                        className={`${config.label} cursor-pointer`}
                      >
                        Запит ціни
                      </Label>
                    </div>
                  )}
                />
              </div>

              <div className="flex items-center gap-3 bg-blue-50/50 dark:bg-blue-500/10 px-3 py-2 rounded-xl border border-blue-100 dark:border-blue-500/20">
                <div className="flex items-center gap-1">
                  <Label
                    htmlFor="is_next"
                    className={`${config.label} text-blue-600 dark:text-blue-400 cursor-pointer font-semibold`}
                  >
                    Ще одну
                  </Label>
                  <MyTooltip text="Форма не буде очищена після збереження" />
                </div>
                <Switch
                  id="is_next"
                  checked={isNextCargo}
                  onCheckedChange={setIsNextCargo}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 px-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition-all active:scale-95"
              >
                {isLoading
                  ? "Збереження..."
                  : copyId
                    ? "Створити копію"
                    : defaultValues
                      ? "Оновити дані"
                      : "Опублікувати"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
