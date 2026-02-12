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

import api from "@/shared/api/instance.api";

import { Box, Boxes, Car, Minus, Notebook, Plus, Weight } from "lucide-react";
import { MyTooltip } from "@/shared/components/Tooltips/MyTooltip";
import { useRouter } from "next/navigation";
import DateTimePicker from "@/shared/components/Inputs/DatePicker";
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
    tender_trailer: z.array(trailerSchema).min(1),
    tender_load: z.array(loadSchema).min(1),
    tender_permission: z.array(tenderPermissionSchema).optional(),
    company_name: z.string().optional(),
    load_info: z.string().optional(),
    volume: z.number({ message: `Вкажіть об'єм` }),
    weight: z.number({ message: "Вкажіть вагу" }),
    palet_count: z.number({ message: "Вкажіть кількість палет" }),
    ids_valut: z.string().optional(),
    cost_redemption: z.number().optional(),
    time_start: z.date({
      message: "Вкажіть дату початку тендеру",
    }),
    time_end: z
      .date({
        message: "Вкажіть дату завершення тендеру",
      })
      .optional(),

    date_load: z.date({
      message: "Вкажіть дату завантаження",
    }),
    date_load2: z.date().optional().nullable(),
    date_unload: z.date().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    /* ------- GENERAL ------- */
    if (data.ids_type === "AUCTION") {
      if (!data.price_start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Стартова ціна обов'язкова",
          path: ["price_start"],
        });
      }
      if (!data.ids_valut) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Валюта обов'язкова",
          path: ["ids_valut"],
        });
      }
      if (!data.price_step) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Крок ставки обов'язковий",
          path: ["price_step"],
        });
      }
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

  const loadOptionsFromApi = (url: string) => async (inputValue: string) => {
    if (!inputValue) return [];
    try {
      const response = await api.get<any>(
        `${url}/${encodeURIComponent(inputValue)}`,
      );
      return response.data.map((company: any) => ({
        value: company.id,
        label: company.company_name,
      }));
    } catch {
      return [];
    }
  };

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

  return (
    <Card className=" mx-auto p-3 mb-20">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <fieldset disabled={isSubmitting} className="space-y-4">
            <div className="flex justify-between">
              <FormField
                control={control}
                name="ids_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип тендеру</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
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
                    <FormLabel>Рейтинг перевізника</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Оберіть тип" />
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
            <div className="flex justify-between">
              <FormField
                control={form.control}
                name="time_start"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DateTimePicker
                        label="Початок тендеру"
                        onChange={(date) => field.onChange(date)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time_end"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DateTimePicker
                        label="Кінець тендеру"
                        onChange={(date) => field.onChange(date)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <InputDateWithTime
                name="date_load"
                control={control}
                label="Дата завантаження з"
              />

              <InputDateWithTime
                name="date_load2"
                control={control}
                label="Дата завантаження по"
              />

              <InputDateWithTime
                name="date_unload"
                control={control}
                label="Дата розвантаження"
              />
            </div>
            {/* Routes */}
            <div className="flex flex-col gap-4">
              {routeFields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-2 mb-2">
                  <FormField
                    control={control}
                    name={`tender_route.${idx}.address`}
                    render={({ field: f }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{`Адреса #${idx + 1}`}</FormLabel>
                        <FormControl>
                          <GoogleLocationInput
                            value={f.value ?? ""}
                            onChange={(location) => {
                              console.log(location, "Location");

                              // формуємо addr для input
                              const addr = location.street
                                ? `${location.street}${
                                    location.house ? `, ${location.house}` : ""
                                  }`
                                : location.city || "";

                              // оновлюємо input field
                              f.onChange(addr);
                              setValue(`tender_route.${idx}.lat`, location.lat);
                              setValue(`tender_route.${idx}.lon`, location.lng);
                              // оновлюємо country/city в формі
                              setValue(
                                `tender_route.${idx}.country`,
                                location.countryCode || "",
                              );
                              setValue(
                                `tender_route.${idx}.city`,
                                location.city || "",
                              );

                              // очищаємо помилки
                              clearErrors(`tender_route.${idx}.address`);
                            }}
                          />
                        </FormControl>
                        <FormMessage>
                          {errors?.tender_route?.[idx]?.address?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`tender_route.${idx}.ids_point`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Тип точки</FormLabel>
                        <Select value={f.value} onValueChange={f.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Виберіть тип" />
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

                  {/* показуємо тільки якщо тип — завантаження або розвантаження */}
                  {["LOAD_FROM", "LOAD_TO"].includes(
                    watch(`tender_route.${idx}.ids_point`),
                  ) && (
                    <>
                      <FormField
                        control={control}
                        name={`tender_route.${idx}.customs`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <Switch
                              id={`tender_route.${idx}.customs`}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <FormLabel htmlFor={`tender_route.${idx}.customs`}>
                              На місці ?
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <MyTooltip
                        text="Вказувати якщо замитнення або розмитнення по місцях"
                        important
                      />
                    </>
                  )}

                  {idx > 0 && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeRoute(idx)}
                    >
                      <Minus />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendRoute({
                    address: "",
                    ids_point: "LOAD_FROM",
                    order_num: routeFields.length + 1,
                    customs: false,
                    city: "",
                  })
                }
              >
                <Plus />
              </Button>
            </div>
            <InputText
              icon={Box}
              name="cargo"
              control={control}
              label="Вантаж"
            />
            <InputTextarea
              icon={Notebook}
              name="notes"
              control={control}
              label="Примітки"
            />

            <InputAsyncSelectCompany
              name="id_owner_company"
              control={control}
              label="Компанія"
              initialLabel={companyLabel}
              onEntityChange={(c) => setCompanyLabel(c?.name || "")}
            />
            {/* Trailer */}

            <InputMultiSelect
              name="tender_trailer"
              control={control}
              label="Тип транспорту"
              options={truckList}
              required
            />

            <InputMultiSelect
              name="tender_load" // тепер тут буде просто ["BACK", "TOP"]
              control={control}
              label="Тип завантаження"
              options={loadList}
              required
              valueKey="ids_load_type" // вказуємо, що значення для форми береться з цього ключа в об'єкті
            />

            {/* Load Permission Dropdown */}
            <InputMultiSelect
              name="tender_permission" // тепер тут буде просто ["BACK", "TOP"]
              control={control}
              label="Тип дозволу"
              options={tenderPermission}
              required
              valueKey="ids_permission_type" // вказуємо, що значення для форми береться з цього ключа в об'єкті
            />

            {/* Options */}
            <div className="flex gap-4 flex-wrap">
              <InputSwitch
                control={control}
                name="without_vat"
                label="Без ПДВ"
              />
            </div>

            {/* Car count / Cost / price_step */}
            <div className="flex gap-4 flex-wrap">
              <InputNumber
                control={control}
                name="car_count"
                label="К-сть авто"
                icon={Car}
                placeholder="1 Авто"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputNumber
                  control={control}
                  name="weight"
                  label="Вага"
                  icon={Weight}
                  placeholder="22 Тон"
                />

                <InputNumber
                  control={control}
                  name="volume"
                  label="Об’єм"
                  icon={Box}
                  placeholder="86 Куб"
                />

                <InputNumber
                  control={control}
                  name="palet_count"
                  label="К-сть палет"
                  icon={Boxes}
                  placeholder="32 Палет"
                />
              </div>

              <div className="border-b border-red-200 w-full h-[3px]"></div>
              {/* CONDITIONAL FIELDS */}
              {typeValue === "AUCTION" && (
                <>
                  <InputFinance
                    name="price_start"
                    control={control}
                    label="Стартова ціна"
                  />
                  <SelectFinance
                    name="ids_valut"
                    control={control}
                    label="Валюта"
                    options={valut.slice(0, 4)}
                  />

                  <InputFinance
                    name="price_step"
                    control={control}
                    label="Крок ставки"
                  />

                  <InputFinance
                    name="cost_redemption"
                    control={control}
                    label="Ціна викупу"
                  />
                </>
              )}
            </div>
            <div className="flex items-center gap-3 bg-blue-500/5 px-4 py-2 rounded-xl border border-blue-500/10">
              <InputSwitch
                id="is_next"
                checked={isNextTender}
                label="Ще один тендер після збереження"
                onCheckedChange={setIsNextTender}
                className="data-[state=checked]:bg-blue-600"
              />
              <MyTooltip text="Форма не буде очищена після збереження" />
            </div>
            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4">
              <AppButton
                type="submit"
                disabled={isSubmitting}
                className="min-w-[150px]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Збереження...
                  </span>
                ) : isEdit ? (
                  "Оновити тендер"
                ) : (
                  "Створити тендер"
                )}
              </AppButton>
            </div>
          </fieldset>
        </form>
      </Form>
    </Card>
  );
}
