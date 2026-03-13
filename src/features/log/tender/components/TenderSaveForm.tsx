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
const tenderPermissionSchema = z.object({ ids_permission_type: z.string() });

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
    ids_type: z.enum(["AUCTION", "REDUCTION", "REDUCTION_WITH_REDEMPTION"]),
    ids_carrier_rating: z.enum(["MAIN", "MEDIUM", "IMPORTANT"]),
    request_price: z.boolean(),
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
    ...(isDragging ? { zIndex: 50, position: 'relative' as const } : {}),
  };

  const pointType = watch(`tender_route.${index}.ids_point`);
  const isBorderOrCustoms =
    ["CUSTOM_UP", "CUSTOM_DOWN", "BORDER"].includes(pointType);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl border transition-all relative group",
        isDragging
          ? "bg-indigo-50/50 border-indigo-200 ring-2 ring-indigo-500 shadow-2xl scale-[1.02] z-50"
          : "bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 hover:border-indigo-100 shadow-sm"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="hidden sm:flex items-center justify-center px-1 text-slate-300 hover:text-indigo-500 cursor-grab active:cursor-grabbing border-r border-slate-50 transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
        <div className="sm:col-span-7">
          <FormField
            control={control}
            name={`tender_route.${index}.address`}
            render={({ field: f }) => (
              <FormItem>
                <FormLabel className="text-[9px] font-black uppercase text-slate-400 tracking-tighter flex justify-between">
                  <span>Точка #{index + 1}</span>
                  {isDragging && <Zap className="w-3 h-3 text-indigo-500 animate-pulse" />}
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
                      setValue(`tender_route.${index}.country`, location.countryCode || "");
                      setValue(`tender_route.${index}.city`, location.city || "");
                      clearErrors(`tender_route.${index}.address`);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="sm:col-span-5 flex gap-2 items-end">
          <div className="flex-1">
            <FormField
              control={control}
              name={`tender_route.${index}.ids_point`}
              render={({ field: f }) => (
                <FormItem>
                  <Select value={f.value} onValueChange={f.onChange}>
                    <SelectTrigger className={cn("h-9 rounded-xl text-xs", isBorderOrCustoms && "bg-amber-50 border-amber-200 text-amber-700")}>
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

          {["LOAD_FROM", "LOAD_TO"].includes(pointType) && (
            <FormField
              control={control}
              name={`tender_route.${index}.customs`}
              render={({ field }) => (
                <FormItem className="flex items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 h-9 px-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-75" />
                    <span className="text-[8px] font-bold uppercase text-slate-500">Митн.</span>
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>
      </div>

      {index > 0 && (
        <button
          type="button"
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          onClick={() => removeRoute(index)}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

  const [truckList, setTruckList] = useState<{ label: string; value: string }[]>([]);
  const [loadList, setLoadList] = useState<{ label: string; value: string }[]>([]);
  const [tenderPermission, setTenderPermission] = useState<{ label: string; value: string }[]>([]);
  const [tenderType, setTenderType] = useState<{ label: string; value: string }[]>([]);
  const [valut, setValut] = useState<{ label: string; value: string }[]>([]);
  const [rating, setRating] = useState<{ label: string; value: string }[]>([]);

  const [companyLabel, setCompanyLabel] = useState<string>("");
  const [isNextTender, setIsNextTender] = useState(false);

  const form = useForm<TenderFormValues>({
    resolver: zodResolver(tenderFormSchema),
    defaultValues: {
      cargo: "",
      notes: "",
      id_owner_company: null,
      car_count: 1,
      ids_type: "AUCTION",
      ids_carrier_rating: "MAIN",
      request_price: false,
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

  const {
    fields: routeFields,
    append: appendRoute,
    remove: removeRoute,
    move: moveRoute,
  } = useFieldArray({ control, name: "tender_route" });

  const typeValue = watch("ids_type");
  const tenderTrailer = watch("tender_trailer");
  const isOnlyRef = tenderTrailer?.length === 1 && tenderTrailer[0].ids_trailer_type === "REF";

  useEffect(() => {
    const getTruckList = async () => {
      try {
        const { data } = await api.get("/tender/form-data/getCreateTenderFormData");
        setTruckList(data.content.trailer_type_dropdown.map((t: any) => ({ value: t.ids, label: t.value })));
        setLoadList(data.content.load_type_dropdown.map((t: any) => ({ value: t.ids, label: t.value })));
        setTenderType(data.content.tender_type_dropdown.map((t: any) => ({ value: t.ids, label: t.value })));
        setTenderPermission(data.content.load_permission_dropdown.map((t: any) => ({ value: t.ids, label: t.value })));
        setValut(data.content.valut_dropdown.map((t: any) => ({ value: t.ids, label: t.ids })));
        setRating(data.content.rating_dropdown.map((t: any) => ({ value: t.ids, label: t.value })));
      } catch (err) {
        console.error(err);
      }
    };
    getTruckList();
  }, []);

  useEffect(() => {
    if (defaultValues) {
      const sortedRoutes = defaultValues.tender_route
        ? [...defaultValues.tender_route].sort((a, b) => (a.order_num || 0) - (b.order_num || 0))
        : [{ address: "", ids_point: "LOAD_FROM", order_num: 1, customs: false }];

      reset({
        ...defaultValues,
        tender_route: sortedRoutes as any,
        time_start: defaultValues.time_start ? new Date(defaultValues.time_start) : new Date(),
        time_end: defaultValues.time_end ? new Date(defaultValues.time_end) : null,
        date_load: defaultValues.date_load ? new Date(defaultValues.date_load) : null,
        date_load2: defaultValues.date_load2 ? new Date(defaultValues.date_load2) : null,
        date_unload: defaultValues.date_unload ? new Date(defaultValues.date_unload) : null,
      } as TenderFormValues);
      if (defaultValues.company_name) setCompanyLabel(defaultValues.company_name);
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
      tender_route: values.tender_route.map((route, idx) => ({ ...route, order_num: idx + 1 })),
    };
    if (defaultValues?.id) payload.id = defaultValues.id;
    try {
      await saveTender(payload);
      if (!isNextTender) router.back();
    } catch (error) {
      console.error(error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans min-h-screen">
      {/* 🚀 PREMIUM TOP NAV */}
      <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 px-6 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-5">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <LayoutDashboard size={22} className="animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-white uppercase">
              {isEdit ? "Редагування" : "Публікація"} <span className="text-indigo-600">Тендеру</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl px-4 transition-all"
          >
            Закрити
          </Button>
        </div>
      </header>

      {/* 🛠 MAIN DASHBOARD LAYOUT */}
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 min-h-0 flex flex-col">
          <fieldset disabled={isSubmitting || isPending} className="flex-1 min-h-0 flex flex-col">
            <main className="flex-1 overflow-y-auto lg:overflow-y-visible p-4 lg:p-6 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1920px] mx-auto">

                {/* 📦 LEFT PANEL: CARGO & DIMS */}
                <aside className="lg:col-span-3 space-y-6">
                  {/* Basic Params */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-5 transition-transform hover:scale-[1.01] relative z-[40]">
                    <h2 className="flex items-center gap-3 text-indigo-600">
                      <Zap size={18} />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">Базові дані</span>
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <FormField
                          control={control}
                          name="ids_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black text-slate-400 uppercase">Тип торгів</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="bg-slate-50/50 h-10 rounded-2xl border-none shadow-inner"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 z-[110]">
                                  {tenderType.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="ids_carrier_rating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black text-slate-400 uppercase">Рейтинг перевізника</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="bg-slate-50/50 h-10 rounded-2xl border-none shadow-inner"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 z-[110]">
                                  {rating.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                      <InputAsyncSelectCompany
                        name="id_owner_company"
                        control={control}
                        label="Компанія Замовник"
                        initialLabel={companyLabel}
                        onEntityChange={c => setCompanyLabel(c?.name || "")}
                      />
                      <InputText name="cargo" control={control} label="Найменування Вантажу" icon={Box} />
                    </div>
                  </div>

                  {/* Dimensions Grid */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-5 relative z-[30]">
                    <h2 className="flex items-center gap-3 text-slate-400">
                      <Boxes size={18} />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">Специфікація</span>
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <InputNumber control={control} name="car_count" label="Авто" icon={Car} />
                      <InputNumber control={control} name="weight" label="Вага (т)" icon={Weight} />
                      <InputNumber control={control} name="volume" label="Об'єм (м³)" icon={Box} />
                      <InputNumber control={control} name="palet_count" label="Палет" icon={Boxes} />
                    </div>
                  </div>

                  {/* Transport */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4 relative z-[20]">
                    <InputMultiSelect name="tender_trailer" control={control} label="Транспорт" options={truckList} required />
                    <InputMultiSelect name="tender_load" control={control} label="Завантаження" options={loadList} valueKey="ids_load_type" required />
                  </div>
                </aside>

                {/* 📍 MIDDLE PANEL: SMART ROUTE */}
                <section className="lg:col-span-5">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                      <div className="space-y-1">
                        <h2 className="flex items-center gap-3 text-orange-600 font-black text-xs uppercase tracking-widest">
                          <MapPin size={18} /> Маршрут
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Впорядкуйте точки маршруту</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-2xl h-10 px-4 text-[10px] uppercase font-black text-orange-600 hover:bg-orange-50 border border-orange-100 shadow-sm"
                        onClick={() => appendRoute({ address: "", ids_point: "LOAD_TO", order_num: routeFields.length + 1, customs: false, city: "" })}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Додати Пункт
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={routeFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                          {routeFields.map((field, idx) => (
                            <SortableRouteItem key={field.id} id={field.id} index={idx} control={control} watch={watch} setValue={setValue} clearErrors={clearErrors} removeRoute={removeRoute} />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>

                    {/* Route Summary */}
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 flex items-center justify-between">
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase">Всього пунктів</span>
                          <span className="text-xl font-black text-slate-700 dark:text-white uppercase">{routeFields.length}</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <Info size={20} />
                      </div>
                    </div>
                  </div>
                </section>

                {/* 💰 RIGHT PANEL: TIMING & FINANCE */}
                <aside className="lg:col-span-4 space-y-6">
                  {/* Timing Matrix */}
                  <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 space-y-8 relative z-[30]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

                    <h2 className="flex items-center gap-3 text-indigo-600 relative z-10">
                      <Clock size={18} />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">Матриця часу</span>
                    </h2>

                    <div className="space-y-6 relative z-10">
                      {/* Auction Dates */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-[2px] w-6 bg-indigo-500" />
                          <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest leading-none">Вікно торгів</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InputDateWithTime name="time_start" control={control} label="Дата початку торгів" />
                          <InputDateWithTime name="time_end" control={control} label="Дата завершення торгів" />
                        </div>
                      </div>

                      {/* Logistic Dates */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-[2px] w-6 bg-emerald-500" />
                          <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest leading-none">Планування логістики</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InputDateWithTime name="date_load" control={control} label="Завантаження З" />
                          <InputDateWithTime name="date_load2" control={control} label="Завантаження ПО" />
                        </div>
                        <InputDateWithTime name="date_unload" control={control} label="Цільове розвантаження" />
                      </div>
                    </div>
                  </div>

                  {/* Financial Block */}
                  {(typeValue === "REDUCTION" || typeValue === "REDUCTION_WITH_REDEMPTION") && (
                    <div className="p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] text-white shadow-2xl shadow-rose-500/20 space-y-6 border border-rose-400 transition-all hover:translate-y-[-4px] relative z-[20]">
                      <h2 className="flex items-center gap-3 text-black uppercase dark:text-white ">
                        <DollarSign size={20} className="rounded-full p-0.5" />
                        <span className="text-xs uppercase tracking-[0.2em]">Бюджет тендеру</span>
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2 grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <InputFinance name="price_start" control={control} label="Ліміт бюджету" currency={currencySign} />
                          </div>
                          <SelectFinance name="ids_valut" control={control} label="Валюта" options={valut.slice(0, 4)} />
                        </div>
                        <InputFinance name="price_step" control={control} label="Крок пониження" currency={currencySign} />
                        {typeValue === "REDUCTION_WITH_REDEMPTION" && (
                          <InputFinance name="price_redemption" control={control} label="Ціна викупу" currency={currencySign} required />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Extras */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl space-y-5 relative z-[10]">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center px-4 py-3 bg-slate-50 dark:bg-white/5 rounded-3xl">
                      <InputSwitch control={control} name="without_vat" label="Без ПДВ" />
                      <div className="hidden sm:block w-[1px] h-6 bg-slate-200 dark:bg-white/10" />

                    </div>
                    <InputTextarea name="notes" control={control} label="Примітки та коментарі для водія" icon={Notebook} />
                  </div>
                </aside>

              </div>
            </main>

            {/* 🏁 ACTION BAR */}
            <footer className="shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-4 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-[120] shadow-[0_-10px_50px_rgba(0,0,0,0.03)]">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <div className="flex items-center justify-center gap-3 px-6 py-3 bg-indigo-50 dark:bg-white/5 rounded-2xl sm:rounded-3xl border border-indigo-100 dark:border-white/5 w-full sm:w-auto">
                  <InputSwitch
                    id="is_next"
                    checked={isNextTender}
                    onCheckedChange={setIsNextTender}
                    label="Створити наступний"
                  />
                </div>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => reset()}
                  className="flex-1 sm:flex-none text-[10px] uppercase font-black text-slate-400 h-12 lg:h-14 px-4 lg:px-8 tracking-[0.2em] hover:text-red-500"
                >
                  Очистити
                </Button>
                <AppButton
                  type="submit"
                  disabled={isSubmitting || isPending}
                  className="flex-[2] sm:min-w-[200px] lg:min-w-[280px] h-12 lg:h-14 shadow-2xl shadow-indigo-500/40 rounded-xl lg:rounded-[1.2rem] text-[10px] lg:text-sm uppercase font-black tracking-[0.15em] flex items-center justify-center gap-2"
                >
                  {isSubmitting || isPending ? (
                    <>
                      <Zap className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                      <span>Обробка...</span>
                    </>
                  ) : (
                    <>
                      <span>{isEdit ? "Зберегти" : "Запустити"}</span>
                      <ChevronRight size={16} />
                    </>
                  )}
                </AppButton>
              </div>
            </footer>
          </fieldset>
        </form>
      </Form>

      <style jsx global>{`
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
