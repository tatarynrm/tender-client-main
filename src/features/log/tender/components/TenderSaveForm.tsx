"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// --- DND KIT IMPORTS ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- ICONS ---
import {
  Box,
  Boxes,
  Calendar,
  Car,
  DollarSign,
  GripVertical,
  MapPin,
  Minus,
  Notebook,
  Plus,
  Truck,
  Weight,
  ThermometerSnowflake,
  ShieldCheck,
  Zap,
  ChevronRight,
  Info,
  Clock,
  LayoutDashboard,
} from "lucide-react";

// --- COMPONENTS ---
import {
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
import { GoogleLocationInput } from "@/shared/components/google-location-input/GoogleLocationInput";
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
import { UniqueFileUploader } from "@/shared/ict_components/UniqueFileUploader/UniqueFileUploader";
import { cn } from "@/shared/utils";

import api from "@/shared/api/instance.api";
import { useSaveTender } from "../../hooks/useSaveTender";
import { currencyStringTransform } from "@/shared/helpers/currency-formatter";

// ==========================================
// SCHEMAS
// ==========================================
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

const trailerSchema = z.object({ ids_trailer_type: z.string() });
const loadSchema = z.object({ ids_load_type: z.string() });
const tenderPermissionSchema = z.object({
  ids_permission_type: z.string().optional(),
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
    price_redemption: z.number().optional(),
    ids_type: z.enum(["AUCTION", "REDUCTION", "REDUCTION_WITH_REDEMPTION"], {
      message: "Вкажіть тип тендеру",
    }),
    ids_carrier_rating: z.enum(["MAIN", "MEDIUM", "IMPORTANT"]),

    without_vat: z.boolean(),
    tender_route: z.array(routeSchema).min(1, "Додайте хоча б одну точку"),
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
    time_start: z.date({ message: "Вкажіть дату початку тендеру" }),
    time_end: z
      .date({ message: "Вкажіть дату завершення тендеру" })
      .optional()
      .nullable(),
    date_load: z.date({ message: "Вкажіть дату завантаження" }),
    date_load2: z.date().optional().nullable(),
    date_unload: z.date().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (
      data.ids_type === "REDUCTION" ||
      data.ids_type === "REDUCTION_WITH_REDEMPTION"
    ) {
      if (!data.price_start || data.price_start <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Стартова ціна обов'язкова",
          path: ["price_start"],
        });
      }
      if (!data.price_step || data.price_step <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Вкажіть крок ставки",
          path: ["price_step"],
        });
      }
    }
    if (
      data.ids_type === "REDUCTION_WITH_REDEMPTION" &&
      (!data.price_redemption || data.price_redemption <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ціна викупу обов'язкова",
        path: ["price_redemption"],
      });
    }
    if (data.ids_type !== "AUCTION" && !data.ids_valut) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Валюта обов'язкова",
        path: ["ids_valut"],
      });
    }
  });

export type TenderFormValues = z.infer<typeof tenderFormSchema>;

// ==========================================
// SORTABLE ROUTE ITEM (DND KIT)
// ==========================================
function SortableRouteItem({
  id,
  index,
  control,
  watch,
  setValue,
  clearErrors,
  removeRoute,
}: {
  id: string;
  index: number;
  control: any;
  watch: any;
  setValue: any;
  clearErrors: any;
  removeRoute: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { zIndex: 50, position: "relative" as const } : {}),
  };

  const pointType = watch(`tender_route.${index}.ids_point`);
  const isBorderOrCustoms = ["CUSTOM_UP", "CUSTOM_DOWN", "BORDER"].includes(
    pointType,
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 p-4 mb-3 relative group transition-all",
        isDragging &&
          "shadow-2xl ring-2 ring-indigo-500/20 scale-[1.01] z-50 bg-indigo-50/10",
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="p-2 -ml-2 text-slate-300 hover:text-indigo-500 cursor-grab active:cursor-grabbing transition-colors"
            >
              <GripVertical className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">
              ТОЧКА #{index + 1}
            </span>
          </div>
          {index > 1 && (
            <button
              type="button"
              onClick={() => removeRoute(index)}
              className="text-rose-500 hover:text-rose-600 p-2 -mr-2 bg-rose-50 dark:bg-rose-500/10 rounded-full transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6">
            <FormField
              control={control}
              name={`tender_route.${index}.address`}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                    Локація
                  </FormLabel>
                  <FormControl>
                    <GoogleLocationInput
                      value={f.value ?? ""}
                      onChange={(location) => {
                        const addr = location.street
                          ? `${location.street}${location.house ? `, ${location.house}` : ""}`
                          : location.city || "";
                        f.onChange(addr);
                        setValue(`tender_route.${index}.lat`, location.lat);
                        setValue(`tender_route.${index}.lon`, location.lng);
                        setValue(
                          `tender_route.${index}.country`,
                          location.countryCode || "",
                        );
                        setValue(
                          `tender_route.${index}.city`,
                          location.city || "",
                        );
                        clearErrors(`tender_route.${index}.address`);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-4">
            <FormField
              control={control}
              name={`tender_route.${index}.ids_point`}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                    Тип
                  </FormLabel>
                  <Select value={f.value} onValueChange={f.onChange}>
                    <SelectTrigger
                      className={cn(
                        "h-12 rounded-2xl bg-slate-50 border-none shadow-inner",
                        isBorderOrCustoms && "bg-amber-50 text-amber-700",
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOAD_FROM">Завантаження</SelectItem>
                      <SelectItem value="LOAD_TO">Розвантаження</SelectItem>
                      <SelectItem value="CUSTOM_UP">Замитнення</SelectItem>
                      <SelectItem value="CUSTOM_DOWN">Розмитнення</SelectItem>
                      <SelectItem value="BORDER">Кордон</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2 flex items-end pb-1">
            {["LOAD_FROM", "LOAD_TO"].includes(pointType) ? (
              <FormField
                control={control}
                name={`tender_route.${index}.customs`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 h-12 w-full">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="scale-75"
                    />
                    <span className="text-[10px] font-bold uppercase text-slate-500">
                      Митн.
                    </span>
                  </FormItem>
                )}
              />
            ) : (
              <div className="h-12" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const X = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// ==========================================
// MAIN FORM COMPONENT
// ==========================================
export default function TenderSaveForm({
  defaultValues,
  isEdit,
}: {
  defaultValues?: Partial<TenderFormValues>;
  isEdit?: boolean;
}) {
  const { mutateAsync: saveTender, isPending } = useSaveTender();
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
  const [files, setFiles] = useState<(File | any)[]>([]); // Combines existing and new files
  const STORAGE_KEY = "tender_log_form_draft";
  const [isLoadedDraft, setIsLoadedDraft] = useState(false);

  const form = useForm<TenderFormValues>({
    resolver: zodResolver(tenderFormSchema),
    defaultValues: {
      cargo: "",
      notes: "",
      id_owner_company: null,
      car_count: 1,
      ids_type: "AUCTION",
      ids_carrier_rating: "MAIN",

      without_vat: true,
      tender_route: [
        { address: "", ids_point: "LOAD_FROM", order_num: 1, customs: false },
        { address: "", ids_point: "LOAD_TO", order_num: 2, customs: false },
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
    formState: { isSubmitting },
    reset,
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
          if (values.time_end) values.time_end = new Date(values.time_end);
          if (values.date_load) values.date_load = new Date(values.date_load);
          if (values.date_load2)
            values.date_load2 = new Date(values.date_load2);
          if (values.date_unload)
            values.date_unload = new Date(values.date_unload);

          Object.keys(values).forEach((key: any) => {
            setValue(key, values[key]);
          });
          if (savedLabel) setCompanyLabel(savedLabel);
          setIsLoadedDraft(true);
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
    move: moveRoute,
  } = useFieldArray({ control, name: "tender_route" });

  const typeValue = watch("ids_type");
  const tenderTrailer = watch("tender_trailer");
  const isOnlyRef =
    tenderTrailer?.length === 1 && tenderTrailer[0].ids_trailer_type === "REF";

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

  // --- INITIALIZE FORM & FILES ---
  useEffect(() => {
    if (defaultValues) {
      const sortedRoutes = defaultValues.tender_route
        ? [...defaultValues.tender_route].sort(
            (a, b) => (a.order_num || 0) - (b.order_num || 0),
          )
        : [
            {
              address: "",
              ids_point: "LOAD_FROM",
              order_num: 1,
              customs: false,
            },
          ];

      // Universally set files if they exist in the incoming data
      if ((defaultValues as any).files) {
        setFiles((defaultValues as any).files);
      }

      reset({
        ...defaultValues,
        tender_route: sortedRoutes as any,
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
      } as TenderFormValues);
      if (defaultValues.company_name)
        setCompanyLabel(defaultValues.company_name);
    }
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!isOnlyRef) {
      setValue("ref_temperature_from", null);
      setValue("ref_temperature_to", null);
    }
  }, [isOnlyRef, setValue]);

  useEffect(() => {
    if (typeValue === "AUCTION") {
      setValue("price_step", undefined);
      setValue("price_redemption", undefined);
      clearErrors(["price_step", "price_redemption"]);
    }
  }, [typeValue, setValue, clearErrors]);

  const onSubmit: SubmitHandler<TenderFormValues> = async (values) => {
    const payload = {
      ...values,
      tender_permission:
        values.tender_permission?.filter((p) => p && p.ids_permission_type) ||
        [],
      tender_trailer:
        values.tender_trailer?.filter((t) => t && t.ids_trailer_type) || [],
      tender_load:
        values.tender_load?.filter((l) => l && l.ids_load_type) || [],
      tender_route: values.tender_route.map((route, idx) => ({
        ...route,
        order_num: idx + 1,
      })),
    };
    if (defaultValues?.id) payload.id = defaultValues.id;

    // Separate existing files (have ID) and new files (File objects)
    const current_file_ids = files.filter((f) => f.id).map((f) => f.id);

    // Sometimes files are just regular objects with metadata if they come from certain sources
    // or if they are already wrapped. Let's make the check more robust.
    const newFiles = files.filter(
      (f) => f instanceof File || (f.size && f.name && !f.id),
    );

    // Create FormData
    const formData = new FormData();

    // We send the JSON data as a string in the 'dto' field
    // This matches what we did for the other form and what the server expect
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

    try {
      await saveTender(formData);
      localStorage.removeItem(STORAGE_KEY);
      if (!isNextTender) {
        router.back();
      } else {
        setFiles([]);
        reset();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = routeFields.findIndex((item) => item.id === active.id);
      const newIndex = routeFields.findIndex((item) => item.id === over.id);
      moveRoute(oldIndex, newIndex);
    }
  };

  const currencyWatch = watch("ids_valut");
  const currencySign = currencyStringTransform(currencyWatch ?? "UAH");

  return (
    <div className="gap-2 w-full overflow-x-hidden pb-40 scrollbar-thin">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full scrollbar-thin"
        >
          <fieldset
            disabled={isSubmitting || isPending}
            className="flex flex-col gap-2 min-w-0 w-full p-0 m-0 border-none scrollbar-thin"
          >
            {/* 📋 SECTION 1: ОСНОВНІ НАЛАШТУВАННЯ */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={control}
                  name="ids_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                        Тип тендеру
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-slate-50 dark:bg-white/5 h-12 rounded-2xl border-none shadow-inner mt-1.5 px-6">
                          <SelectValue placeholder="Оберіть тип" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
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
                      <FormLabel className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                        Рейтинг доступу
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-slate-50 dark:bg-white/5 h-12 rounded-2xl border-none shadow-inner mt-1.5 px-6">
                          <SelectValue placeholder="Оберіть рейтинг" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
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

              <div className="space-y-4">
                <InputAsyncSelectCompany
                  name="id_owner_company"
                  control={control}
                  label="КОМПАНІЯ ЗАМОВНИК"
                  initialLabel={companyLabel}
                  onEntityChange={(c) => setCompanyLabel(c?.name || "")}
                />
              </div>

              {/* TIMING BOX */}
              <div className="bg-[#f8fafc] dark:bg-white/5 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Torgi */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-3 text-[11px] font-black uppercase text-indigo-600 tracking-widest leading-none">
                    <Calendar size={14} /> Час проведення тендеру
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputDateWithTime
                      name="time_start"
                      control={control}
                      label="ПОЧАТОК"
                    />
                    <InputDateWithTime
                      name="time_end"
                      control={control}
                      label="КІНЕЦЬ"
                    />
                  </div>
                </div>
                {/* Logistika */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-3 text-[11px] font-black uppercase text-emerald-600 tracking-widest leading-none">
                    <Truck size={14} /> ЛОГІСТИКА
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputDateWithTime
                      name="date_load"
                      control={control}
                      label="ЗАВАНТАЖЕННЯ ПЛАН"
                    />
                    <InputDateWithTime
                      name="date_unload"
                      control={control}
                      label="РОЗВАНТАЖЕННЯ ПЛАН"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 📍 SECTION 2: МАРШРУТ ПЕРЕВЕЗЕННЯ */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600">
                  <MapPin size={24} />
                </div>
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-800 dark:text-white">
                  Маршрут перевезення
                </h2>
              </div>

              <div className="space-y-2">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={routeFields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {routeFields.map((field, idx) => (
                      <SortableRouteItem
                        key={field.id}
                        id={field.id}
                        index={idx}
                        control={control}
                        watch={watch}
                        setValue={setValue}
                        clearErrors={clearErrors}
                        removeRoute={removeRoute}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>

              <div className="flex justify-between items-center border-b border-slate-50 dark:border-white/5 pb-6">
                <div className="flex items-center gap-4"></div>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl h-12 px-6 text-[11px] uppercase font-black border-orange-100 text-orange-600 hover:bg-orange-50 transition-all gap-2"
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
            </div>

            {/* 📦 SECTION 3: ДЕТАЛІ ВАНТАЖУ */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-50 dark:border-white/5 pb-4">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600">
                  <Boxes size={24} />
                </div>
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-800 dark:text-white">
                  Деталі вантажу
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  <InputText
                    name="cargo"
                    control={control}
                    label="Вантаж"
                    icon={Box}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputMultiSelect
                      name="tender_trailer"
                      control={control}
                      label="Тип транспорту"
                      options={truckList}
                      required
                    />
                    <InputMultiSelect
                      name="tender_load"
                      control={control}
                      label="Тип завантаження"
                      options={loadList}
                      valueKey="ids_load_type"
                      required
                    />
                  </div>

                  <div className="space-y-6">
                    <InputMultiSelect
                      name="tender_permission"
                      control={control}
                      label="Транспортні документи"
                      options={tenderPermission}
                      valueKey="ids_permission_type"
                    />
                    <InputTextarea
                      name="notes"
                      control={control}
                      label="ДОДАТКОВІ ІНСТРУКЦІЇ ВОДІЮ"
                      icon={Notebook}
                    />
                  </div>

                  {isOnlyRef && (
                    <div className="flex items-center gap-6 p-4 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-600">
                        <ThermometerSnowflake size={20} />
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <InputNumber
                          control={control}
                          name="ref_temperature_from"
                          label="ТЕМП. ВІД (°C)"
                          placeholder="-18"
                          minus={true}
                        />
                        <InputNumber
                          control={control}
                          name="ref_temperature_to"
                          label="ТЕМП. ДО (°C)"
                          placeholder="+5"
                          minus={true}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 py-4 border-t border-slate-50 dark:border-white/5">
                    <InputSwitch
                      control={control}
                      name="without_vat"
                      label="Тариф без ПДВ"
                    />
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div className="bg-[#f8fafc] dark:bg-white/5 rounded-2xl p-6 space-y-5 border border-slate-100 dark:border-white/5">
                    <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
                      ГАБАРИТИ ТА ОБ'ЄМИ
                    </h3>
                    <div className="space-y-4">
                      <InputNumber
                        control={control}
                        name="car_count"
                        label="КІЛЬКІСТЬ АВТО"
                        icon={Car}
                      />
                      <InputNumber
                        control={control}
                        name="weight"
                        label="ВАГА (Т)"
                        icon={Weight}
                      />
                      <InputNumber
                        control={control}
                        name="volume"
                        label="ОБ'ЄМ (М³)"
                        icon={Box}
                      />
                      <InputNumber
                        control={control}
                        name="palet_count"
                        label="К-СТЬ ПАЛЕТ"
                        icon={Boxes}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 💰 SECTION 4: ФІНАНСИ (Conditional) */}
            {(typeValue === "REDUCTION" ||
              typeValue === "REDUCTION_WITH_REDEMPTION") && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 p-6 md:p-8 space-y-6 border-l-4 border-l-rose-500">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-600">
                    <DollarSign size={24} />
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-widest text-slate-800 dark:text-white">
                    Бюджет тендеру
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                  <div className="md:col-span-2">
                    <InputFinance
                      name="price_start"
                      control={control}
                      label="Ліміт бюджету"
                      currency={currencySign}
                    />
                  </div>
                  <SelectFinance
                    name="ids_valut"
                    control={control}
                    label="Валюта"
                    options={valut.slice(0, 4)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputFinance
                    name="price_step"
                    control={control}
                    label="Крок пониження"
                    currency={currencySign}
                  />
                  {typeValue === "REDUCTION_WITH_REDEMPTION" && (
                    <InputFinance
                      name="price_redemption"
                      control={control}
                      label="Ціна викупу"
                      currency={currencySign}
                      required
                    />
                  )}
                </div>
              </div>
            )}

            {/* 📎 SECTION 5: ДОКУМЕНТИ */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-50 dark:border-white/5 pb-4">
                <div className="w-12 h-12 bg-teal-50 dark:bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-600">
                  <Plus size={24} />
                </div>
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-800 dark:text-white">
                  Документи
                </h2>
              </div>
              <UniqueFileUploader
                files={files}
                onChange={setFiles}
                maxFiles={10}
                description="Завантажте специфікації або фото"
              />
            </div>

            {/* 🏁 ACTION BAR */}
            <footer className="sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-6 py-4 z-[40] shadow-[0_-10px_50px_rgba(0,0,0,0.05)] mt-auto w-full">
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 px-6 py-4 rounded-3xl border border-slate-100 dark:border-white/5 w-full md:w-auto">
                  <InputSwitch
                    id="is_next"
                    checked={isNextTender}
                    onCheckedChange={setIsNextTender}
                    label="створити наступний після збереження"
                  />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => reset()}
                    className="flex-1 md:flex-none uppercase font-black text-slate-400 h-14 px-10 tracking-widest hover:text-rose-500 hover:bg-rose-50 border border-transparent rounded-2xl transition-all"
                  >
                    Скинути
                  </Button>
                  <AppButton
                    type="submit"
                    disabled={isSubmitting || isPending}
                    className="flex-[2] md:min-w-[280px] h-14 bg-[#0fb48c] hover:bg-[#0da07b] text-white shadow-xl shadow-[#0fb48c]/20 rounded-2xl text-sm uppercase font-black tracking-widest transition-all"
                  >
                    {isSubmitting || isPending ? (
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 animate-spin" />
                        <span>ОБРОБКА...</span>
                      </div>
                    ) : (
                      <span>ЗБЕРЕГТИ ЗМІНИ</span>
                    )}
                  </AppButton>
                </div>
              </div>
            </footer>
          </fieldset>
        </form>
      </Form>

      <style jsx global>{`
        html,
        body {
          overflow: hidden !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
        }
      `}</style>
    </div>
  );
}
