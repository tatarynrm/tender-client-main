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
import AsyncSelect from "react-select/async";
import { default as ReactSelect } from "react-select";
import api from "@/shared/api/instance.api";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { MyTooltip } from "@/shared/components/Tooltips/MyTooltip";
import { useRouter } from "next/navigation";
import DateTimePicker from "@/shared/components/Inputs/DatePicker";
import { GoogleLocationInput } from "@/shared/components/google-location-input/GoogleLocationInput";
import { useSockets } from "@/shared/providers/SocketProvider";

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
    ids_type: z.enum(["GENERAL", "PRICE_REQUEST"]),
    ids_rating: z.enum(["MAIN", "MEDIUM", "IMPORTANT"]),
    duration_continue: z.boolean(),
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
  })
  .superRefine((data, ctx) => {
    /* ------- GENERAL ------- */
    if (data.ids_type === "GENERAL") {
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
  isEdit = false,
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
  const [valut, setValut] = useState<{ label: string; value: number }[]>([]);
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
      ids_type: "GENERAL",
      ids_rating: "MAIN", // ← виправлена назва
      duration_continue: true,
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
    ;

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
  // useEffect(() => {
  //   if (typeValue === "REQUEST_PRICE") {
  //     // Очищаємо помилки для полів, які тепер не є обов'язковими
  //     clearErrors(["price_start", "price_step", "ids_valut"]);
  //   }
  // }, [typeValue, clearErrors]);
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
    try {
      const payload = { ...values };
      if (defaultValues?.id) payload.id = defaultValues.id;

      await api.post("/tender/save", payload);

      toast.success(isEdit ? "Тендер відредаговано!" : "Тендер створено!");
      tenderSocket?.emit("tender_updated"); // Бажано передати назву події

      if (!isNextTender) {
        router.push("/log/tender"); // Наприклад, перенаправлення
      }
    } catch (err) {
      console.error(err);
      toast.error("Помилка при збереженні тендеру");
    }
  };

  return (
    <Card className="max-w-3xl mx-auto p-3 mb-20">
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
                name="ids_rating"
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
            {/* Cargo */}
            <FormField
              control={control}
              name="cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Вантаж</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage>{errors.cargo?.message}</FormMessage>
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Примітки</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Company */}
            <FormField
              control={control}
              name="id_owner_company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Компанія</FormLabel>
                  <FormControl>
                    <AsyncSelect
                      cacheOptions
                      loadOptions={loadOptionsFromApi("/company/name")}
                      defaultOptions
                      placeholder="Введіть назву компанії"
                      noOptionsMessage={() => "Немає результатів"}
                      value={
                        field.value
                          ? { value: field.value, label: companyLabel }
                          : null
                      }
                      onChange={(option) => {
                        field.onChange(option?.value ?? null);
                        setCompanyLabel(option?.label ?? "");
                      }}
                      styles={{
                        option: (base, state) => ({
                          ...base,
                          color: "black", // 🔹 колір тексту у випадаючому списку
                          backgroundColor: state.isFocused
                            ? "rgba(0, 128, 128, 0.1)" // легкий teal при наведенні
                            : "white", // фон опції
                          cursor: "pointer",
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: "black", // 🔹 колір вибраного значення у полі
                        }),
                        input: (base) => ({
                          ...base,
                          color: "black", // 🔹 колір введеного тексту при пошуку
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: "#666", // 🔹 колір placeholder’а
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: "white", // фон випадаючого списку
                          zIndex: 10,
                        }),
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
                          {/* <NominatimInput
                          value={f.value ?? ""}
                          onChange={(addr, country, city) => {
                            // console.log(addr, country, city, "------------");

                            f.onChange(addr);
                            setValue(
                              `tender_route.${idx}.country`,
                              country || ""
                            );
                            setValue(`tender_route.${idx}.city`, city || "");
                            clearErrors(`tender_route.${idx}.address` || "");
                          }}
                        /> */}
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

            {/* Trailer */}
            <FormField
              control={control}
              name="tender_trailer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип транспорту</FormLabel>
                  <FormControl>
                    <ReactSelect
                      isMulti
                      options={truckList}
                      value={truckList.filter((t) =>
                        field.value.some(
                          (v: any) => v.ids_trailer_type === t.value,
                        ),
                      )}
                      onChange={(options: any) =>
                        field.onChange(
                          options
                            ? options.map((o: any) => ({
                                ids_trailer_type: o.value,
                              }))
                            : [],
                        )
                      }
                      placeholder="Оберіть тип транспорту"
                      closeMenuOnSelect={false}
                      {...({ menuShouldCloseOnSelect: false } as any)}
                      hideSelectedOptions={false}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* Load Type */}
            <FormField
              control={control}
              name="tender_load"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип завантаження</FormLabel>
                  <FormControl>
                    <ReactSelect
                      isMulti
                      options={loadList}
                      value={loadList.filter((t) =>
                        field.value.some(
                          (v: any) => v.ids_load_type === t.value,
                        ),
                      )}
                      onChange={(options: any) =>
                        field.onChange(
                          options
                            ? options.map((o: any) => ({
                                ids_load_type: o.value,
                              }))
                            : [],
                        )
                      }
                      placeholder="Оберіть тип завантаження"
                      closeMenuOnSelect={false}
                      {...({ menuShouldCloseOnSelect: false } as any)}
                      hideSelectedOptions={false}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* Load Permission Dropdown */}
            <FormField
              control={control}
              name="tender_permission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дозволи / Документи</FormLabel>
                  <FormControl>
                    <ReactSelect
                      isMulti
                      options={tenderPermission}
                      value={tenderPermission.filter((t) =>
                        (field.value ?? []).some(
                          (v: any) => v.ids_permission_type === t.value,
                        ),
                      )}
                      onChange={(options: any) =>
                        field.onChange(
                          options
                            ? options.map((o: any) => ({
                                ids_permission_type: o.value,
                              }))
                            : [],
                        )
                      }
                      placeholder="Оберіть дозволи"
                      closeMenuOnSelect={false}
                      {...({ menuShouldCloseOnSelect: false } as any)}
                      hideSelectedOptions={false}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Options */}
            <div className="flex gap-4 flex-wrap">
              <FormField
                control={control}
                name="without_vat"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormLabel>Без ПДВ</FormLabel>
                  </FormItem>
                )}
              />
              {/* <FormField
              control={control}
              name="duration_continue"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FormLabel>Тривалий тендер</FormLabel>
                </FormItem>
              )}
            /> */}
              {/* <FormField
              control={control}
              name="request_price"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FormLabel>Запит ціни</FormLabel>
                </FormItem>
              )}
            /> */}
            </div>

            {/* Car count / Cost / price_step */}
            <div className="flex gap-4 flex-wrap">
              <FormField
                control={control}
                name="car_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>К-сть авто</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage>{errors.car_count?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Вага</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        placeholder="22 Тон"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Об’єм</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        placeholder="86 Куб"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-b border-red-200 w-full h-[3px]"></div>
              {/* CONDITIONAL FIELDS */}
              {typeValue === "GENERAL" && (
                <>
                  <FormField
                    control={control}
                    name="price_start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Стартова ціна</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage>{errors.car_count?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ids_valut"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Валюта</FormLabel>
                        <FormControl>
                          <Select
                            // disabled={isLoadingRegister}
                            value={field.value?.toString() || ""}
                            onValueChange={(val) => field.onChange(val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Вкажіть валюту" />
                            </SelectTrigger>
                            <SelectContent>
                              {valut
                                ?.slice(0, 4)
                                .map(
                                  (
                                    item: any,
                                    idx: React.Key | null | undefined,
                                  ) => {
                                    // console.log(item, "ITEM");

                                    return (
                                      <SelectItem
                                        key={idx}
                                        value={String(item.value)}
                                      >
                                        {item.label.toUpperCase()}
                                      </SelectItem>
                                    );
                                  },
                                )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="price_step"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Крок ставки</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="cost_redemption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ціна викупу</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        {/* <FormMessage>{errors.car_count?.message}</FormMessage> */}
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="is-next-check"
                checked={isNextTender}
                onCheckedChange={setIsNextTender}
                className="data-[state=checked]:bg-orange-500"
              />
              <div className="space-y-0.5">
                <Label
                  htmlFor="is-next-check"
                  className="text-sm font-bold uppercase text-zinc-700"
                >
                  Створити наступний
                </Label>
                <p className="text-[10px] text-zinc-500 uppercase">
                  Після збереження форма залишиться відкритою
                </p>
              </div>
            </div>
            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
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
              </Button>
            </div>
          </fieldset>
        </form>
      </Form>
    </Card>
  );
}
