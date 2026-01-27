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
import { cn } from "@/shared/utils";
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
  price: z
    .number()
    .max(99999999.99, { message: "Ціна не може перевищувати 999,999.99" })
    .nullable()
    .optional(),
  ids_valut: z.string().optional(),
  id_client: z.number().nullable().optional(), // Дозволяємо null
  load_info: z.string().optional(),
  crm_load_route_from: z
    .array(routeSchema)
    .min(1, "Додайте точку завантаження"),
  crm_load_route_to: z.array(routeSchema).min(1, "Додайте точку розвантаження"),
  crm_load_trailer: z.array(trailerSchema).min(1, "Оберіть тип транспорту"),
  is_price_request: z.boolean().optional(),
  is_collective: z.boolean().optional(),
  car_count_begin: z
    .number({ message: "Вкажіть кількість" })
    .min(1, { message: "Мінімальна к-сть 1" })
    .max(100, { message: "Максимальна к-сть 100" }),
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
  const STORAGE_KEY = "load_from_draft";
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
  const [isSubmittingSuccess, setIsSubmittingSuccess] = useState(false);
  const form = useForm<CargoServerFormValues>({
    resolver: zodResolver(cargoServerSchema),
    mode: "onTouched",
    defaultValues: {
      load_info: "",
      ids_valut: "UAH",
      date_load: toLocalDateString(new Date()),
      crm_load_route_from: [],
      crm_load_route_to: [],

      ...defaultValues,
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    reset,
    watch,
    formState,
  } = form;

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

  // ---------- Оптимізовані useEffects ----------

  // 1. Завантаження довідників (лише при першому рендері)
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

  // 2. Ініціалізація назви компанії (label)
  useEffect(() => {
    if (defaultValues) {
      // РЕДАГУВАННЯ
      const name =
        defaultValues.company_name || defaultValues.client?.company_name || "";
      setCompanyLabel(name);
    } else if (copyData) {
      // КОПІЮВАННЯ
      const clientData =
        (copyData as any).id_client_info || (copyData as any).client;
      const name =
        clientData?.company_name || (copyData as any).company_name || "";
      setCompanyLabel(name);
    } else if (!copyId) {
      // НОВА ЗАЯВКА (з чернетки)
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setCompanyLabel(parsed?.companyLabel || "");
        } catch (e) {
          setCompanyLabel("");
        }
      } else {
        setCompanyLabel(""); // Обов'язково скидаємо, якщо чернетки немає
      }
    }
  }, [defaultValues, copyData, copyId]);

  // 3. Скидання значень форми (reset)
  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        id_client: defaultValues.id_client ?? defaultValues.client?.id ?? null,
      });
    } else if (copyData) {
      const prepareForCopy = (data: any) => ({
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
      });
      reset(prepareForCopy(copyData));
    } else if (!copyId) {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed?.values) reset(parsed.values);
      } else {
        // Якщо це створення нової і немає чернетки — ставимо дефолтні
        reset({
          load_info: "",
          ids_valut: "UAH",
          car_count_begin: 1,

          crm_load_route_from: [
            { address: "", ids_route_type: "LOAD_FROM", order_num: 1 },
          ],
          crm_load_route_to: [
            { address: "", ids_route_type: "LOAD_TO", order_num: 1 },
          ],
          crm_load_trailer: [],
        });
      }
    }
  }, [defaultValues, copyData, reset, copyId]);
  useEffect(() => {
    // Зберігаємо ТІЛЬКИ якщо:
    // - це не редагування (немає defaultValues)
    // - це не копіювання (немає copyId в URL)
    // - форма ще не відправлена успішно
    if (defaultValues || copyId || isSubmittingSuccess) return;

    const timer = setTimeout(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          values: formValues,
          companyLabel: companyLabel,
        }),
      );
    }, 1000); // 1 секунда затримки для продуктивності

    return () => clearTimeout(timer);
  }, [formValues, defaultValues, copyId, isSubmittingSuccess, companyLabel]);

  // 5. Очищення стану успіху
  // useEffect(() => {
  //   if (isSubmittingSuccess) {
  //     const t = setTimeout(() => setIsSubmittingSuccess(false), 2000);
  //     return () => clearTimeout(t);
  //   }
  // }, [isSubmittingSuccess]);

  useEffect(() => {
    if (defaultValues || copyId) {
      // Якщо ми редагуємо або копіюємо, видаляємо чернетку "нової" заявки,
      // щоб вона не заважала при наступному переході на створення
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [defaultValues, copyId]);

  const onSubmit: SubmitHandler<CargoServerFormValues> = async (values) => {
    try {
      setIsLoading(true);
      await saveCargo({ ...values, id: defaultValues?.id });

      // 1. Видаляємо дані зі сховища
      localStorage.removeItem(STORAGE_KEY);

      // 2. Блокуємо подальші записи в useEffect
      setIsSubmittingSuccess(true);

      if (!isNextCargo) {
        toast.success("Готово!");
      }

      if (defaultValues) {
        router.push("/log/load/active");
        return;
      }

      if (isNextCargo) {
        // Очищуємо лише певні поля, якщо треба "ще одну",
        // або залишаємо як є, але блокуємо запис на секунду
        setTimeout(() => setIsSubmittingSuccess(false), 1000);
        toast.info("Можете створювати наступний вантаж");
      } else {
        // Скидаємо форму
        reset();
        setCompanyLabel("");
        router.push("/log/load/active");
      }
    } catch (err) {
      setIsSubmittingSuccess(false);
      toast.error("Помилка збереження");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(formState.errors).length > 0) {
      console.log("Валідаційні помилки:", formState.errors);
    }
  }, [formState.errors]);
  return (
    <div className="max-w-4xl mx-auto pb-20">
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
                              required
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
                  leftIcon={<Plus size={14} />} // Зменшуємо іконку
                  className={cn(
                    "h-8 flex flex-row text-[10px] w-full", // h-8 замість h-9, менший шрифт
                    "border-dashed border border-slate-300 dark:border-slate-700",
                    "hover:bg-teal-50 dark:hover:bg-teal-500/10 hover:border-teal-500 transition-all",
                    "uppercase tracking-wider font-bold opacity-70 hover:opacity-100", // Стиль для "мікро-кнопки"
                  )}
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
                  Завантаження
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
                              required
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
                  leftIcon={<Plus size={14} strokeWidth={3} />}
                  className={cn(
                    // Розміри та шрифт (ідентично завантаженню)
                    "h-8 px-3 text-[10px] font-bold uppercase tracking-widest",
                    "flex items-center justify-center w-full rounded-xl",

                    // Стиль рамки
                    "border-dashed border border-zinc-300 dark:border-zinc-700",
                    "text-zinc-500 dark:text-zinc-400",

                    // Ефекти (зміна кольору на teal при наведенні)
                    "hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-500/5 hover:text-teal-600",
                    "transition-all duration-200 active:scale-[0.98]",
                  )}
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
                  Розвантаження
                </AppButton>
              </div>
            </div>

            {/* КЛІЄНТ ТА ТРАНСПОРТ */}
            <div className="grid grid-cols-1  gap-4">
              <InputAsyncSelectCompany
                name="id_client"
                control={form.control}
                label="Компанія"
                initialLabel={companyLabel}
                onEntityChange={(company) =>
                  setCompanyLabel(company ? company.name : "")
                }
              />
              <InputMultiSelect
                control={control}
                name="crm_load_trailer"
                label="Тип транспорту"
                options={truckList}
                required
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <InputNumber
                  name="car_count_begin"
                  control={control}
                  label="К-сть машин"
                  icon={Truck}
                  required
                />
                <InputFinance
                  name="price"
                  control={form.control}
                  label="Бюджет перевезення"
                  currency="₴"
                  icon={Wallet}
                  // onChange={(val) => console.log("Чисте число:", val)}
                  required
                />
                <SelectFinance
                  control={control}
                  name="ids_valut"
                  label="Валюта"
                  options={valutList.slice(0, 4)}
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
                variant="primary"
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
