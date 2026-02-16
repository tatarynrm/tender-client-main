"use client";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Button,
  Switch,
  SelectTrigger,
  SelectValue,
  Select,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui";

import api from "@/shared/api/instance.api";

import {
  Box,
  Boxes,
  Calendar,
  Car,
  DockIcon,
  DollarSign,
  FileText,
  MapPin,
  Minus,
  Notebook,
  Plus,
  Truck,
  Weight,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { GoogleLocationInput } from "@/shared/components/google-location-input/GoogleLocationInput";
import { useSockets } from "@/shared/providers/SocketProvider";
import { InputNumber } from "@/shared/components/Inputs/InputNumber";
import { InputFinance } from "@/shared/components/Inputs/InputFinance";
import { SelectFinance } from "@/shared/components/Select/SelectFinance";
import { InputSwitch } from "@/shared/components/Inputs/InputSwitch";
import { AppButton } from "@/shared/components/Buttons/AppButton";
import { InputText } from "@/shared/components/Inputs/InputText";
import { InputTextarea } from "@/shared/components/Inputs/InputTextarea";
import { InputAsyncSelectCompany } from "@/shared/components/Inputs/InputAsyncSelectCompany";
import { InputMultiSelect } from "@/shared/components/Inputs/InputMultiSelect";
import { InputDateWithTime } from "@/shared/components/Inputs/InputDateWithTime";
import { toast } from "sonner";

// ---------- Schemas ----------
const routeSchema = z.object({
  id: z.number().optional(),
  address: z.string().min(1, "Адреса обов'язкова").optional(),
  ids_point: z.enum([
    "LOAD_FROM",
    "LOAD_TO",
    "CUSTOM_UP",
    "CUSTOM_DOWN",
    "BORDER",
  ]),
  country: z.string().optional(),
  city: z.string().optional(),
  order_num: z.number(),
  customs: z.boolean().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
});

const trailerSchema = z.object({
  ids_trailer_type: z.string(),
});
const loadSchema = z.object({
  ids_load_type: z.string(),
});
const tenderPermissionSchema = z.object({
  ids_permission_type: z.string(),
});

const tenderFormSchema = z
  .object({
    id: z.number().optional(),
    cargo: z.string().min(1, "Вантаж обов'язковий"),
    notes: z.string().optional(),
    id_owner_company: z.number().nullable(),
    car_count: z.number().min(1, "Мінімум 1 авто"),
    price_start: z.number().optional(),
    price_step: z.number({ message: "Вкажіть крок ставки" }).optional(),
    // price_redemption: z.number().optional(), // ⬅ ДЛЯ REDEMTION
    ids_type: z.enum(["AUCTION", "REDUCTION", "REDUCTION_WITH_REDEMPTION"]),
    ids_carrier_rating: z.enum(["MAIN", "MEDIUM", "IMPORTANT"]),

    request_price: z.boolean(),
    without_vat: z.boolean(),
    tender_route: z.array(routeSchema).min(1),
    tender_trailer: z.array(trailerSchema).min(1, "Вкажіть тип транспорту"),
    tender_load: z.array(loadSchema).min(1, "Вкажіть тип завантаження"),
    tender_permission: z.array(tenderPermissionSchema).optional(),
    company_name: z.string().optional().nullable(),
    load_info: z.string().optional(),
    volume: z.number({ message: `Вкажіть об'єм` }),
    weight: z.number({ message: "Вкажіть вагу" }),
    palet_count: z.number({ message: "Вкажіть кількість палет" }),
    ids_valut: z.string().optional(),
    cost_redemption: z.number().optional(),
    ref_temperature_to: z.number().optional().nullable(),
    ref_temperature_from: z.number().optional().nullable(),
    time_start: z.date({
      message: "Вкажіть дату початку тендеру",
    }),
    time_end: z
      .date({
        message: "Вкажіть дату завершення тендеру",
      })
      .optional()
      .nullable(),

    date_load: z.date({
      message: "Вкажіть дату завантаження",
    }),
    date_load2: z.date().optional().nullable(),
    date_unload: z.date().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // 1. Якщо РЕДУКЦІОН або РЕДУКЦІОН З ВИКУПОМ
    if (
      data.ids_type === "REDUCTION" ||
      data.ids_type === "REDUCTION_WITH_REDEMPTION"
    ) {
      if (!data.price_start || data.price_start <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Стартова ціна обов'язкова для редукціону",
          path: ["price_start"],
        });
      }
    }

    // 2. Якщо тільки РЕДУКЦІОН З ВИКУПОМ
    if (data.ids_type === "REDUCTION_WITH_REDEMPTION") {
      if (!data.cost_redemption || data.cost_redemption <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ціна викупу обов'язкова",
          path: ["cost_redemption"],
        });
      }
    }

    // 3. Валюта потрібна для всіх, де є ціна (за бажанням можна додати умови)
    if (data.ids_type !== "AUCTION" && !data.ids_valut) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Валюта обов'язкова",
        path: ["ids_valut"],
      });
    }
  });

// ---------- Types ----------
export type TenderFormValues = z.infer<typeof tenderFormSchema>;

// ---------- Nominatim Input ----------
interface NominatimInputProps {
  value: string;
  onChange: (address: string, country?: string, city?: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

// ---------- Main Form ----------
interface TenderFormProps {
  defaultValues?: Partial<TenderFormValues>;
  isEdit?: boolean;
}

export default function TenderSaveForm({
  defaultValues,
  isEdit,
}: TenderFormProps) {
  const router = useRouter();
  const [truckList, setTruckList] = useState<
    { label: string; value: string }[]
  >([]);
  const [loadList, setLoadList] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [tenderPermission, setTenderPermission] = useState<
    { label: string; value: string }[]
  >([]);
  const [tenderType, setTenderType] = useState<
    { label: string; value: string }[]
  >([]);
  const [valut, setValut] = useState<{ label: string; value: string }[]>([]);
  const [rating, setRating] = useState<{ label: string; value: string }[]>([]);
  const [companyLabel, setCompanyLabel] = useState<string>("");
  const [isNextTender, setIsNextTender] = useState(false);
  const { tender: tenderSocket } = useSockets();
  const form = useForm<TenderFormValues>({
    resolver: zodResolver(tenderFormSchema),
    defaultValues: {
      cargo: "",
      notes: "",
      id_owner_company: null,
      car_count: 1,
      ids_type: "AUCTION",
      ids_carrier_rating: "MAIN", // ← виправлена назва

      request_price: false,
      without_vat: true,
      tender_route: [
        { address: "", ids_point: "LOAD_FROM", order_num: 1, customs: false },
      ],
      tender_permission: [],
      tender_trailer: [],
      tender_load: [],
      company_name: "",
      load_info: "",
      time_start: new Date(),
      palet_count: 32,
      weight: 22,
      volume: 86,
      ids_valut: "UAH",

      ...defaultValues,
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const {
    fields: routeFields,
    append: appendRoute,
    remove: removeRoute,
  } = useFieldArray({
    control,
    name: "tender_route",
  });
  const typeValue = watch("ids_type");
  // Truck list
  useEffect(() => {
    const getTruckList = async () => {
      try {
        const { data } = await api.get(
          "/tender/form-data/getCreateTenderFormData",
        );
        setTruckList(
          data.content.trailer_type_dropdown.map((t: any) => ({
            value: t.ids,
            label: t.value,
          })),
        );
        setLoadList(
          data.content.load_type_dropdown.map((t: any) => ({
            value: t.ids,
            label: t.value,
          })),
        );
        setTenderType(
          data.content.tender_type_dropdown.map((t: any) => ({
            value: t.ids,
            label: t.value,
          })),
        );
        setTenderPermission(
          data.content.load_permission_dropdown.map((t: any) => ({
            value: t.ids,
            label: t.value,
          })),
        );
        setValut(
          data.content.valut_dropdown.map((t: any) => ({
            value: t.ids,
            label: t.ids,
          })),
        );
        setRating(
          data.content.rating_dropdown.map((t: any) => ({
            value: t.ids,
            label: t.value,
          })),
        );
      } catch (err) {
        console.error(err);
      }
    };
    getTruckList();
  }, []);

  const onSubmit: SubmitHandler<TenderFormValues> = async (values) => {
    console.log(values, "VALUES");

    try {
      const payload = { ...values };
      if (defaultValues?.id) payload.id = defaultValues.id;

      await api.post("/tender/save", payload);

      toast.success(isEdit ? "Тендер відредаговано!" : "Тендер створено!");
      tenderSocket?.emit("tender_updated"); // Бажано передати назву події

      if (!isNextTender) {
        router.back(); // Наприклад, перенаправлення
      }
      router.back(); // Наприклад, перенаправлення
    } catch (err) {
      console.error(err);
      toast.error("Помилка при збереженні тендеру");
    }
  };
  useEffect(() => {
    if (defaultValues) {
      // Створюємо копію дефолтних значень з перетвореними датами
      const preparedValues = {
        ...defaultValues,
        time_start: defaultValues.time_start
          ? new Date(defaultValues.time_start)
          : new Date(),
        time_end: defaultValues.time_end
          ? new Date(defaultValues.time_end)
          : null,
        date_load: defaultValues.date_load
          ? new Date(defaultValues.date_load)
          : null,
        date_load2: defaultValues.date_load2
          ? new Date(defaultValues.date_load2)
          : null,
        date_unload: defaultValues.date_unload
          ? new Date(defaultValues.date_unload)
          : null,
      };

      // Оновлюємо форму
      form.reset(preparedValues as TenderFormValues);

      // Якщо у вас є кастомні лейбли (наприклад, назва компанії)
      if (defaultValues.company_name) {
        setCompanyLabel(defaultValues.company_name);
      }
    }
  }, [defaultValues, form.reset]);

  console.log(errors, "ERRRORS");

  const tenderTrailer = watch("tender_trailer");
  const isOnlyRef =
    tenderTrailer.length === 1 && tenderTrailer[0].ids_trailer_type === "REF";

  useEffect(() => {
    if (!isOnlyRef) {
      setValue("ref_temperature_from", null);
      setValue("ref_temperature_to", null);
    }
  }, [isOnlyRef, setValue]);

  return (
    <Card className="mx-auto shadow-lg border-t-4 border-t-blue-600">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-slate-800">
          {isEdit ? "Редагування тендеру" : "Створення нового тендеру"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Заповніть деталі перевезення та умови аукціону
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          <fieldset disabled={isSubmitting} className="space-y-8">
            {/* SECTION 1: Основна інформація */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50/50 rounded-xl border">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-blue-700 text-sm uppercase tracking-wider">
                  <Box className="w-4 h-4" /> Основна інформація
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="ids_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тип тендеру</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Оберіть тип" />
                          </SelectTrigger>
                          <SelectContent>
                            {tenderType.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="ids_carrier_rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Рейтинг</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Рейтинг" />
                          </SelectTrigger>
                          <SelectContent>
                            {rating.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <InputAsyncSelectCompany
                  name="id_owner_company"
                  control={control}
                  label="Компанія замовник"
                  initialLabel={companyLabel}
                  onEntityChange={(c) => setCompanyLabel(c?.name || "")}
                />
              </div>

              {/* SECTION 2: Дати тендеру */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-blue-700 text-sm uppercase tracking-wider">
                  <Calendar className="w-4 h-4" /> Терміни проведення
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputDateWithTime
                    name="time_start"
                    control={control}
                    label="Початок"
                  />
                  <InputDateWithTime
                    name="time_end"
                    control={control}
                    label="Кінець"
                  />
                </div>
                <div className="pt-2 italic text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                  Вкажіть час, протягом якого перевізники зможуть подавати
                  ставки.
                </div>
              </div>
            </div>
            {/* SECTION: Дати завантаження та розвантаження (ПЕРЕД МАРШРУТОМ) */}
            <div className="space-y-4 p-4 bg-emerald-50/20 rounded-xl border border-emerald-100">
              <h3 className="font-semibold flex items-center gap-2 text-emerald-700 text-sm uppercase tracking-wider">
                <Calendar className="w-4 h-4" /> Графік логістики
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputDateWithTime
                  name="date_load"
                  control={control}
                  label="Завантаження (з)"
                />
                <InputDateWithTime
                  name="date_load2"
                  control={control}
                  label="Завантаження (до)"
                />
                <InputDateWithTime
                  name="date_unload"
                  control={control}
                  label="Розвантаження (план)"
                />
              </div>
            </div>
            {/* SECTION 3: Маршрут (Динамічний) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2 text-orange-700 text-sm uppercase tracking-wider">
                  <MapPin className="w-4 h-4" /> Маршрут та точки
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 border-orange-200 text-orange-700 hover:bg-orange-50"
                  onClick={() =>
                    appendRoute({
                      address: "",
                      ids_point: "LOAD_TO",
                      order_num: routeFields.length + 1,
                      customs: false,
                      city: "",
                    })
                  }
                >
                  <Plus className="w-4 h-4" /> Додати точку
                </Button>
              </div>

              <div className="space-y-3 bg-orange-50/20 p-4 rounded-xl border border-orange-100">
                {routeFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="flex flex-wrap md:flex-nowrap items-end gap-3 p-3 bg-white rounded-lg border shadow-sm relative"
                  >
                    <div className="flex-1 min-w-[250px]">
                      <FormField
                        control={control}
                        name={`tender_route.${idx}.address`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">{`Адреса #${idx + 1}`}</FormLabel>
                            <FormControl>
                              <GoogleLocationInput
                                value={f.value ?? ""}
                                onChange={(location) => {
                                  const addr = location.street
                                    ? `${location.street}${location.house ? `, ${location.house}` : ""}`
                                    : location.city || "";
                                  f.onChange(addr);
                                  setValue(
                                    `tender_route.${idx}.lat`,
                                    location.lat,
                                  );
                                  setValue(
                                    `tender_route.${idx}.lon`,
                                    location.lng,
                                  );
                                  setValue(
                                    `tender_route.${idx}.country`,
                                    location.countryCode || "",
                                  );
                                  setValue(
                                    `tender_route.${idx}.city`,
                                    location.city || "",
                                  );
                                  clearErrors(`tender_route.${idx}.address`);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="w-full md:w-[180px]">
                      <FormField
                        control={control}
                        name={`tender_route.${idx}.ids_point`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">
                              Тип точки
                            </FormLabel>
                            <Select value={f.value} onValueChange={f.onChange}>
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LOAD_FROM">
                                  Завантаження
                                </SelectItem>
                                <SelectItem value="CUSTOM_UP">
                                  Замитнення
                                </SelectItem>
                                <SelectItem value="CUSTOM_DOWN">
                                  Розмитнення
                                </SelectItem>
                                <SelectItem value="LOAD_TO">
                                  Розвантаження
                                </SelectItem>
                                <SelectItem value="BORDER">Кордон</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    {["LOAD_FROM", "LOAD_TO"].includes(
                      watch(`tender_route.${idx}.ids_point`),
                    ) && (
                      <div className="flex items-center gap-2 pb-2 px-2 border-l h-10">
                        <FormField
                          control={control}
                          name={`tender_route.${idx}.customs`}
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <FormLabel className="text-xs cursor-pointer">
                                Митниця
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {idx > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeRoute(idx)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: Деталі вантажу та транспорту */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-emerald-700 text-sm uppercase tracking-wider">
                  <Truck className="w-4 h-4" /> Параметри перевезення
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputText
                    icon={Box}
                    name="cargo"
                    control={control}
                    label="Назва вантажу"
                  />
                  <InputMultiSelect
                    name="tender_trailer"
                    control={control}
                    label="Тип транспорту"
                    options={truckList}
                    required
                  />
                  {isOnlyRef && (
                    <div className="grid grid-cols-2 gap-4">
                      <InputNumber
                        name="ref_temperature_from"
                        control={control}
                        label="Температура від (°C)"
                        required
                        minus
                      />
                      <InputNumber
                        name="ref_temperature_to"
                        control={control}
                        label="Температура до (°C)"
                        required
                        minus
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputMultiSelect
                    name="tender_load"
                    control={control}
                    label="Тип завантаження"
                    options={loadList}
                    valueKey="ids_load_type"
                    required
                  />
                  <InputMultiSelect
                    name="tender_permission"
                    control={control}
                    label="Дозволи"
                    icon={FileText}
                    options={tenderPermission}
                    valueKey="ids_permission_type"
                    required
                  />
                </div>
                <InputTextarea
                  icon={Notebook}
                  name="notes"
                  control={control}
                  label="Додаткові примітки"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border space-y-4">
                <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">
                  Габарити
                </h3>
                <InputNumber
                  control={control}
                  name="car_count"
                  label="К-сть авто"
                  icon={Car}
                />
                <InputNumber
                  control={control}
                  name="weight"
                  label="Вага (т)"
                  icon={Weight}
                />
                <InputNumber
                  control={control}
                  name="volume"
                  label="Об'єм (м³)"
                  icon={Box}
                />
                <InputNumber
                  control={control}
                  name="palet_count"
                  label="Палети (шт)"
                  icon={Boxes}
                />
              </div>
            </div>

            {/* SECTION 5: Фінанси */}
            {(typeValue === "AUCTION" ||
              typeValue === "REDUCTION" ||
              typeValue === "REDUCTION_WITH_REDEMPTION") && (
              <div className="p-4 bg-red-50/30 rounded-xl border border-red-100">
                <h3 className="font-semibold flex items-center gap-2 text-red-700 text-sm uppercase tracking-wider mb-4">
                  <DollarSign className="w-4 h-4" /> Фінансові умови
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Поле ЦІНА з'являється тільки для РЕДУКЦІОНІВ */}
                  {(typeValue === "REDUCTION" ||
                    typeValue === "REDUCTION_WITH_REDEMPTION") && (
                    <InputFinance
                      name="price_start" // Використовуємо як основну ціну
                      control={control}
                      label="Ціна"
                    />
                  )}

                  {/* Поле СТАРТОВА ЦІНА тільки для АУКЦІОНУ */}
                  {typeValue === "AUCTION" && (
                    <InputFinance
                      name="price_start"
                      control={control}
                      label="Старт"
                    />
                  )}

                  <SelectFinance
                    name="ids_valut"
                    control={control}
                    label="Валюта"
                    options={valut.slice(0, 4)}
                  />

                  {/* Крок ставки зазвичай потрібен тільки для аукціону або редукціону (опціонально) */}
                  <InputFinance
                    name="price_step"
                    control={control}
                    label="Крок"
                  />

                  {/* Поле ВИКУП тільки для редукціону з викупом або аукціону (якщо передбачено логікою) */}
                  {typeValue === "REDUCTION_WITH_REDEMPTION" && (
                    <InputFinance
                      name="cost_redemption"
                      control={control}
                      label="Викуп"
                      required // Можна додати візуальну помітку
                    />
                  )}
                </div>

                <div className="mt-4 border-t pt-4">
                  <InputSwitch
                    control={control}
                    name="without_vat"
                    label="Ставка без ПДВ"
                  />
                </div>
              </div>
            )}

            {/* Footer actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t">
              <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                <InputSwitch
                  id="is_next"
                  checked={isNextTender}
                  onCheckedChange={setIsNextTender}
                  label="Створити наступний після збереження"
                />
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => form.reset()}
                  className="flex-1 md:flex-none"
                >
                  Очистити
                </Button>
                <AppButton
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[200px] flex-1 md:flex-none shadow-md"
                >
                  {isSubmitting
                    ? "Збереження..."
                    : isEdit
                      ? "Оновити тендер"
                      : "Створити тендер"}
                </AppButton>
              </div>
            </div>
          </fieldset>
        </form>
      </Form>
    </Card>
  );
}
