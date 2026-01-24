"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/shared/components/ui";

import api from "@/shared/api/instance.api";
import { toast } from "sonner";
import {
  Boxes,
  CircleDollarSign,
  Info,
  Minus,
  Plus,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { MyTooltip } from "@/shared/components/Tooltips/MyTooltip";
import { useRouter, useSearchParams } from "next/navigation";

import { GoogleLocationInput } from "@/shared/components/google-location-input/GoogleLocationInput";

import { useFontSize } from "@/shared/providers/FontSizeProvider";

import { useLoadById, useLoads } from "../hooks/useLoads";
import { renderLocationDetails } from "./LocationDetails";

import { InputFinance } from "@/shared/components/Inputs/InputFinance";
import { InputNumber } from "@/shared/components/Inputs/InputNumber";
import { SelectFinance } from "@/shared/components/Select/SelectFinance";

import { InputTextarea } from "@/shared/components/Inputs/InputTextarea";
import { InputSwitch } from "@/shared/components/Inputs/InputSwitch";

import { InputMultiSelect } from "@/shared/components/Inputs/InputMultiSelect";
import { InputDate } from "@/shared/components/Inputs/InputDate";
import { InputAsyncSelectCompany } from "@/shared/components/Inputs/InputAsyncSelectCompany";
import { AppButton } from "@/shared/components/Buttons/AppButton";
// ---------- Schemas ----------
// Функція зберігає "чисту" дату без урахування часового поясу
const toLocalDateString = (date: Date | null) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
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
  street: z.string().optional().nullable(),
  house: z.string().optional().nullable(),
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
  date_load: z
    .string({ message: "Дата завантаження є обов'язковою" })
    .min(1, "Будь ласка, оберіть дату"),
  date_unload: z.string().nullable().optional(),
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
  const [isLoadPopoverOpen, setIsLoadPopoverOpen] = useState(false);
  const [isUnloadPopoverOpen, setIsUnloadPopoverOpen] = useState(false);
  const form = useForm<CargoServerFormValues>({
    resolver: zodResolver(cargoServerSchema),
    defaultValues: {
      load_info: "",
      ids_valut: "UAH",
      crm_load_route_from: [
        {
          address: "",
          street: "",
          house: "",
          city: "",
          lat: 0,
          lon: 0,
          ids_route_type: "LOAD_FROM",
          order_num: 1,
        },
      ],
      crm_load_route_to: [
        {
          address: "",
          street: "",
          house: "",
          city: "",
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
      date_load: toLocalDateString(new Date()),
      date_unload: null,

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
  // ЕФЕКТ 1: Завантаження даних при старті
  useEffect(() => {
    if (defaultValues) return;
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        reset(JSON.parse(savedData)); // Просто завантажуємо як є
      } catch (e) {
        console.error(e);
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
    console.log(values, "values");

    try {
      // Зберігаємо дані
      await saveCargo({ ...values, id: defaultValues?.id });
      toast.success("Готово!");

      // 1. Очищаємо чернетку в localStorage у будь-якому випадку після успіху
      localStorage.removeItem(STORAGE_KEY);

      // 2. Якщо ми в режимі РЕДАГУВАННЯ (є defaultValues) — завжди редирект
      if (defaultValues) {
        router.push("/log/load/active");
        return;
      }

      // 3. Якщо це СТВОРЕННЯ (немає defaultValues)
      if (isNextCargo) {
        // Якщо обрано "Наступний вантаж":
        // Просто виводимо повідомлення, форму не скидаємо, нікуди не переходимо.
        // Користувач може змінити пару полів і натиснути "Зберегти" ще раз.
        toast.info("Можете створювати наступний вантаж на основі поточного");
      } else {
        // Якщо "Наступний вантаж" НЕ обрано:
        reset();
        setCompanyLabel("");
        router.push("/log/load/active");
      }
    } catch (err) {
      console.error(err);
      toast.error("Помилка збереження");
    }
  };
  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.log("❌ Помилки валідації:", form.formState.errors);
    }
  }, [form.formState.errors]);

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              {/* Дата завантаження */}
              <InputDate
                name="date_load"
                control={control}
                label="Дата завантаження"
                required
              />

              {/* Дата розвантаження */}
              <InputDate
                name="date_unload"
                control={control}
                label="Дата розвантаження"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* КОЛОНКА: ЗВІДКИ */}
              <div className="space-y-3">
                {fromFields.map((field, idx) => (
                  <div key={field.id} className="flex items-end gap-2 w-full">
                    <FormField
                      control={control}
                      name={`crm_load_route_from.${idx}.address`}
                      render={({ field: formField }) => (
                        <FormItem className="flex-1">
                          {/* FormLabel видалено, назва тепер всередині GoogleLocationInput */}
                          <FormControl>
                            <GoogleLocationInput
                              label={`Адреса завантаження #${idx + 1}`}
                              value={formField.value}
                              placeholder=" "
                              onChange={(location) => {
                                // 1. Оновлюємо основне поле (місто)
                                formField.onChange(location.city || "");

                                // 2. Створюємо карту відповідності: ключ у формі -> значення з location
                                const fieldsMap = {
                                  lat: location.lat,
                                  lon: location.lng, // тут lng перетворюємо на lon
                                  country: location.countryCode,
                                  city: location.city,
                                  ids_region: location.regionCode || null,
                                  street: location.street || null,
                                  house: location.house || null,
                                };

                                // 3. Оновлюємо всі поля за один прохід
                                Object.entries(fieldsMap).forEach(
                                  ([key, value]) => {
                                    setValue(
                                      `crm_load_route_from.${idx}.${key}` as any,
                                      value,
                                    );
                                  },
                                );

                                // 4. Очищаємо помилку
                                clearErrors(
                                  `crm_load_route_from.${idx}.address`,
                                );
                              }}
                            />
                          </FormControl>

                          {/* Вивід деталей (країна, місто тощо) */}
                          {renderLocationDetails(
                            formValues.crm_load_route_from?.[idx],
                          )}

                          <FormMessage className="ml-1 text-[10px] uppercase font-bold" />
                        </FormItem>
                      )}
                    />

                    {/* Кнопка видалення (якщо більше однієї точки завантаження) */}
                    {fromFields.length > 1 && (
                      <AppButton
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mb-1.5 h-10 w-10 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        onClick={() => removeFrom(idx)}
                      >
                        <Minus size={16} />
                      </AppButton>
                    )}
                  </div>
                ))}
                <AppButton
                  type="button"
                  variant="ghost"
                  className="h-9 text-xs w-full border-dashed border border-slate-300 dark:border-slate-700"
                  onClick={() =>
                    appendFrom({
                      address: "",
                      street: "",
                      house: "",
                      city: "",
                      lat: 0,
                      lon: 0,
                      ids_route_type: "LOAD_FROM",
                      order_num: fromFields.length + 1,
                    })
                  }
                >
                  <Plus size={14} className="mr-1" /> Точка завантаження
                </AppButton>
              </div>

              {/* КОЛОНКА: КУДИ */}
              <div className="space-y-3">
                {toFields.map((field, idx) => (
                  <div key={field.id} className="flex items-end gap-2 w-full">
                    <FormField
                      control={control}
                      name={`crm_load_route_to.${idx}.address`}
                      render={({ field: formField }) => (
                        <FormItem className="flex-1">
                          {/* Старий FormLabel видаляємо, передаємо назву в label пропс нижче */}
                          <FormControl>
                            <GoogleLocationInput
                              label={`Адреса розвантаження #${idx + 1}`}
                              value={formField.value}
                              placeholder=" "
                              onChange={(location) => {
                                // 1. Оновлюємо основне видиме поле
                                formField.onChange(location.city || "");

                                // 2. Створюємо об'єкт з даними, де ключі точно збігаються з полями форми
                                const locationData = {
                                  lat: location.lat,
                                  lon: location.lng,
                                  country: location.countryCode,
                                  city: location.city,
                                  ids_region: location.regionCode || null,
                                  street: location.street || null,
                                  house: location.house || null,
                                };

                                // 3. Оновлюємо все однією дією через ітерацію ключі
                                Object.entries(locationData).forEach(
                                  ([key, value]) => {
                                    setValue(
                                      `crm_load_route_to.${idx}.${key}` as any,
                                      value,
                                      {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                      },
                                    );
                                  },
                                );

                                clearErrors(`crm_load_route_to.${idx}.address`);
                              }}
                            />
                          </FormControl>

                          {/* Деталі локації (місто, країна тощо) під інпутом */}
                          {renderLocationDetails(
                            formValues.crm_load_route_to?.[idx],
                          )}

                          <FormMessage className="ml-1 text-[10px] uppercase font-bold" />
                        </FormItem>
                      )}
                    />

                    {/* Кнопка видалення, вирівняна по центру інпуту (не лейблу) */}
                    {toFields.length > 1 && (
                      <AppButton
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mb-1.5 h-10 w-10 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        onClick={() => removeTo(idx)}
                      >
                        <Minus size={16} />
                      </AppButton>
                    )}
                  </div>
                ))}
                <AppButton
                  type="button"
                  variant="ghost"
                  className="h-9 text-xs w-full border-dashed border border-slate-300 dark:border-slate-700"
                  onClick={() =>
                    appendTo({
                      address: "",
                      street: "",
                      house: "",
                      city: "",
                      lat: 0,
                      lon: 0,
                      ids_route_type: "LOAD_TO",
                      order_num: toFields.length + 1,
                    })
                  }
                >
                  <Plus size={14} className="mr-1" /> Точка розвантаження
                </AppButton>
              </div>
            </div>

            {/* КЛІЄНТ ТА ТРАНСПОРТ */}
            <div className="grid grid-cols-1  gap-4">
              <InputAsyncSelectCompany
                name="id_client"
                control={control}
                label="Клієнт"
                displayValue={companyLabel} // Ваш існуючий state
                setDisplayValue={setCompanyLabel} // Ваш існуючий setState
                loadOptions={async (v) => {
                  if (v.length < 2) return [];
                  const { data } = await api.get(`/company/name/${v}`);
                  return data.map((c: any) => ({
                    value: c.id,
                    label: c.company_name,
                  }));
                }}
              />
              <InputMultiSelect
                control={control}
                name="crm_load_trailer"
                label="Тип транспорту"
                options={truckList}
              />
            </div>

            {/* ОПИС, КІЛЬКІСТЬ, ЦІНА */}
            <div className="space-y-3">
              <InputTextarea
                name="load_info"
                control={control}
                label="Деталі вантажу"
                icon={Info} // Можна змінити на будь-яку іншу
              />

              <div className="grid grid-cols-3 gap-3">
                <InputNumber
                  name="car_count_begin"
                  control={control}
                  label="К-сть машин"
                  icon={Truck} // Можна змінити на будь-яку іншу
                />
                <InputFinance
                  name="price"
                  control={form.control}
                  label="Бюджет перевезення"
                  currency="₴"
                  icon={Wallet}
                  onChange={(val) => console.log("Чисте число:", val)}
                />
                <SelectFinance
                  control={control}
                  name="ids_valut"
                  label="Валюта"
                  options={valutList.slice(0, 4)} // Ваш масив [{label: 'UAH', value: '1'}]
                  // icon={Wallet} // Можна змінити іконку за бажанням
                />
              </div>
            </div>

            {/* ПЕРЕМИКАЧІ */}
            <div className="flex flex-wrap gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl items-center justify-between border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="flex gap-8">
                <InputSwitch
                  control={control}
                  name="is_collective"
                  label="Збірний вантаж"
                  icon={Boxes}
                />

                <InputSwitch
                  control={control}
                  name="is_price_request"
                  label="Запит ціни"
                  icon={CircleDollarSign}
                />
              </div>

              {/* Синій блок "Ще одну" — залишаємо акцентним */}
              <div className="flex items-center gap-3 bg-blue-50/50 dark:bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-500/20 transition-all hover:bg-blue-50">
                <div className="flex items-center gap-2">
                  <InputSwitch
                    id="is_next"
                    checked={isNextCargo}
                    label="Ще одну"
                    onCheckedChange={setIsNextCargo}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <MyTooltip text="Форма не буде очищена після збереження" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <AppButton
                type="submit"
                isLoading={isLoading} // Спіннер з'явиться автоматично
                size="lg" // Використовуємо наш розмір (h-13) або передай className для h-12
                className="px-10 shadow-lg" // Додаткові стилі, якщо потрібно
              >
                {/* Логіка тексту залишається такою ж, але без перевірки isLoading, бо компонент сам її обробить */}
                {copyId
                  ? "Створити копію"
                  : defaultValues
                    ? "Оновити дані"
                    : "Опублікувати"}
              </AppButton>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
