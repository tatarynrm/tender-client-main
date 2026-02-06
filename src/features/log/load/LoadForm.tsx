"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
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

// Shared UI & Components
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/shared/components/ui";
import api from "@/shared/api/instance.api";
import { MyTooltip } from "@/shared/components/Tooltips/MyTooltip";
import { GoogleLocationInput } from "@/shared/components/google-location-input/GoogleLocationInput";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import { cn } from "@/shared/utils";

// Form Controls
import { InputFinance } from "@/shared/components/Inputs/InputFinance";
import { InputNumber } from "@/shared/components/Inputs/InputNumber";
import { SelectFinance } from "@/shared/components/Select/SelectFinance";
import { InputTextarea } from "@/shared/components/Inputs/InputTextarea";
import { InputSwitch } from "@/shared/components/Inputs/InputSwitch";
import { InputMultiSelect } from "@/shared/components/Inputs/InputMultiSelect";
import { InputDate } from "@/shared/components/Inputs/InputDate";
import { InputAsyncSelectCompany } from "@/shared/components/Inputs/InputAsyncSelectCompany";
import { AppButton } from "@/shared/components/Buttons/AppButton";

// Hooks & Helpers
import { useLoadById, useLoads } from "../hooks/useLoads";
import { renderLocationDetails } from "./LocationDetails";
import axios from "axios";

// ---------- Helpers & Schemas ----------

const STORAGE_KEY = "load_from_draft";

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
  address: z.string().min(1, "Будь ласка, вкажіть адресу"),
  ids_route_type: z.enum(["LOAD_FROM", "LOAD_TO"]),
  country: z.string().optional(),
  city: z.string().optional(),
  order_num: z.number(),
  ids_region: z.string().nullable().optional(),
  street: z.string().optional().nullable(),
  house: z.string().optional().nullable(),
  post_code: z.string().optional().nullable(),
});

const cargoServerSchema = z.object({
  price: z
    .number()
    .max(99999999.99, "Ціна занадто велика")
    .nullable()
    .optional(),
  ids_valut: z.string().optional(),
  id_client: z.number().nullable().optional(),
  load_info: z.string().optional(),
  crm_load_route_from: z
    .array(routeSchema)
    .min(1, "Додайте точку завантаження"),
  crm_load_route_to: z.array(routeSchema).min(1, "Додайте точку розвантаження"),
  crm_load_trailer: z
    .array(z.object({ ids_trailer_type: z.string() }))
    .min(1, "Оберіть тип транспорту"),
  is_price_request: z.boolean().optional(),
  is_collective: z.boolean().optional(),
  car_count_begin: z
    .number()
    .min(1, "Мінімальна к-сть 1")
    .max(100, "Максимальна к-сть 100"),
  date_load: z.string().min(1, "Дата завантаження є обов'язковою"),
  date_unload: z.string().nullable().optional(),
});

export type CargoServerFormValues = z.infer<typeof cargoServerSchema>;

interface LoadFormProps {
  defaultValues?: any;
}

export default function LoadForm({ defaultValues }: LoadFormProps) {
  const { config } = useFontSize();
  const router = useRouter();
  const searchParams = useSearchParams();
  const copyId = searchParams.get("copyId");

  // States
  const [valutList, setValutList] = useState<any[]>([]);
  const [truckList, setTruckList] = useState<any[]>([]);
  const [isNextCargo, setIsNextCargo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [companyLabel, setCompanyLabel] = useState<string>("");
  const [isSubmittingSuccess, setIsSubmittingSuccess] = useState(false);

  // API Hooks
  const { saveCargo } = useLoads({});
  const { data: copyData } = useLoadById(copyId);

  // Form Initialization
  const form = useForm<CargoServerFormValues>({
    resolver: zodResolver(cargoServerSchema),
    mode: "onTouched",
    defaultValues: useMemo(
      () => ({
        load_info: "",
        ids_valut: "UAH",
        car_count_begin: 1,
        date_load: toLocalDateString(new Date()) || "",
        crm_load_route_from: [
          { address: "", ids_route_type: "LOAD_FROM", order_num: 1 },
        ],
        crm_load_route_to: [
          { address: "", ids_route_type: "LOAD_TO", order_num: 1 },
        ],
        crm_load_trailer: [],
        ...defaultValues,
      }),
      [defaultValues],
    ),
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
  const formValues = watch();

  const {
    fields: fromFields,
    append: appendFrom,
    remove: removeFrom,
  } = useFieldArray({
    control,
    name: "crm_load_route_from",
  });
  const {
    fields: toFields,
    append: appendTo,
    remove: removeTo,
  } = useFieldArray({
    control,
    name: "crm_load_route_to",
  });

  // ---------- Effects ----------

  // 1. Fetch Dictionaries
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

  // 2. Data Synchronization (Edit / Copy / Draft)
  useEffect(() => {
    if (defaultValues) {
      const name =
        defaultValues.company_name || defaultValues.client?.company_name || "";
      setCompanyLabel(name);
      reset({
        ...defaultValues,
        id_client: defaultValues.id_client ?? defaultValues.client?.id ?? null,
      });
    } else if (copyData) {
      const clientData =
        (copyData as any).id_client_info || (copyData as any).client;
      setCompanyLabel(clientData?.company_name || "");

      const prepareCopy = (data: any) => ({
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
      reset(prepareCopy(copyData));
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCompanyLabel(parsed.companyLabel || "");
        reset(parsed.values);
      }
    }
  }, [defaultValues, copyData, reset]);

  // 3. Auto-save Draft
  useEffect(() => {
    if (defaultValues || copyId || isSubmittingSuccess) return;
    const timer = setTimeout(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ values: formValues, companyLabel }),
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [formValues, companyLabel, isSubmittingSuccess, defaultValues, copyId]);

  // ---------- Handlers ----------

  const handleManualReset = () => {
    if (window.confirm("Очистити всю форму та чернетку?")) {
      localStorage.removeItem(STORAGE_KEY);
      setCompanyLabel("");
      reset({
        load_info: "",
        ids_valut: "UAH",
        car_count_begin: 1,
        date_load: toLocalDateString(new Date()) || "",
        crm_load_route_from: [
          { address: "", ids_route_type: "LOAD_FROM", order_num: 1 },
        ],
        crm_load_route_to: [
          { address: "", ids_route_type: "LOAD_TO", order_num: 1 },
        ],
      });
      toast.info("Форму очищено");
    }
  };

  const onSubmit: SubmitHandler<CargoServerFormValues> = async (values) => {
    try {
      setIsLoading(true);
      await saveCargo({ ...values, id: defaultValues?.id });

      localStorage.removeItem(STORAGE_KEY);
      setIsSubmittingSuccess(true);

      if (!isNextCargo) {
        toast.success("Заявку збережено!");
        router.push("/log/load/active");
      } else {
        const currentValues = form.getValues();
        reset({
          ...currentValues,
          crm_load_route_from: [
            { address: "", ids_route_type: "LOAD_FROM", order_num: 1 },
          ],
          crm_load_route_to: [
            { address: "", ids_route_type: "LOAD_TO", order_num: 1 },
          ],
        });

        setTimeout(() => setIsSubmittingSuccess(false), 1000);
        toast.info("Готово! Введіть новий маршрут.");
      }
    } catch (err) {
      // Перевіряємо, чи є помилка об'єктом Axios з response
      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = err.response.data?.message || "Помилка сервера";
        toast.error(errorMessage);
      } else {
        toast.error("Виникла непередбачувана помилка");
      }
      setIsSubmittingSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-[1.5rem] shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3
            className={cn(
              config.label,
              "text-slate-500 uppercase tracking-widest font-bold",
            )}
          >
            {defaultValues
              ? "Редагування"
              : copyId
                ? "Копіювання"
                : "Нова заявка"}
          </h3>

          {!defaultValues && !copyId && (
            <div className="flex items-center gap-2">
              <AppButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleManualReset}
                className="text-slate-400 hover:text-red-500 h-8 px-2"
                leftIcon={<X size={16} />}
              >
                Очистити
              </AppButton>
              <MyTooltip
                text="Повністю очистити форму та видалити чернетку"
                icon={<Info size={14} />}
              />
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Dates Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputDate
                name="date_load"
                control={control}
                label="Дата завантаження"
                required
              />
              <InputDate
                name="date_unload"
                control={control}
                label="Дата розвантаження"
              />
            </div>

            {/* Routes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* FROM */}
              <div className="space-y-4">
                {fromFields.map((field, idx) => (
                  <div key={field.id} className="flex items-end gap-2 group">
                    <FormField
                      control={control}
                      name={`crm_load_route_from.${idx}.address`}
                      render={({ field: formField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <GoogleLocationInput
                              required
                              label={`Завантаження #${idx + 1}`}
                              value={formField.value}
                              onChange={(loc) => {
                                formField.onChange(loc.city || "");
                                const data = {
                                  lat: loc.lat,
                                  lon: loc.lng,
                                  country: loc.countryCode,
                                  city: loc.city,
                                  ids_region: loc.regionCode,
                                  street: loc.street,
                                  house: loc.house,
                                  post_code: loc.postCode,
                                  order_num: idx + 1,
                                  ids_route_type: "LOAD_FROM",
                                };
                                Object.entries(data).forEach(([k, v]) =>
                                  setValue(
                                    `crm_load_route_from.${idx}.${k}` as any,
                                    v,
                                  ),
                                );
                                clearErrors(
                                  `crm_load_route_from.${idx}.address`,
                                );
                              }}
                            />
                          </FormControl>
                          {renderLocationDetails(
                            formValues.crm_load_route_from?.[idx],
                          )}
                          <FormMessage className="text-[10px] uppercase font-bold" />
                        </FormItem>
                      )}
                    />
                    {fromFields.length > 1 && (
                      <AppButton
                        variant="ghost"
                        size="icon"
                        className="mb-1.5 text-red-400 hover:text-red-500"
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
                  leftIcon={<Plus size={14} />}
                  className="h-8 w-full border-dashed border-slate-300 text-[10px] uppercase font-bold"
                  onClick={() =>
                    appendFrom({
                      address: "",
                      ids_route_type: "LOAD_FROM",
                      order_num: fromFields.length + 1,
                    })
                  }
                >
                  Додати точку
                </AppButton>
              </div>

              {/* TO */}
              <div className="space-y-4">
                {toFields.map((field, idx) => (
                  <div key={field.id} className="flex items-end gap-2">
                    <FormField
                      control={control}
                      name={`crm_load_route_to.${idx}.address`}
                      render={({ field: formField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <GoogleLocationInput
                              required
                              label={`Розвантаження #${idx + 1}`}
                              value={formField.value}
                              onChange={(loc) => {
                                formField.onChange(loc.city || "");
                                const data = {
                                  lat: loc.lat,
                                  lon: loc.lng,
                                  country: loc.countryCode,
                                  city: loc.city,
                                  order_num: idx + 1,
                                  ids_route_type: "LOAD_TO",
                                };
                                Object.entries(data).forEach(([k, v]) =>
                                  setValue(
                                    `crm_load_route_to.${idx}.${k}` as any,
                                    v,
                                  ),
                                );
                                clearErrors(`crm_load_route_to.${idx}.address`);
                              }}
                            />
                          </FormControl>
                          {renderLocationDetails(
                            formValues.crm_load_route_to?.[idx],
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {toFields.length > 1 && (
                      <AppButton
                        variant="ghost"
                        size="icon"
                        className="mb-1.5 text-red-400"
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
                  leftIcon={<Plus size={14} />}
                  className="h-8 w-full border-dashed border-slate-300 text-[10px] uppercase font-bold"
                  onClick={() =>
                    appendTo({
                      address: "",
                      ids_route_type: "LOAD_TO",
                      order_num: toFields.length + 1,
                    })
                  }
                >
                  Додати точку
                </AppButton>
              </div>
            </div>

            {/* Client & Truck */}
            <div className="grid grid-cols-1 gap-4">
              <InputAsyncSelectCompany
                name="id_client"
                control={control}
                label="Компанія"
                initialLabel={companyLabel}
                onEntityChange={(c) => setCompanyLabel(c?.name || "")}
              />
              <InputMultiSelect
                name="crm_load_trailer"
                control={control}
                label="Тип транспорту"
                options={truckList}
                required
              />
            </div>

            {/* Info & Finance */}
            <div className="space-y-4">
              <InputTextarea
                name="load_info"
                control={control}
                label="Деталі вантажу"
                icon={Info}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputNumber
                  name="car_count_begin"
                  control={control}
                  label="К-сть машин"
                  icon={Truck}
                  required
                />
                <InputFinance
                  name="price"
                  control={control}
                  label="Бюджет"
                  currency="₴"
                  icon={Wallet}
                />
                <SelectFinance
                  name="ids_valut"
                  control={control}
                  label="Валюта"
                  options={valutList.slice(0, 4)}
                />
              </div>
            </div>

            {/* Switches */}
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-white/5 items-center justify-between">
              <div className="flex gap-6">
                <InputSwitch
                  name="is_collective"
                  control={control}
                  label="Збірний"
                  icon={Boxes}
                />
                <InputSwitch
                  name="is_price_request"
                  control={control}
                  label="Запит ціни"
                  icon={CircleDollarSign}
                />
              </div>

              <div className="flex items-center gap-3 bg-blue-500/5 px-4 py-2 rounded-xl border border-blue-500/10">
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

            {/* Actions */}
            <div className="flex justify-end pt-4">
              <AppButton
                variant="primary"
                type="submit"
                isLoading={isLoading}
                className="px-12 h-12 shadow-blue-500/20 shadow-lg"
              >
                {copyId
                  ? "Створити копію"
                  : defaultValues
                    ? "Оновити дані"
                    : "Опублікувати вантаж"}
              </AppButton>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
