"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

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
  Sparkles,
  UploadCloud,
  BrainCircuit,
  ClipboardList,
  Search,
  ChevronDown,
  ChevronUp,
  Mic,
  Square,
  Play,
  Pause,
  Volume2,
  Trash2,
  Check,
  X as LucideX,
  Pin,
  Save,
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
  Input,
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
  ids_country: z
    .string({ message: "Оберіть зі списку для визначення країни" })
    .min(1, "Оберіть зі списку для визначення країни"),
  city: z.string().optional(),
  order_num: z.number(),
  customs: z.boolean().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  ids_region: z.string().optional().nullable(),
  post_code: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  house: z.string().optional().nullable(),
});

const trailerSchema = z.object({ ids_trailer_type: z.string() });
const loadSchema = z.object({ ids_load_type: z.string() });
const tenderPermissionSchema = z.object({
  ids_permission_type: z.string().optional(),
});

const tenderFormSchema = z
  .object({
    id: z.number().optional(),
    cargo: z
      .string()
      .min(1, "Вантаж обов'язковий")
      .max(25, "Максимум 25 символів"),
    notes: z.string().optional(),
    id_owner_company: z.number().nullable(),
    car_count: z.number().min(1, "Мінімум 1 авто"),
    price_start: z.number().optional(),
    price_step: z.number({ message: "Вкажіть крок ставки" }).optional(),
    price_redemption: z.number().optional(),
    price_client: z.number().optional().nullable(),
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
    palet_count: z
      .number({ message: "Вкажіть кількість палет" })
      .optional()
      .nullable(),
    ids_valut: z
      .string({ message: "Валюта обов'язкова" })
      .min(1, "Валюта обов'язкова"),
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
        "rounded-2xl border border-slate-200 dark:border-white/5 p-4 mb-4 relative group transition-all",
        isBorderOrCustoms ? "bg-amber-50/30" : "bg-white dark:bg-slate-900",
        isDragging &&
          "shadow-2xl ring-2 ring-indigo-500/20 scale-[1.01] z-50 bg-indigo-50/50",
      )}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="text-slate-300 hover:text-[#6366f1] cursor-grab active:cursor-grabbing p-1 md:-ml-2 mt-1 md:mt-0 flex-shrink-0"
        >
          <GripVertical className="w-6 h-6" />
        </div>

        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-[#6366f1]">
              Пункт №{index + 1}
            </span>
            {index > 1 && (
              <button
                type="button"
                onClick={() => removeRoute(index)}
                className="text-slate-400 hover:text-rose-500 transition-colors"
                title="Видалити точку"
              >
                <LucideX className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-7">
              <FormField
                control={control}
                name={`tender_route.${index}.address`}
                render={({ field: f }) => (
                  <FormItem>
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
                            `tender_route.${index}.ids_country`,
                            location.countryCode || "",
                          );
                          setValue(
                            `tender_route.${index}.city`,
                            location.city || "",
                          );
                          setValue(
                            `tender_route.${index}.ids_region`,
                            location.regionCode || "",
                          );
                          setValue(
                            `tender_route.${index}.post_code`,
                            location.post_code ||
                              location.postalCode ||
                              location.zip_code ||
                              "",
                          );
                          setValue(
                            `tender_route.${index}.street`,
                            location.street || "",
                          );
                          setValue(
                            `tender_route.${index}.house`,
                            location.house || "",
                          );
                          clearErrors(`tender_route.${index}.address`);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-3">
              <FormField
                control={control}
                name={`tender_route.${index}.ids_point`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mb-1 select-none">
                      ТИП
                    </FormLabel>
                    <Select value={f.value} onValueChange={f.onChange}>
                      <SelectTrigger
                        className={cn(
                          "h-12 rounded-xl border border-slate-200 shadow-sm text-sm font-medium",
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

            <div className="md:col-span-2 pb-1 flex justify-end md:justify-start">
              {["LOAD_FROM", "LOAD_TO"].includes(pointType) ? (
                <FormField
                  control={control}
                  name={`tender_route.${index}.customs`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 bg-slate-100/50 dark:bg-white/5 rounded-xl px-4 h-12 border border-slate-200">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-[13px] font-medium text-slate-500 whitespace-nowrap">
                        Митниця
                      </span>
                    </FormItem>
                  )}
                />
              ) : (
                <div className="h-12" />
              )}
            </div>
          </div>

          {/* Manual Address Fields */}
          {watch(`tender_route.${index}.address`) &&
            watch(`tender_route.${index}.ids_country`) !== "UA" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 pt-2 border-t border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-top-1 duration-200">
                <FormField
                  control={control}
                  name={`tender_route.${index}.post_code`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mb-1 select-none">
                        ПОШТОВИЙ КОД / ZIP
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          className="h-10 rounded-xl bg-slate-50/50"
                          placeholder="Код"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Hidden Coordinate Fields to ensure they are sent in the form */}
                <input type="hidden" {...control.register(`tender_route.${index}.lat`)} />
                <input type="hidden" {...control.register(`tender_route.${index}.lon`)} />
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

const CustomX = ({ className }: { className?: string }) => (
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

// ---------- VoiceVisualizer Component ----------
const VoiceVisualizer = ({ stream }: { stream: MediaStream | null }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animationRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      if (!ctx || !canvas) return;
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / (bufferLength / 2)) * 2;
      let barHeight;
      let x = 0;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#818cf8"); // indigo-400
      gradient.addColorStop(1, "#6366f1"); // indigo-500

      for (let i = 0; i < bufferLength / 2; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = gradient;
        const centerY = canvas.height / 2;
        const h = Math.max(2, barHeight);
        ctx.beginPath();
        if (ctx.roundRect)
          ctx.roundRect(x, centerY - h / 2, barWidth - 1, h, [2]);
        else ctx.rect(x, centerY - h / 2, barWidth - 1, h);
        ctx.fill();
        x += barWidth;
      }
    };
    draw();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioContext.close();
    };
  }, [stream]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={40}
      className="w-full h-10 opacity-80"
    />
  );
};

const getCompanyName = (data: any) => {
  if (!data) return "";
  return (
    data.company_name ||
    data.companyName ||
    data.client?.company_name ||
    data.client?.companyName ||
    data.id_client_info?.company_name ||
    data.id_client_info?.name ||
    data.client?.name ||
    ""
  );
};

const TenderPreviewCard = ({
  data,
  onApply,
  onSave,
  onDelete,
  onPin,
  isPinned,
  isSelected,
  onSelect,
  isDraft = false,
  isActive,
}: any) => {
  const origins = data.origins || [];
  const destinations = data.destinations || [];

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-[2rem] border-2 p-5 transition-all duration-300",
        isActive
          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-lg"
          : isPinned
            ? "border-amber-200 bg-amber-50/30 shadow-amber-100/50 dark:border-amber-500/20 dark:bg-amber-500/5"
            : isSelected
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10"
              : "border-slate-100 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md dark:border-white/5 dark:bg-slate-900/40 dark:hover:border-indigo-500/20",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-wrap gap-1.5">
          {data.cargoName && (
            <span className="rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              {data.cargoName}
            </span>
          )}
          {data.weight && (
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase text-slate-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
              {data.weight} т
            </span>
          )}
          {data.volume && (
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase text-slate-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
              {data.volume} м³
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onPin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}
              className={cn(
                "rounded-xl p-2 transition-all",
                isPinned
                  ? "bg-amber-100 text-amber-600"
                  : "text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5",
              )}
            >
              <Pin size={16} fill={isPinned ? "currentColor" : "none"} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="rounded-xl p-2 text-slate-300 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative pl-10 pr-2">
          <div className="absolute bottom-[14px] left-[20px] top-[14px] w-[2px] border-l-2 border-dashed border-slate-200 dark:border-white/10" />
          <div className="relative mb-6">
            <div className="absolute -left-[28px] top-1/2 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border-2 border-indigo-500 bg-white dark:bg-slate-900">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            </div>
            <div className="flex flex-col">
              <span className="mb-0.5 text-[9px] font-black uppercase tracking-tighter text-slate-400">
                Звідки
              </span>
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  {origins.length > 0 ? (
                    origins.map((o: any, idx: number) => (
                      <div key={idx} className="mb-1 flex flex-col last:mb-0">
                        <span className="text-[13px] font-bold text-slate-800 dark:text-white">
                          {o.city || o.address}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[13px] font-bold text-slate-800 dark:text-white">
                      —
                    </span>
                  )}
                </div>
                {data.dateLoad && (
                  <span className="shrink-0 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-500 dark:bg-indigo-500/10">
                    {new Date(data.dateLoad).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-[28px] top-1/2 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border-2 border-emerald-500 bg-white dark:bg-slate-900">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="mb-0.5 text-[9px] font-black uppercase tracking-tighter text-slate-400">
                Куди
              </span>
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  {destinations.length > 0 ? (
                    destinations.map((d: any, idx: number) => (
                      <div key={idx} className="mb-1 flex flex-col last:mb-0">
                        <span className="text-[13px] font-bold text-slate-800 dark:text-white">
                          {d.city || d.address}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[13px] font-bold text-slate-800 dark:text-white">
                      —
                    </span>
                  )}
                </div>
                {data.dateUnload && (
                  <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-500 dark:bg-emerald-500/10">
                    {new Date(data.dateUnload).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-4 dark:border-white/5 sm:flex-row sm:items-center">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
              Ліміт:
            </span>
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
              {data.price ? `${data.price} ${data.currency || "UAH"}` : "Запит"}
            </span>
          </div>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          {onSave && (
            <button
              onClick={onSave}
              className="shrink-0 rounded-2xl bg-slate-50 p-3 text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-500 dark:bg-white/5 dark:hover:bg-indigo-500/10"
            >
              <Save size={18} />
            </button>
          )}
          <AppButton
            onClick={onApply}
            size="sm"
            className={cn(
              "!rounded-2xl px-6 text-[11px] font-black uppercase tracking-wider flex-1 sm:flex-none",
              isDraft
                ? "bg-slate-900 dark:bg-slate-800"
                : "bg-indigo-600 shadow-indigo-200",
            )}
            rightIcon={<ChevronRight size={14} />}
          >
            {isDraft ? "Вставити" : "Вибрати"}
          </AppButton>
        </div>
      </div>

      {onSelect && (
        <div
          onClick={onSelect}
          className={cn(
            "absolute left-4 top-4 z-20 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border-2 transition-all",
            isSelected
              ? "border-indigo-500 bg-indigo-500 text-white"
              : "border-slate-200 bg-white opacity-0 group-hover:opacity-100 dark:border-white/10 dark:bg-slate-800",
          )}
        >
          {isSelected && <Check size={14} strokeWidth={4} />}
        </div>
      )}
    </div>
  );
};

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

  // --- AI & Drafts States ---
  const [aiText, setAiText] = useState("");
  const [aiFiles, setAiFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [draftSearch, setDraftSearch] = useState("");

  const [isAiExpanded, setIsAiExpanded] = useState(() => {
    if (typeof window !== "undefined")
      return localStorage.getItem("tender_ai_expanded") === "true";
    return false;
  });
  const [isDraftsExpanded, setIsDraftsExpanded] = useState(() => {
    if (typeof window !== "undefined")
      return localStorage.getItem("tender_drafts_expanded") === "true";
    return false;
  });

  const [isAiSectionVisible, setIsAiSectionVisible] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tender_show_ai_section_v2");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem(
      "tender_show_ai_section_v2",
      String(isAiSectionVisible),
    );
  }, [isAiSectionVisible]);

  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  const [isAiDragging, setIsAiDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    variant?: "danger" | "primary";
  }>({ open: false, title: "", description: "", onConfirm: () => {} });
  const [showAiWarning, setShowAiWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<"submit" | "reset" | null>(
    null,
  );
  const [pendingSubmitValues, setPendingSubmitValues] =
    useState<TenderFormValues | null>(null);

  useEffect(() => {
    localStorage.setItem("tender_ai_expanded", String(isAiExpanded));
  }, [isAiExpanded]);
  useEffect(() => {
    localStorage.setItem("tender_drafts_expanded", String(isDraftsExpanded));
  }, [isDraftsExpanded]);

  const filteredDrafts = React.useMemo(() => {
    let result = [...drafts];
    if (draftSearch.trim()) {
      const search = draftSearch.toLowerCase();
      result = result.filter((d) => d.title?.toLowerCase().includes(search));
    }
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [drafts, draftSearch]);

  // Load drafts on mount
  useEffect(() => {
    const saved = localStorage.getItem("tender_cargo_drafts");
    if (saved) {
      try {
        setDrafts(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading drafts", e);
      }
    }
  }, []);

  useEffect(() => {
    if (drafts.length > 0)
      localStorage.setItem("tender_cargo_drafts", JSON.stringify(drafts));
    else localStorage.removeItem("tender_cargo_drafts");
  }, [drafts]);

  // Audio helpers
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, [audioBlob]);

  useEffect(() => {
    let interval: any;
    if (isRecording)
      interval = setInterval(() => setRecordingDuration((p) => p + 1), 1000);
    else setRecordingDuration(0);
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        setAudioBlob(new Blob(chunks, { type: "audio/webm" }));
        setAudioStream(null);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioBlob(null);
    } catch (err) {
      toast.error("Не вдалося отримати доступ до мікрофона");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
    }
  };

  const handleDictation = () => {
    if (isDictating) return setIsDictating(false);
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition)
      return toast.error("Ваш браузер не підтримує розпізнавання мови");
    const recognition = new SpeechRecognition();
    recognition.lang = "uk-UA";
    recognition.onstart = () => {
      setIsDictating(true);
      toast.info("Слухаю вас...");
    };
    recognition.onresult = (e: any) => {
      setAiText((p) =>
        p ? `${p} ${e.results[0][0].transcript}` : e.results[0][0].transcript,
      );
      setIsDictating(false);
    };
    recognition.onerror = () => setIsDictating(false);
    recognition.onend = () => setIsDictating(false);
    recognition.start();
  };

  const handleAiAnalyze = async () => {
    if (!aiText.trim() && aiFiles.length === 0 && !audioBlob)
      return toast.error(
        "Введіть текст, додайте фото або запишіть голос для аналізу",
      );
    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append("text", aiText);
      aiFiles.forEach((f) => formData.append("images", f));
      if (audioBlob) formData.append("audio", audioBlob, "voice_command.webm");
      const { data } = await api.post("/ai/logistics/parse-tender", formData);
      if (data?.loads?.length > 0) {
        setAiResults(data.loads);
        toast.success(`Знайдено тендерів: ${data.loads.length}`);
      } else toast.error("AI не зміг знайти дані у вашому запиті");
    } catch (err) {
      toast.error("Помилка під час AI аналізу");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isValidDate = (ds: any) => {
    if (!ds || typeof ds !== "string") return false;
    const d = new Date(ds);
    return d instanceof Date && !isNaN(d.getTime());
  };

  const applyAiResult = (result: any, draftId?: string) => {
    if (!result) return;
    setValue("notes", "");
    setValue("price_start", undefined);
    setValue("id_owner_company", null);
    setCompanyLabel("");
    setValue("tender_trailer", []);
    setValue("car_count", 1);
    setValue("ids_valut", "UAH");

    if (result.origins?.length > 0) {
      setValue(
        "tender_route",
        result.origins.map((loc: any, idx: number) => ({
          ...loc,
          ids_point: "LOAD_FROM",
          order_num: idx + 1,
          customs: false,
          address: loc.address || loc.city || "",
          ids_country: (loc.ids_country || "UA").toUpperCase(),
          lat: loc.lat ? Number(Number(loc.lat).toFixed(6)) : undefined,
          lon: loc.lon ? Number(Number(loc.lon).toFixed(6)) : undefined,
          post_code: loc.post_code ? String(loc.post_code) : "",
          city: loc.city || "",
          street: loc.street || "",
          house: loc.house || "",
        })),
      );
    } else
      setValue("tender_route", [
        {
          address: "",
          ids_point: "LOAD_FROM",
          order_num: 1,
          customs: false,
          ids_country: "UA",
        },
      ]);

    if (result.destinations?.length > 0) {
      const existing = form.getValues("tender_route") || [];
      const offset = existing.length;
      const mappedDestinations = result.destinations.map((loc: any, idx: number) => ({
        ...loc,
        ids_point: "LOAD_TO",
        order_num: offset + idx + 1,
        customs: false,
        address: loc.address || loc.city || "",
        ids_country: (loc.ids_country || "UA").toUpperCase(),
        lat: loc.lat ? Number(Number(loc.lat).toFixed(6)) : undefined,
        lon: loc.lon ? Number(Number(loc.lon).toFixed(6)) : undefined,
        post_code: loc.post_code ? String(loc.post_code) : "",
        city: loc.city || "",
        street: loc.street || "",
        house: loc.house || "",
      }));
      setValue("tender_route", [...existing, ...mappedDestinations]);
    }

    if (result.price) {
      setValue("price_start", Number(Number(result.price).toFixed(2)));
    }
    if (result.id_client) setCompanyLabel(getCompanyName(result));
    if (result.currency) {
      const cur = result.currency.toUpperCase();
      if (valut.map((v) => v.value).includes(cur)) setValue("ids_valut", cur);
    }
    if (result.truckCount) setValue("car_count", result.truckCount);
    
    // Дати логістики
    if (isValidDate(result.dateLoad))
      setValue("date_load", new Date(result.dateLoad));
    if (isValidDate(result.dateLoad2))
      setValue("date_load2", new Date(result.dateLoad2));
    if (isValidDate(result.dateUnload))
      setValue("date_unload", new Date(result.dateUnload));

    // Дати самого тендеру (терміни проведення)
    if (isValidDate(result.tenderStart))
      setValue("time_start", new Date(result.tenderStart));
    if (isValidDate(result.tenderEnd))
      setValue("time_end", new Date(result.tenderEnd));

    let mappedTrailers: any[] = [];
    if (result.truckTypes?.length > 0) {
      mappedTrailers = result.truckTypes
        .map((name: string) => {
          const found = truckList.find(
            (t) =>
              t.label.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(t.label.toLowerCase()),
          );
          return found ? { ids_trailer_type: found.value } : null;
        })
        .filter(Boolean);
    }
    if (mappedTrailers.length > 0) setValue("tender_trailer", mappedTrailers);

    if (result.cargoName) {
        setValue("cargo", result.cargoName.substring(0, 25));
    }
    if (result.weight) setValue("weight", Number(Number(result.weight).toFixed(2)));
    if (result.volume) setValue("volume", Number(Number(result.volume).toFixed(2)));
    
    // Збираємо максимум інформації в load_info
    const fullInfo = [
        result.description,
        result.companyName ? `Замовник: ${result.companyName}` : ""
    ].filter(Boolean).join("\n");
    
    if (fullInfo) {
        setValue("load_info", fullInfo);
    }

    if (draftId) setActiveDraftId(draftId);
    else setActiveDraftId(null);
    setAiResults((prev) => prev.filter((r) => r !== result));
    if (aiResults.length <= 1) {
      setAiText("");
      setAiFiles([]);
    }
    toast.success("Дані завантажено у форму!");
  };

  const saveToDrafts = (result: any) => {
    const newDraft = {
      id: Math.random().toString(36).substr(2, 9),
      title: [...(result.origins || []), ...(result.destinations || [])]
        .map((loc) => loc.city || loc.address)
        .join(", "),
      data: result,
      createdAt: new Date().toISOString(),
      isPinned: false,
    };
    setDrafts((prev) => [newDraft, ...prev].slice(0, 20));
    setAiResults((prev) => prev.filter((r) => r !== result));
    toast.success("Збережено в шаблони");
  };

  const handleManualSaveTemplate = () => {
    const values = form.getValues();
    const origins = values.tender_route
      .filter((r: any) => r.ids_point === "LOAD_FROM")
      .map((r: any) => ({ ...r }));
    const destinations = values.tender_route
      .filter((r: any) => r.ids_point === "LOAD_TO")
      .map((r: any) => ({ ...r }));
    const mappedTruckTypes = values.tender_trailer
      .map((t: any) => {
        const found = truckList.find((x) => x.value === t.ids_trailer_type);
        return found?.label;
      })
      .filter(Boolean);

    const result = {
      origins,
      destinations,
      price: values.price_start,
      id_client: values.id_owner_company,
      companyName: companyLabel,
      currency: values.ids_valut,
      truckCount: values.car_count,
      dateLoad: values.date_load,
      dateUnload: values.date_unload,
      truckTypes: mappedTruckTypes,
      cargoName: values.cargo,
      weight: values.weight,
      volume: values.volume,
    };

    // Підраховуємо заповнені поля (points)
    let filledPoints = 0;
    if (result.cargoName) filledPoints++;
    if (result.origins.length > 0 && result.origins[0].address) filledPoints++;
    if (result.destinations.length > 0 && result.destinations[0].address)
      filledPoints++;
    if (result.price) filledPoints++;
    if (result.weight) filledPoints++;
    if (result.volume) filledPoints++;
    if (result.truckTypes.length > 0) filledPoints++;
    if (result.companyName) filledPoints++;

    if (filledPoints < 2) {
      toast.error("Для збереження шаблону потрібно заповнити хоча б 2 поля");
      return;
    }

    saveToDrafts(result);
  };

  const handleBulkSaveAiToDrafts = () => {
    const newDrafts = aiResults.map((res) => ({
      id: Math.random().toString(36).substring(2, 9),
      title: [...(res.origins || []), ...(res.destinations || [])]
        .map((loc) => loc.city || loc.address)
        .join(", "),
      data: res,
      createdAt: new Date().toISOString(),
    }));
    setDrafts((prev) => [...newDrafts, ...prev].slice(0, 20));
    setAiResults([]);
    setShowAiWarning(false);
    if (pendingAction === "submit" && pendingSubmitValues)
      onSubmit(pendingSubmitValues);
    setPendingAction(null);
  };

  const handleDiscardAiResults = () => {
    setAiResults([]);
    setShowAiWarning(false);
    if (pendingAction === "submit" && pendingSubmitValues)
      onSubmit(pendingSubmitValues);
    setPendingAction(null);
  };

  const togglePinDraft = (id: string) =>
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isPinned: !d.isPinned } : d)),
    );
  const toggleSelectDraft = (id: string) =>
    setSelectedDraftIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  const handleDeleteDraft = (id: string) => {
    /* simplified */ setDrafts((prev) => prev.filter((d) => d.id !== id));
  };
  const handleDeleteSelectedDrafts = () => {
    /* simplified */ setDrafts((prev) =>
      prev.filter((d) => !selectedDraftIds.includes(d.id)),
    );
    setSelectedDraftIds([]);
  };
  const handleDeleteAllDrafts = () => {
    /* simplified */ setDrafts([]);
    setSelectedDraftIds([]);
  };

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
        {
          address: "",
          ids_point: "LOAD_FROM",
          order_num: 1,
          customs: false,
          ids_country: "",
        },
        {
          address: "",
          ids_point: "LOAD_TO",
          order_num: 2,
          customs: false,
          ids_country: "",
        },
      ],
      tender_permission: [],
      tender_trailer: [],
      tender_load: [],
      company_name: "",
      load_info: "",
      time_start: new Date(),
      weight: 22,
      volume: 86,
      ids_valut: "",
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
    // Sanitization: Round all numeric fields to prevent database overflow
    const sanitizedValues = {
      ...values,
      weight: values.weight ? Number(Number(values.weight).toFixed(2)) : values.weight,
      volume: values.volume ? Number(Number(values.volume).toFixed(2)) : values.volume,
      price_start: values.price_start ? Number(Number(values.price_start).toFixed(2)) : values.price_start,
      price_step: values.price_step ? Number(Number(values.price_step).toFixed(2)) : values.price_step,
      price_redemption: values.price_redemption ? Number(Number(values.price_redemption).toFixed(2)) : values.price_redemption,
      tender_route: values.tender_route.map((route, idx) => ({
        ...route,
        order_num: idx + 1,
        lat: route.lat ? Number(Number(route.lat).toFixed(6)) : route.lat,
        lon: route.lon ? Number(Number(route.lon).toFixed(6)) : route.lon,
      })),
    };

    const payload = {
      ...sanitizedValues,
      tender_permission:
        values.tender_permission?.filter((p) => p && p.ids_permission_type) ||
        [],
      tender_trailer:
        values.tender_trailer?.filter((t) => t && t.ids_trailer_type) || [],
      tender_load:
        values.tender_load?.filter((l) => l && l.ids_load_type) || [],
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
      if (isEdit) {
        router.back();
      } else if (!isNextTender) {
        router.push("/log/tender/draft");
      } else {
        toast.success("Тендер збережено. Ви можете створити наступний.");
        // We don't reset everything to keep the form filled for the next one
        // but we might want to reset the id if we were in edit mode
        if (defaultValues?.id) {
          // If we were editing, we definitely want to clear ID for the 'next' ones
          // but TenderSaveForm is usually new.
        }
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

  console.log(form.formState.errors, "ERROR");

  return (
    <div className="gap-2 w-full overflow-x-hidden pb-40 scrollbar-thin">
      {!defaultValues && (
        <div className="flex justify-end mb-4 pr-1">
          <AppButton
            variant="ghost"
            size="sm"
            onClick={() => setIsAiSectionVisible(!isAiSectionVisible)}
            className="text-indigo-500 font-bold uppercase tracking-widest text-[10px] bg-indigo-50/50 hover:bg-indigo-100"
            leftIcon={<Sparkles size={14} />}
          >
            {isAiSectionVisible
              ? "Сховати ШІ та шаблони"
              : "Розгорнути ШІ та шаблони"}
          </AppButton>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: AI ASSISTANT (4 cols) */}
        {!defaultValues && isAiSectionVisible && (
          <div className="lg:col-span-4 space-y-4 order-1">
            <button
              type="button"
              onClick={() => setIsAiExpanded(!isAiExpanded)}
              className="lg:hidden w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden relative"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-xl">
                  <Sparkles className="text-white w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    AI Помічник
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {aiFiles.length > 0 || aiText
                      ? "Данні додано"
                      : "Вставити текст або фото"}
                  </p>
                </div>
              </div>
              {isAiExpanded ? (
                <ChevronUp size={18} className="text-slate-400" />
              ) : (
                <ChevronDown size={18} className="text-slate-400" />
              )}
            </button>

            <div
              className={cn(
                "space-y-4 lg:block animate-in fade-in duration-300",
                isAiExpanded ? "block" : "hidden",
              )}
            >
              <div
                className={cn(
                  "bg-gradient-to-br from-indigo-50/50 to-fuchsia-50/50 dark:from-indigo-950/10 dark:to-fuchsia-950/10 backdrop-blur-md border border-indigo-200/50 dark:border-indigo-500/20 p-6 rounded-[2rem] shadow-sm relative overflow-hidden transition-all duration-300",
                  isAiDragging &&
                    "ring-4 ring-indigo-500 ring-inset scale-[1.02]",
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsAiDragging(true);
                }}
                onDragLeave={() => setIsAiDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsAiDragging(false);
                  const files = Array.from(e.dataTransfer.files).filter((f) =>
                    f.type.startsWith("image/"),
                  );
                  if (files.length > 0) {
                    setAiFiles((p) => [...p, ...files]);
                    setAiText("");
                    toast.success(`Додано ${files.length} фото!`);
                  }
                }}
              >
                {isAiDragging && (
                  <div className="absolute inset-0 bg-indigo-500/20 backdrop-blur-[2px] z-[50] flex flex-col items-center justify-center animate-in fade-in duration-200 pointer-events-none">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-full shadow-2xl animate-bounce">
                      <UploadCloud className="text-indigo-500 w-10 h-10" />
                    </div>
                    <span className="mt-4 text-indigo-700 dark:text-indigo-300 font-black uppercase tracking-widest text-sm">
                      Перетягніть фото сюди
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-5 lg:flex hidden">
                  <Sparkles className="text-indigo-500 w-5 h-5" />
                  <h3 className="font-bold text-slate-800 dark:text-white">
                    AI Помічник
                  </h3>
                </div>

                <div
                  className="space-y-4"
                  onPaste={(e) => {
                    const items = e.clipboardData.items;
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].type.indexOf("image") !== -1) {
                        const file = items[i].getAsFile();
                        if (file) {
                          setAiFiles((p) => [...p, file]);
                          setAiText("");
                          toast.success("Зображення додано з буфера обміну!");
                        }
                      }
                    }
                  }}
                >
                  <div className="relative h-48 group/container">
                    {aiFiles.length > 0 ? (
                      <div className="w-full h-full p-3 rounded-[1.5rem] bg-white/50 dark:bg-slate-900/50 border border-indigo-100 dark:border-indigo-500/20 flex flex-wrap gap-2 items-start overflow-y-auto custom-scrollbar relative">
                        <button
                          type="button"
                          onClick={() => setAiFiles([])}
                          className="absolute top-2 right-2 z-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 p-1.5 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase backdrop-blur-sm border border-red-500/20"
                        >
                          <Trash2 size={12} /> Очистити
                        </button>
                        {aiFiles.map((file, idx) => {
                          const url = URL.createObjectURL(file);
                          return (
                            <div
                              key={idx}
                              className="relative w-20 aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group/img animate-in zoom-in-95"
                            >
                              <img
                                src={url}
                                alt="preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setAiFiles((p) =>
                                    p.filter((_, i) => i !== idx),
                                  )
                                }
                                className="absolute top-1 right-1 bg-red-500/80 p-1 rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                              >
                                <LucideX size={10} className="text-white" />
                              </button>
                            </div>
                          );
                        })}
                        <label className="w-20 aspect-square rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-500/20 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-colors">
                          <input
                            type="file"
                            className="hidden"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files) {
                                setAiFiles((p) => [
                                  ...p,
                                  ...Array.from(e.target.files!),
                                ]);
                                setAiText("");
                              }
                            }}
                          />
                          <Plus className="text-indigo-400 w-5 h-5" />
                        </label>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <textarea
                          className="w-full h-full p-4 pr-12 rounded-[1.5rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-sm"
                          placeholder="Вставте текст заявки,або фото"
                          value={aiText}
                          onChange={(e) => setAiText(e.target.value)}
                        />
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          {aiText && (
                            <button
                              type="button"
                              onClick={() => setAiText("")}
                              className="text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <LucideX size={18} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleDictation}
                            className={cn(
                              "transition-all",
                              isDictating
                                ? "text-red-500 animate-pulse"
                                : "text-slate-300 hover:text-indigo-500",
                            )}
                            title="Надиктувати текст"
                          >
                            <Mic size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition-all p-3">
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files)
                            setAiFiles((p) => [
                              ...p,
                              ...Array.from(e.target.files!),
                            ]);
                        }}
                      />
                      <UploadCloud className="text-slate-400 w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Фото
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={cn(
                        "flex-1 flex flex-col items-center justify-center border-2 rounded-2xl transition-all p-3 relative overflow-hidden",
                        isRecording
                          ? "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-500"
                          : audioBlob
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"
                            : "border-dashed border-slate-200 dark:border-white/10 text-slate-400 hover:border-indigo-500 hover:bg-indigo-50/30",
                      )}
                    >
                      {isRecording ? (
                        <div className="flex flex-col items-center justify-center w-full">
                          <VoiceVisualizer stream={audioStream} />
                          <div className="flex items-center gap-2 mt-1">
                            <Square size={14} className="animate-pulse" />
                            <span className="text-[10px] font-bold uppercase">
                              {Math.floor(recordingDuration / 60)}:
                              {String(recordingDuration % 60).padStart(2, "0")}
                            </span>
                          </div>
                        </div>
                      ) : audioBlob ? (
                        <div className="flex flex-col items-center justify-center w-full">
                          <div className="flex items-center gap-2 mb-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isPlaying) {
                                  audioRef.current?.pause();
                                  setIsPlaying(false);
                                } else {
                                  if (!audioRef.current) {
                                    audioRef.current = new Audio(
                                      URL.createObjectURL(audioBlob),
                                    );
                                    audioRef.current.onended = () =>
                                      setIsPlaying(false);
                                  }
                                  audioRef.current.play();
                                  setIsPlaying(true);
                                }
                              }}
                              className="p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                            >
                              {isPlaying ? (
                                <Pause size={12} />
                              ) : (
                                <Play size={12} />
                              )}
                            </button>
                            <Volume2 size={12} className="text-slate-400" />
                            <span className="text-[10px] font-bold uppercase truncate max-w-[60px]">
                              Аудіо
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAudioBlob(null);
                              if (audioRef.current) {
                                audioRef.current.pause();
                                audioRef.current = null;
                              }
                              setIsPlaying(false);
                            }}
                            className="text-[9px] font-bold text-red-500 uppercase hover:underline"
                          >
                            Видалити
                          </button>
                        </div>
                      ) : (
                        <>
                          <Mic size={20} className="mb-1" />
                          <span className="text-[10px] font-bold uppercase">
                            Голос
                          </span>
                        </>
                      )}
                    </button>
                    <AppButton
                      type="button"
                      onClick={handleAiAnalyze}
                      isLoading={isAnalyzing}
                      disabled={
                        isAnalyzing ||
                        (!aiText.trim() && aiFiles.length === 0 && !audioBlob)
                      }
                      className="flex-[2] bg-indigo-600 shadow-indigo-600/20 shadow-lg !rounded-2xl"
                      leftIcon={<Zap size={16} />}
                    >
                      Аналізувати
                    </AppButton>
                  </div>
                </div>
              </div>

              {aiResults.length > 0 && (
                <div className="space-y-4 animate-in slide-in-from-left-4 duration-500">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="text-indigo-500 w-4 h-4" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Знайдені ({aiResults.length})
                      </h4>
                    </div>
                    {aiResults.length > 1 && (
                      <button
                        type="button"
                        onClick={handleBulkSaveAiToDrafts}
                        className="text-[9px] font-black text-indigo-500 uppercase hover:underline"
                      >
                        Зберегти всі
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                    {aiResults.map((res, i) => (
                      <TenderPreviewCard
                        key={i}
                        data={res}
                        onApply={() => applyAiResult(res)}
                        onSave={() => saveToDrafts(res)}
                        onDelete={() =>
                          setAiResults((p) => p.filter((r) => r !== res))
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setIsDraftsExpanded(!isDraftsExpanded)}
                className="lg:hidden w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm mt-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <ClipboardList className="text-slate-500 w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    Шаблони ({drafts.length})
                  </h3>
                </div>
                {isDraftsExpanded ? (
                  <ChevronUp size={18} className="text-slate-400" />
                ) : (
                  <ChevronDown size={18} className="text-slate-400" />
                )}
              </button>
              <div
                className={cn(
                  "space-y-4 lg:block animate-in fade-in duration-300",
                  isDraftsExpanded ? "block" : "hidden",
                )}
              >
                <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 p-5 rounded-[2rem] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Ваші шаблони
                    </h4>
                    <div className="flex gap-2">
                      {selectedDraftIds.length > 0 && (
                        <button
                          type="button"
                          onClick={handleDeleteSelectedDrafts}
                          className="text-[9px] text-red-500 font-bold uppercase hover:underline"
                        >
                          Видалити обрані
                        </button>
                      )}
                      {drafts.length > 0 && (
                        <button
                          type="button"
                          onClick={handleDeleteAllDrafts}
                          className="text-[9px] text-zinc-400 font-bold uppercase hover:text-red-500"
                        >
                          Очистити
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                    <input
                      type="text"
                      placeholder="Пошук..."
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      value={draftSearch}
                      onChange={(e) => setDraftSearch(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3 h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredDrafts.length > 0 ? (
                      filteredDrafts.map((draft) => (
                        <TenderPreviewCard
                          key={draft.id}
                          data={draft.data}
                          isDraft
                          isActive={activeDraftId === draft.id}
                          isPinned={draft.isPinned}
                          isSelected={selectedDraftIds.includes(draft.id)}
                          onApply={() => applyAiResult(draft.data, draft.id)}
                          onDelete={() => handleDeleteDraft(draft.id)}
                          onPin={() => togglePinDraft(draft.id)}
                          onSelect={() => toggleSelectDraft(draft.id)}
                        />
                      ))
                    ) : (
                      <div className="py-10 text-center opacity-40">
                        <ClipboardList className="mx-auto mb-2 h-8 w-8" />
                        <p className="text-xs font-bold">Шаблонів немає</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MIDDLE COLUMN: MAIN FORM */}
        <div
          className={cn(
            "space-y-4 order-3 lg:order-2 transition-all duration-300",
            !defaultValues && isAiSectionVisible
              ? "lg:col-span-8"
              : "lg:col-span-12",
          )}
        >
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full scrollbar-thin bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-4 lg:p-6"
            >
              <fieldset
                disabled={isSubmitting || isPending}
                className="flex flex-col gap-3 min-w-0 w-full p-0 m-0 border-none scrollbar-thin"
              >
                {/* TOP HEADER BLOCK */}
                <div className="flex items-center justify-between mb-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 gap-2 font-medium"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    Назад
                  </Button>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        reset();
                        setCompanyLabel("");
                      }}
                      className="border-indigo-100 text-indigo-500 hover:bg-indigo-50 bg-white"
                    >
                      Скинути
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleManualSaveTemplate}
                      className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 bg-white hidden sm:inline-flex"
                    >
                      Зберегти в шаблон
                    </Button>
                    <AppButton
                      type="submit"
                      disabled={isSubmitting || isPending}
                      className="bg-[#6366f1] hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 px-8"
                    >
                      Опублікувати
                    </AppButton>
                  </div>
                </div>

                {/* CARD 1: TITLE & BASIC INFO */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-4 md:p-5">
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    Створення Тендера
                  </h1>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <FormField
                      control={control}
                      name="ids_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">
                            ТИП ТЕНДЕРУ
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="h-12 rounded-xl border border-slate-200 shadow-sm bg-white font-medium text-slate-800">
                              <SelectValue placeholder="Оберіть тип" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
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
                          <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">
                            РЕЙТИНГ ДОСТУПУ
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="h-12 rounded-xl border border-slate-200 shadow-sm bg-white font-medium text-slate-800">
                              <SelectValue placeholder="Оберіть рейтинг" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
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

                  <div>
                    <InputAsyncSelectCompany
                      name="id_owner_company"
                      control={control}
                      label="КОМПАНІЯ ЗАМОВНИК"
                      initialLabel={companyLabel}
                      onEntityChange={(c) => setCompanyLabel(c?.name || "")}
                    />
                  </div>
                </div>

                {/* CARD 2 & 3: TIME & LOGISTICS */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {/* TIME */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-4 md:p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-5 h-5 text-slate-800 dark:text-white" />
                      <h2 className="text-[16px] font-bold text-slate-800 dark:text-white">
                        Час проведення тендеру
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  {/* LOGISTICS */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-4 md:p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Truck className="w-5 h-5 text-slate-800 dark:text-white" />
                      <h2 className="text-[16px] font-bold text-slate-800 dark:text-white">
                        Логістика
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InputDateWithTime
                        name="date_load"
                        control={control}
                        label="ЗАВАНТАЖЕННЯ ВІД"
                      />
                      <InputDateWithTime
                        name="date_load2"
                        control={control}
                        label="ЗАВАНТАЖЕННЯ ДО"
                      />
                      <InputDateWithTime
                        name="date_unload"
                        control={control}
                        label="РОЗВАНТАЖЕННЯ"
                      />
                    </div>
                  </div>
                </div>

                {/* 📍 CARD 4: МАРШРУТ ПЕРЕВЕЗЕННЯ */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-4 md:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-slate-800 dark:text-white" />
                      <h2 className="text-[16px] font-bold text-slate-800 dark:text-white">
                        Маршрут перевезення
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-0">
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
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl h-10 px-4 text-[12px] uppercase font-bold border-indigo-100 text-[#6366f1] hover:bg-indigo-50 transition-all gap-2 bg-white"
                          onClick={() =>
                            appendRoute({
                              address: "",
                              ids_point: "LOAD_TO",
                              order_num: routeFields.length + 1,
                              customs: false,
                              ids_country: "",
                              city: "",
                            })
                          }
                        >
                          <Plus className="w-4 h-4" /> ДОДАТИ ПУНКТ
                        </Button>
                      </div>
                    </DndContext>
                  </div>
                </div>

                {/* 📦 CARD 5: ДЕТАЛІ ВАНТАЖУ & ГАБАРИТИ */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-4 md:p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Box size={20} className="text-slate-800 dark:text-white" />
                    <h2 className="text-[16px] font-bold text-slate-800 dark:text-white">
                      Деталі вантажу
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
                    <div className="lg:col-span-8 space-y-4">
                      <InputText
                        name="cargo"
                        control={control}
                        label="ВАНТАЖ"
                        icon={Box}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputMultiSelect
                          name="tender_trailer"
                          control={control}
                          label="ТИП ТРАНСПОРТУ"
                          options={truckList}
                          required
                        />
                        <InputMultiSelect
                          name="tender_load"
                          control={control}
                          label="ТИП ЗАВАНТАЖЕННЯ"
                          options={loadList}
                          valueKey="ids_load_type"
                          required
                        />
                      </div>

                      <div className="space-y-4">
                        <InputMultiSelect
                          name="tender_permission"
                          control={control}
                          label="ТРАНСПОРТНІ ДОКУМЕНТИ"
                          options={tenderPermission}
                          valueKey="ids_permission_type"
                        />
                        <InputTextarea
                          name="notes"
                          control={control}
                          label="ДОДАТКОВІ УМОВИ"
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
                    </div>

                    <div className="lg:col-span-4">
                      <div className="bg-[#f4f5f8] dark:bg-slate-800/40 rounded-2xl p-4 lg:p-6 space-y-4 h-full">
                        <h3 className="text-[14px] font-bold text-slate-800 dark:text-white mb-2">
                          Габарити та вага
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

                {/* 💰 CARD 6: БЮДЖЕТ ТЕНДЕРУ (Conditional) */}
                {typeValue && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-4 md:p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <DollarSign
                          size={20}
                          className="text-slate-800 dark:text-white"
                        />
                        <h2 className="text-[16px] font-bold text-slate-800 dark:text-white">
                          Бюджет тендеру
                        </h2>
                      </div>
                      <div className="w-[120px]">
                        <SelectFinance
                          name="ids_valut"
                          control={control}
                          label="Валюта"
                          options={valut.slice(0, 4)}
                          placeholder="Оберіть"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                      {(typeValue === "REDUCTION" ||
                        typeValue === "REDUCTION_WITH_REDEMPTION") && (
                        <>
                          <InputFinance
                            name="price_start"
                            control={control}
                            label="СТАРТ"
                            currency={currencySign}
                          />
                          <InputFinance
                            name="price_client"
                            control={control}
                            label="ЦІНА ЗАМОВНИКА"
                            currency={currencySign}
                          />
                          <InputFinance
                            name="price_step"
                            control={control}
                            label="КРОК"
                            currency={currencySign}
                          />
                          {typeValue === "REDUCTION_WITH_REDEMPTION" ? (
                            <InputFinance
                              name="price_redemption"
                              control={control}
                              label="ВИКУП"
                              currency={currencySign}
                              required
                            />
                          ) : (
                            <div />
                          )}
                        </>
                      )}
                      {typeValue === "AUCTION" && (
                        <>
                          <InputFinance
                            name="price_client"
                            control={control}
                            label="ЦІНА ЗАМОВНИКА"
                            currency={currencySign}
                          />
                          <div className="text-slate-400 text-xs italic mt-4">
                            {/* Вкажіть бажану ціну замовника та оберіть валюту. */}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 📎 CARD 7: ДОКУМЕНТИ */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-4 md:p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-[16px] font-bold text-slate-800 dark:text-white">
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

                {/* 🏁 BOTTOM ACTION BAR */}
                <div className="flex flex-col md:flex-row justify-center items-center gap-4 pt-6 pb-12 w-full">
                  {!isEdit && (
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 h-12 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                      <Switch
                        id="next-tender-switch"
                        checked={isNextTender}
                        onCheckedChange={setIsNextTender}
                      />
                      <label
                        htmlFor="next-tender-switch"
                        className="text-[12px] font-bold text-slate-500 uppercase tracking-tight cursor-pointer select-none"
                      >
                        Наступний тендер
                      </label>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      reset();
                      setCompanyLabel("");
                      setFiles([]);
                    }}
                    className="w-full md:w-auto min-w-[140px] h-12 bg-[#f4f5f8] dark:bg-slate-800 text-[#6366f1] border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl font-bold tracking-wide shadow-sm"
                  >
                    Скинути
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleManualSaveTemplate}
                    className="w-full md:w-auto min-w-[140px] h-12 bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50 rounded-xl font-medium tracking-wide shadow-sm"
                  >
                    Зберегти в шаблон
                  </Button>
                  <AppButton
                    type="submit"
                    disabled={isSubmitting || isPending}
                    className="w-full md:w-auto min-w-[140px] h-12 bg-[#6366f1] hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 rounded-xl font-medium tracking-wide"
                  >
                    {isSubmitting || isPending ? (
                      <div className="flex items-center gap-2 px-2">
                        <Zap className="w-5 h-5 animate-spin" />
                        <span>ОБРОБКА...</span>
                      </div>
                    ) : (
                      <span className="px-2">Опублікувати</span>
                    )}
                  </AppButton>
                </div>
              </fieldset>
            </form>
          </Form>
        </div>
      </div>

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
