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
  FileText,
  GripVertical,
  MapPin,
  Minus,
  Notebook,
  Plus,
  Truck,
  Weight,
  ThermometerSnowflake,
  ShieldCheck,
} from "lucide-react";

// --- COMPONENTS ---
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
console.log();

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
    ...(isDragging ? { zIndex: 50 } : {}), // Встановлюємо z-index ТІЛЬКИ при перетягуванні
  };

  const pointType = watch(`tender_route.${index}.ids_point`);
  const isBorderOrCustoms =
    pointType === "CUSTOM_UP" ||
    pointType === "CUSTOM_DOWN" ||
    pointType === "BORDER";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col sm:flex-row items-stretch gap-3 p-3 rounded-xl border border-slate-200 transition-all relative group",
        isDragging &&
        "opacity-90 ring-2 ring-blue-500 shadow-xl scale-[1.01] border-blue-200",
        !isDragging && "shadow-sm hover:border-slate-300 hover:shadow-md",
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="hidden sm:flex items-center justify-center px-1 text-slate-300 hover:text-blue-500 cursor-grab active:cursor-grabbing border-r border-slate-100 transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Main Inputs */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-7">
          <FormField
            control={control}
            name={`tender_route.${index}.address`}
            render={({ field: f }) => (
              <FormItem>
                <FormLabel className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center justify-between">
                  <span>Точка #{index + 1}</span>
                  <span
                    className="sm:hidden text-slate-300 cursor-grab"
                    {...attributes}
                    {...listeners}
                  >
                    <GripVertical className="w-4 h-4" />
                  </span>
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

        <div className="sm:col-span-5 flex gap-2 items-end">
          <div className="flex-1">
            <FormField
              control={control}
              name={`tender_route.${index}.ids_point`}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    Тип
                  </FormLabel>
                  <Select value={f.value} onValueChange={f.onChange}>
                    <SelectTrigger
                      className={cn(
                        "h-10",
                        isBorderOrCustoms &&
                        "bg-amber-50/50 border-amber-200 text-amber-700",
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

          {["LOAD_FROM", "LOAD_TO"].includes(pointType) && (
            <FormField
              control={control}
              name={`tender_route.${index}.customs`}
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-center  rounded-md border h-10 px-3 shrink-0 mb-[2px]">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="scale-75"
                    />
                    <FormLabel className="text-[10px] font-bold uppercase cursor-pointer m-0">
                      Митн.
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>
      </div>

      {/* Delete Button */}
      {index > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute -top-3 -right-3 sm:static sm:top-auto sm:right-auto sm:mt-6 h-8 w-8 rounded-full bg-white border shadow-sm text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
          onClick={() => removeRoute(index)}
        >
          <Minus className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

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

  // Lookups
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
  const isOnlyRef =
    tenderTrailer?.length === 1 && tenderTrailer[0].ids_trailer_type === "REF";

  // --- API INITIALIZATION ---
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

  // --- DEFAULT VALUES PROCESSING ---
  useEffect(() => {
    if (defaultValues) {
      // SENIOR FIX: Примусово сортуємо маршрути по order_num при ініціалізації
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

  // --- SIDE EFFECTS ---
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

  // --- SUBMIT ---
  const onSubmit: SubmitHandler<TenderFormValues> = async (values) => {
    // SENIOR FIX: Перепризначаємо order_num перед відправкою на сервер згідно з індексами масиву
    const payload = {
      ...values,
      tender_route: values.tender_route.map((route, idx) => ({
        ...route,
        order_num: idx + 1,
      })),
    };
    if (defaultValues?.id) payload.id = defaultValues.id;

    try {
      await saveTender(payload);
      if (!isNextTender) router.back();
    } catch (error) {
      console.error(error);
    }
  };

  // --- DND SENSORS ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 }, // SENIOR FIX: дозволяє клікати в інпути без початку DND
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = routeFields.findIndex((item) => item.id === active.id);
      const newIndex = routeFields.findIndex((item) => item.id === over.id);
      moveRoute(oldIndex, newIndex); // React Hook Form магія: міняє місцями без втрати фокусу
    }
  };

  const currencyWatch = watch('ids_valut')
  const currencySign = currencyStringTransform(currencyWatch ?? 'UAH')
  return (
    <Card className="max-w-5xl mx-auto shadow-2xl border-0 overflow-hidden bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-sky-600 p-6 md:p-8 text-white">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
          {isEdit ? "Редагування тендеру" : "Новий тендер"}
        </h2>
      </div>

      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-4 md:p-8 space-y-10"
        >
          <fieldset disabled={isSubmitting || isPending} className="space-y-10">
            {/* --- SECTION: BASIC INFO --- */}
            <section className="space-y-6">
              <h3 className="font-bold flex items-center gap-2  text-lg border-b pb-2">
                <Box className="w-5 h-5 text-blue-600" /> Основні налаштування
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <SelectTrigger className="bg-slate-50/50">
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-slate-50/50">
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
                <div className="md:col-span-3">
                  <InputAsyncSelectCompany
                    name="id_owner_company"
                    control={control}
                    label="Компанія замовник"
                    initialLabel={companyLabel}
                    onEntityChange={(c) => setCompanyLabel(c?.name || "")}
                  />
                </div>
              </div>
            </section>

            {/* --- SECTION: DATES --- */}
            <section className="grid lg:grid-cols-1 gap-8  p-6 rounded-2xl border border-slate-100">
              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-blue-700 text-sm uppercase tracking-widest">
                  <Calendar className="w-4 h-4" /> Час проведення тендеру
                </h3>
                <div className="grid grid-cols-1 gap-4">
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
              </div>
              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-emerald-700 text-sm uppercase tracking-widest">
                  <Truck className="w-4 h-4" /> Час логістики
                  (Завантаження/Розвантаження)
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <InputDateWithTime
                    name="date_load"
                    control={control}
                    label="Завантаження планове"
                  />
                  <InputDateWithTime
                    name="date_unload"
                    control={control}
                    label="Розвантаження планове"
                  />
                </div>
              </div>
            </section>

            {/* --- SECTION: ROUTE (DND) --- */}
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold flex items-center gap-2 text-slate-800 text-lg">
                  <MapPin className="w-5 h-5 text-orange-500" /> Маршрут
                  перевезення
                </h3>
              </div>

              <div className=" p-2 md:p-4 rounded-2xl border border-slate-100 flex flex-col gap-3">
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
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 font-semibold"
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
            </section>

            {/* --- SECTION: CARGO DETAILS --- */}
            <section className="space-y-6">
              <h3 className="font-bold flex items-center gap-2 text-slate-800 text-lg border-b pb-2">
                <Boxes className="w-5 h-5 text-indigo-500" /> Деталі вантажу /
                Додаткова інформація
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Col: Names & Types */}
                <div className="md:col-span-8 space-y-4">
                  <InputText
                    icon={Box}
                    name="cargo"
                    control={control}
                    label="Вантаж"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  {isOnlyRef && (
                    <div className="grid grid-cols-2 gap-4 bg-sky-50 p-4 rounded-xl border border-sky-100">
                      <div className="col-span-2 font-bold text-sky-800 flex items-center gap-2 text-sm">
                        <ThermometerSnowflake className="w-4 h-4" />{" "}
                        Температурний режим
                      </div>
                      <InputNumber
                        name="ref_temperature_from"
                        control={control}
                        label="Від (°C)"
                        required
                        minus
                      />
                      <InputNumber
                        name="ref_temperature_to"
                        control={control}
                        label="До (°C)"
                        required
                        minus
                      />
                    </div>
                  )}
                  <InputMultiSelect
                    name="tender_permission"
                    control={control}
                    label="Дозволи та сертифікати"
                    icon={ShieldCheck}
                    options={tenderPermission}
                    valueKey="ids_permission_type"
                  />
                  <InputTextarea
                    icon={Notebook}
                    name="notes"
                    control={control}
                    label="Додаткові інструкції водію"
                  />
                </div>

                {/* Right Col: Dimensions */}
                <div className="md:col-span-4  p-5 rounded-2xl border border-slate-100 space-y-5">
                  <h4 className="font-bold text-slate-600 text-xs uppercase tracking-widest mb-2">
                    Габарити та об'єми
                  </h4>
                  <InputNumber
                    control={control}
                    name="car_count"
                    label="Кількість авто"
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
                    label="К-сть палет"
                    icon={Boxes}
                  />
                </div>
              </div>
            </section>

            {/* --- SECTION: FINANCES --- */}
            {(typeValue === "REDUCTION" ||
              typeValue === "REDUCTION_WITH_REDEMPTION") && (
                <section className="p-6 bg-gradient-to-br from-red-50 to-rose-50/50 rounded-2xl border border-red-100">
                  <h3 className="font-black flex items-center gap-2 text-red-700 text-lg mb-6">
                    <DollarSign className="w-5 h-5 bg-red-100 rounded-full p-0.5" />{" "}
                    Бюджет тендеру
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <InputFinance
                      name="price_start"
                      control={control}
                      label="Стартова ціна"
                      currency={currencySign}
                    />
                    <SelectFinance

                      name="ids_valut"
                      control={control}
                      label="Валюта"
                      options={valut.slice(0, 4)}

                    />
                    <InputFinance
                      currency={currencySign}
                      name="price_step"
                      control={control}
                      label="Крок ставки"
                    />
                    {typeValue === "REDUCTION_WITH_REDEMPTION" && (
                      <InputFinance
                        currency={currencySign}
                        name="price_redemption"
                        control={control}
                        label="Ціна викупу (Бліц)"
                        required
                      />
                    )}
                  </div>
                </section>
              )}

            <div className="flex items-center gap-4 py-4 px-2 border-t">
              <InputSwitch
                control={control}
                name="without_vat"
                label="Тариф без ПДВ"
              />
            </div>

            {/* --- FOOTER ACTIONS --- */}
            <div className="sticky bottom-0  backdrop-blur-md p-4 -mx-4 md:-mx-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3  px-4 py-2.5 rounded-xl border border-slate-200">
                <InputSwitch
                  id="is_next"
                  checked={isNextTender}
                  onCheckedChange={setIsNextTender}
                  label="Створити наступний після збереження"
                />
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  className="flex-1 sm:flex-none h-12 font-bold text-slate-600"
                >
                  Скинути
                </Button>
                <AppButton
                  type="submit"
                  disabled={isSubmitting || isPending}
                  className="flex-1 sm:min-w-[220px] h-12 text-sm uppercase tracking-wider font-black shadow-lg shadow-blue-500/30"
                >
                  {isSubmitting || isPending
                    ? "Обробка..."
                    : isEdit
                      ? "Зберегти зміни"
                      : "Опублікувати тендер"}
                </AppButton>
              </div>
            </div>
          </fieldset>
        </form>
      </Form>
    </Card>
  );
}
