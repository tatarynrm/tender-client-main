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
import { UniqueFileUploader } from "@/shared/ict_components/UniqueFileUploader/UniqueFileUploader";

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
  ids_permission_type: z.string().optional(),
});

const numericSchema = (message: string) =>
  z.union([
    z.number(),
    z
      .string()
      .min(1, message)
      .refine((val) => !isNaN(Number(val.replace(",", "."))), {
        message: "Має бути числом",
      }),
  ]);

const optionalNumericSchema = () =>
  z
    .union([z.number(), z.string(), z.undefined(), z.null()])
    .optional()
    .refine(
      (val) => {
        if (val === "" || val === undefined || val === null) return true;
        return !isNaN(Number(String(val).replace(",", ".")));
      },
      { message: "Має бути числом" },
    );

const tenderFormSchema = z
  .object({
    id: z.number().optional(),
    cargo: z.string().min(1, "Вантаж обов'язковий"),
    notes: z.string().optional(),
    id_owner_company: z.number().nullable(),
    car_count: z
      .union([z.number(), z.string()])
      .refine(
        (v) => v !== "" && v !== null && v !== undefined,
        "Мінімум 1 авто",
      ),
    price_start: optionalNumericSchema(),
    price_step: optionalNumericSchema(),
    ids_type: z.enum(["GENERAL", "REQUEST_PRICE"]),
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
    volume: numericSchema("Вкажіть об'єм"),
    weight: numericSchema("Вкажіть вагу"),
    ids_valut: z.string().optional(),
    cost_redemption: optionalNumericSchema(),
    time_start: z.date({
      message: "Вкажіть дату початку тендеру",
    }),
    end_date: z
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
export type TenderFormValues = z.input<typeof tenderFormSchema>;
export type TenderFormOutput = z.output<typeof tenderFormSchema>;

// ---------- FloatInput — дозволяє вводити дробові числа ----------
interface FloatInputProps {
  value: string | number | undefined | null;
  onChange: (val: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}

function FloatInput({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
}: FloatInputProps) {
  const [raw, setRaw] = React.useState(value != null ? String(value) : "");

  // Синхронізуємо якщо зовнішнє значення змінилось (наприклад reset форми)
  React.useEffect(() => {
    const external = value != null ? String(value) : "";
    if (external !== raw && !raw.endsWith(".")) {
      setRaw(external);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={raw}
      className={
        className ??
        "flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring transition-[color,box-shadow]"
      }
      onChange={(e) => {
        const v = e.target.value.replace(",", ".");
        // Дозволяємо: цифри, одну крапку, порожній рядок
        if (v === "" || /^\d*\.?\d*$/.test(v)) {
          setRaw(v);
          onChange(v);
        }
      }}
      onBlur={onBlur}
    />
  );
}

// ---------- Nominatim Input ----------
interface NominatimInputProps {
  value: string;
  onChange: (address: string, country?: string, city?: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

const NominatimInput = ({
  value,
  onChange,
  placeholder,
  defaultValue,
}: NominatimInputProps) => {
  const [query, setQuery] = useState(value || defaultValue || "");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(value || null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 3 || selected) return;
      try {
        const { data } = await api.get(`/nominatim/search?q=${query}`);
        setResults(data);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selected]);

  return (
    <div className="relative">
      <Input
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(null);
        }}
      />
      {results.length > 0 && !selected && (
        <ul className="absolute z-10 bg-white border w-full max-h-60 overflow-auto mt-1 rounded shadow">
          {results.map((r, idx) => (
            <li
              key={idx}
              className="p-1 cursor-pointer hover:bg-teal-100"
              onClick={() => {
                onChange(
                  r.display_name,
                  r.address.country_code,
                  r.address.city,
                );
                setQuery(r.display_name);
                setSelected(r.display_name);
                setResults([]);
              }}
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

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
  const [files, setFiles] = useState<(File | any)[]>([]); // New and existing files combined
  const STORAGE_KEY = "tender_form_draft";

  const form = useForm<TenderFormValues>({
    resolver: zodResolver(tenderFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      cargo: "",
      notes: "",
      id_owner_company: null,
      car_count: 1,
      ids_type: "GENERAL",
      ids_rating: "MAIN",
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
    reset,
    formState: { errors },
  } = form;

  const watchedValues = watch();

  // Load draft on mount
  useEffect(() => {
    if (!isEdit) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const { values, companyLabel: savedLabel } = JSON.parse(saved);
          // Convert date strings back to Date objects
          if (values.time_start)
            values.time_start = new Date(values.time_start);
          if (values.end_date) values.end_date = new Date(values.end_date);

          Object.keys(values).forEach((key: any) => {
            setValue(key, values[key]);
          });
          if (savedLabel) setCompanyLabel(savedLabel);
        } catch (e) {
          console.error("Failed to load tender draft", e);
        }
      }
    }
  }, [isEdit, setValue]);

  // Save draft on changes
  useEffect(() => {
    if (!isEdit) {
      const timer = setTimeout(() => {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            values: watchedValues,
            companyLabel,
          }),
        );
      }, 1000); // Debounce save
      return () => clearTimeout(timer);
    }
  }, [watchedValues, companyLabel, isEdit]);

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

  // Fetch existing files if editing
  useEffect(() => {
    if (isEdit && defaultValues?.id) {
      const fetchFiles = async () => {
        try {
          const { data } = await api.get(`/tender/files/${defaultValues.id}`);
          if (data.status === "ok") {
            setFiles(data.content || []);
          }
        } catch (err) {
          console.error("Failed to fetch tender files", err);
        }
      };
      fetchFiles();
    }
  }, [isEdit, defaultValues?.id]);

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

  const onSubmit: SubmitHandler<TenderFormValues> = async (data) => {
    const values = data as any;
    console.log(values, "VALUES");

    const parseNum = (v: any) => {
      if (v === "" || v === undefined || v === null) return undefined;
      return Number(String(v).replace(",", "."));
    };

    try {
      const payload = {
        ...values,
        car_count: parseNum(values.car_count),
        weight: parseNum(values.weight),
        volume: parseNum(values.volume),
        price_start: parseNum(values.price_start),
        price_step: parseNum(values.price_step),
        cost_redemption: parseNum(values.cost_redemption),
        tender_permission:
          values.tender_permission?.filter(
            (p: any) => p && p.ids_permission_type,
          ) || [],
        tender_trailer:
          values.tender_trailer?.filter((t: any) => t && t.ids_trailer_type) ||
          [],
        tender_load:
          values.tender_load?.filter((l: any) => l && l.ids_load_type) || [],
        tender_route: values.tender_route.map((route: any, idx: number) => ({
          ...route,
          order_num: idx + 1,
        })),
      };
      if (defaultValues?.id) payload.id = defaultValues.id;

      // Separate existing files (have ID) and new files (File objects)
      const current_file_ids = files.filter((f) => f.id).map((f) => f.id);

      const newFiles = files.filter((f) => f instanceof File);

      // Create FormData
      const formData = new FormData();

      // We send the JSON data as a string in the 'dto' field
      // as our backend controller expects 'dto' or parses the body
      formData.append(
        "dto",
        JSON.stringify({
          ...payload,
          current_file_ids,
        }),
      );

      // Append new files
      newFiles.forEach((file) => {
        formData.append("files", file);
      });

      console.log("--- SENDING TENDER SAVE REQUEST ---");
      await api.post("/tender/save", formData);

      toast.success(isEdit ? "Тендер відредаговано!" : "Тендер створено!");
      localStorage.removeItem(STORAGE_KEY);
      tenderSocket?.emit("");
      if (isEdit) {
        router.back();
      } else if (!isNextTender) {
        setFiles([]);
        router.push("/log/tender/draft");
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
              name="end_date"
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
                          <SelectItem value="CUSTOM_UP">Замитнення</SelectItem>
                          <SelectItem value="CUSTOM_DOWN">
                            Розмитнення
                          </SelectItem>
                          <SelectItem value="LOAD_TO">Розвантаження</SelectItem>
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
                      field.value.some((v: any) => v.ids_load_type === t.value),
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
                    <FloatInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
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
                    <FloatInput
                      value={field.value}
                      placeholder="22.3 Тон"
                      onChange={field.onChange}
                      onBlur={field.onBlur}
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
                      allowFloat
                      type="text"
                      value={field.value ?? ""}
                      placeholder="86 Куб"
                      onChange={(e) => {
                        const val = e.target.value.replace(",", ".");
                        if (/^\d*\.?\d*$/.test(val)) {
                          field.onChange(val);
                        }
                      }}
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
                        <FloatInput
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
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
                          value={field.value?.toString() || ""}
                          onValueChange={(val) => field.onChange(val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Вкажіть валюту" />
                          </SelectTrigger>
                          <SelectContent>
                            {valut?.slice(0, 4).map((item: any, idx: any) => {
                              return (
                                <SelectItem
                                  key={idx}
                                  value={String(item.value)}
                                >
                                  {item.label.toUpperCase()}
                                </SelectItem>
                              );
                            })}
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
                        <FloatInput
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
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
                        <FloatInput
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          {/* Files Section */}
          <div className="py-4 border-t border-gray-100">
            <UniqueFileUploader
              files={files}
              onChange={setFiles}
              maxFiles={10}
              label="Документи до тендеру"
              description="Завантажте специфікації, фото вантажу або інші документи"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-between items-center">
            {!isEdit && (
              <div className="flex items-center gap-2">
                <Label htmlFor="is_next_tender">Додати схожий тендер</Label>
                <MyTooltip text="Якщо включено, форма не буде очищена після збереження" />
                <Switch
                  id="is_next_tender"
                  checked={isNextTender}
                  onCheckedChange={setIsNextTender}
                />
              </div>
            )}
            <Button type="submit">
              {isEdit ? "Редагувати тендер" : "Додати тендер"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
