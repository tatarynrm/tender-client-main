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
  Sparkles,
  UploadCloud,
  FileImage,
  Zap,
  CheckCircle2,
  BrainCircuit,
  GripVertical,
  Layers,
  Save,
  Trash2,
  ChevronRight,
  ClipboardList,
  Search,
  ChevronDown,
  ChevronUp,
  Pin,
  Check,
  Mic,
  Square,
  Circle,
} from "lucide-react";
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Shared UI & Components
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/shared/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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
import { InputText } from "@/shared/components/Inputs/InputText";
import { InputDate } from "@/shared/components/Inputs/InputDate";
import { InputAsyncSelectCompany } from "@/shared/components/Inputs/InputAsyncSelectCompany";
import { AppButton } from "@/shared/components/Buttons/AppButton";

// Hooks & Helpers
import { useLoadById, useLoads } from "../hooks/useLoads";
import { renderLocationDetails } from "./LocationDetails";
import axios from "axios";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { Play, Pause, Volume2 } from "lucide-react";

// ---------- Visualizer Component ----------
const VoiceVisualizer = ({ stream }: { stream: MediaStream | null }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animationRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
      gradient.addColorStop(0, '#818cf8'); // indigo-400
      gradient.addColorStop(1, '#6366f1'); // indigo-500

      for (let i = 0; i < bufferLength / 2; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        ctx.fillStyle = gradient;

        const centerY = canvas.height / 2;
        const h = Math.max(2, barHeight);

        ctx.beginPath();
        if (ctx.roundRect) {
          // @ts-ignore
          ctx.roundRect(x, centerY - h / 2, barWidth - 1, h, [2]);
        } else {
          ctx.rect(x, centerY - h / 2, barWidth - 1, h);
        }
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

// ---------- Helpers & Schemas ----------

const SortableRouteItem = ({
  id,
  children,
  onRemove,
  showRemove,
}: {
  id: string;
  children: React.ReactNode;
  onRemove: () => void;
  showRemove: boolean;
}) => {
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
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 group relative"
    >
      <div
        {...attributes}
        {...listeners}
        className="mt-3.5 p-1 text-slate-300 hover:text-indigo-500 cursor-grab active:cursor-grabbing transition-colors"
      >
        <GripVertical size={20} />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
      {showRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-3.5 p-1 text-slate-300 hover:text-red-500 transition-colors"
        >
          <Minus size={18} />
        </button>
      )}
    </div>
  );
};

const LoadPreviewCard = ({
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
}: {
  data: any;
  onApply: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  isPinned?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  isDraft?: boolean;
  isActive?: boolean;
}) => {
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
      {/* Top Section: Badges & Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-wrap gap-1.5">
          {data.cargoName && (
            <span className="rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              {data.cargoName}
            </span>
          )}
          {data.isCollective && (
            <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase text-violet-600 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400">
              Збірний
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
          {data.truckTypes &&
            data.truckTypes.map((t: string, i: number) => (
              <span
                key={i}
                className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
              >
                {t}
              </span>
            ))}
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
          {!isDraft && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="rounded-xl p-2 text-slate-300 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Route */}
      <div className="flex flex-col gap-4">
        <div className="relative pl-10 pr-2">
          {/* Connector Line */}
          <div className="absolute bottom-[14px] left-[20px] top-[14px] w-[2px] border-l-2 border-dashed border-slate-200 dark:border-white/10" />

          {/* Origin */}
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
                        {(o.street || o.house) && (
                          <span className="text-[10px] leading-tight text-slate-400 dark:text-slate-500">
                            {o.street}
                            {o.house ? `, ${o.house}` : ""}
                          </span>
                        )}
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

          {/* Destination */}
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
                        {(d.street || d.house) && (
                          <span className="text-[10px] leading-tight text-slate-400 dark:text-slate-500">
                            {d.street}
                            {d.house ? `, ${d.house}` : ""}
                          </span>
                        )}
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

      {/* FooterSection: Company & Price & Actions */}
      <div className="mt-2 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-4 dark:border-white/5 sm:flex-row sm:items-center">
        <div className="flex flex-col">
          {data.companyName && (
            <div className="mb-1 flex items-center gap-1.5 text-slate-400">
              <Truck size={12} />
              <span className="max-w-[150px] truncate text-[10px] font-bold">
                {data.companyName}
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
              Ціна:
            </span>
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
              {data.price
                ? `${data.price} ${data.currency || "UAH"}`
                : "Запит"}
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

      {/* Selection Overlay for Drafts */}
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

const STORAGE_KEY = "load_from_draft_v2";

const toLocalDateString = (date: Date | null) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const numFix = (val: any): number | undefined => {
  if (val === null || val === "" || val === undefined) return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
};

const routeSchema = z.object({
  id: z.number().optional().nullable(),
  lat: z.number().optional().nullable(),
  lon: z.number().optional().nullable(),
  address: z.string().min(1, "Будь ласка, вкажіть адресу"),
  ids_route_type: z.enum(["LOAD_FROM", "LOAD_TO"]),
  ids_country: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  order_num: z.number(),
  ids_region: z.string().nullable().optional(),
  street: z.string().optional().nullable(),
  house: z.string().optional().nullable(),
  post_code: z.string().optional().nullable(),
});

const cargoServerSchema = z
  .object({
    id: z.number().optional().nullable(),
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
    crm_load_route_to: z
      .array(routeSchema)
      .min(1, "Додайте точку розвантаження"),
    crm_load_trailer: z
      .array(z.object({ ids_trailer_type: z.string() }))
      .min(1, "Оберіть тип транспорту"),
    is_price_request: z.boolean().optional(),
    is_collective: z.boolean().optional(),
    car_count_begin: z
      .number()
      .min(1, "Мінімальна к-сть 1")
      .max(100, "Максимальна к-сть 100"),
    date_load: z
      .string({ message: "Дата завантаження є обов'язковою" })
      .min(1, "Дата завантаження є обов'язковою"),
    date_load2: z.string().nullable().optional(),
    date_unload: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (!data.date_unload || !data.date_load) return true;

      // Створюємо об'єкти дати, обнуляючи час для чистого порівняння дат
      const load = new Date(data.date_load).setHours(0, 0, 0, 0);
      const unload = new Date(data.date_unload).setHours(0, 0, 0, 0);

      return unload >= load;
    },
    {
      message: "Дата розвантаження не може бути раніше дати завантаження",
      path: ["date_unload"],
    },
  );

export type CargoServerFormValues = z.infer<typeof cargoServerSchema>;

const sanitizeCargoData = (data: any): Partial<CargoServerFormValues> => {
  if (!data) return {};
  const sanitizeRoute = (r: any) => ({
    ...r,
    id: r.id ? Number(r.id) : undefined,
    lat: r.lat ? Number(r.lat) : undefined,
    lon: r.lon ? Number(r.lon) : undefined,
    order_num: r.order_num ? Number(r.order_num) : 0,
    address: r.city || r.address || "",
  });

  return {
    ...data,
    id: data.id ? Number(data.id) : undefined,
    price: data.price ? Number(data.price) : undefined,
    id_client: data.id_client || data.client?.id ? Number(data.id_client || data.client?.id) : undefined,
    car_count_begin: data.car_count_begin ? Number(data.car_count_begin) : 1,
    date_load: data.date_load
      ? (data.date_load instanceof Date ? toLocalDateString(data.date_load) : String(data.date_load))
      : undefined,
    date_load2: data.date_load2
      ? (data.date_load2 instanceof Date ? toLocalDateString(data.date_load2) : String(data.date_load2))
      : undefined,
    date_unload: data.date_unload
      ? (data.date_unload instanceof Date ? toLocalDateString(data.date_unload) : String(data.date_unload))
      : undefined,
    crm_load_route_from: data.crm_load_route_from?.map(sanitizeRoute),
    crm_load_route_to: data.crm_load_route_to?.map(sanitizeRoute),
    crm_load_trailer: data.crm_load_trailer?.map((t: any) => ({
      ids_trailer_type: t.ids_trailer_type || t.trailer_type_id,
    })) || [],
  };
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

interface LoadFormProps {
  defaultValues?: any;
}

export default function LoadForm({ defaultValues }: LoadFormProps) {
  const { config } = useFontSize();
  const router = useRouter();
  const searchParams = useSearchParams();
  const copyId = searchParams.get("copyId");
  const { profile } = useAuth();
  // States
  const [valutList, setValutList] = useState<any[]>([]);
  const [truckList, setTruckList] = useState<any[]>([]);
  const [isNextCargo, setIsNextCargo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [companyLabel, setCompanyLabel] = useState<string>("");
  const [isSubmittingSuccess, setIsSubmittingSuccess] = useState(false);
  const [showAiWarning, setShowAiWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<"submit" | "reset" | null>(null);
  const [pendingSubmitValues, setPendingSubmitValues] = useState<CargoServerFormValues | null>(null);

  // API Hooks
  const { saveCargo } = useLoads({});
  const { data: copyData } = useLoadById(copyId);
  console.log(defaultValues, "DEFAULT VALUES");

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
    move: moveFrom,
  } = useFieldArray({
    control,
    name: "crm_load_route_from",
  });
  const {
    fields: toFields,
    append: appendTo,
    remove: removeTo,
    move: moveTo,
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
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      const sanitized = sanitizeCargoData(defaultValues);
      setCompanyLabel(getCompanyName(defaultValues));
      reset(sanitized);
    } else if (copyData) {
      const sanitized = sanitizeCargoData(copyData);
      setCompanyLabel(getCompanyName(copyData));

      reset({
        ...sanitized,
        id: undefined,
        crm_load_route_from: sanitized.crm_load_route_from?.map((r) => ({
          ...r,
          id: undefined,
        })),
        crm_load_route_to: sanitized.crm_load_route_to?.map((r) => ({
          ...r,
          id: undefined,
        })),
        crm_load_trailer: sanitized.crm_load_trailer?.map((t: any) => ({
          ...t,
          id: undefined,
        })),
        date_load: toLocalDateString(new Date()) || "",
      });
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCompanyLabel(parsed.companyLabel || "");
          reset(parsed.values);
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
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
    if (aiResults.length > 0 && !showAiWarning) {
      setPendingSubmitValues(values);
      setPendingAction("submit");
      setShowAiWarning(true);
      return;
    }

    try {
      setIsLoading(true);
      await saveCargo({
        ...values,
        id: values.id || defaultValues?.id,
      });

      if (activeDraftId) {
        setActiveDraftId(null);
      }

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

  // ---------- AI & Drafts Logic ----------
  const [aiText, setAiText] = useState("");
  const [aiFiles, setAiFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]); // Змінено на масив результатів
  const [drafts, setDrafts] = useState<any[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [draftSearch, setDraftSearch] = useState("");

  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [isDraftsExpanded, setIsDraftsExpanded] = useState(false);
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  const [isAiDragging, setIsAiDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
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
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => { },
  });

  const filteredDrafts = useMemo(() => {
    let result = [...drafts];
    if (draftSearch.trim()) {
      const search = draftSearch.toLowerCase();
      result = result.filter((d) => {
        const title = d.title?.toLowerCase() || "";
        const cargo = d.data?.cargoName?.toLowerCase() || "";
        const desc = d.data?.description?.toLowerCase() || "";
        const origins = d.data?.origins?.map((o: any) => (o.city || o.address).toLowerCase()).join(" ") || "";
        const destinations = d.data?.destinations?.map((o: any) => (o.city || o.address).toLowerCase()).join(" ") || "";

        return title.includes(search) ||
          cargo.includes(search) ||
          desc.includes(search) ||
          origins.includes(search) ||
          destinations.includes(search);
      });
    }
    // Сортування: закріплені зверху, потім по даті
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [drafts, draftSearch]);

  // Load drafts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("tender_cargo_drafts");
    if (saved) {
      try {
        setDrafts(JSON.parse(saved));
      } catch (e) {
        console.error("Помилка завантаження чернеток", e);
      }
    }
  }, []);

  // Save drafts to localStorage when they change
  useEffect(() => {
    if (drafts.length > 0) {
      localStorage.setItem("tender_cargo_drafts", JSON.stringify(drafts));
    } else {
      localStorage.removeItem("tender_cargo_drafts");
    }
  }, [drafts]);

  useEffect(() => {
    // Якщо аудіо-блоб змінився або видалився - скидаємо плейер
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, [audioBlob]);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
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
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioStream(null);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioBlob(null);
    } catch (err) {
      console.error("Помилка доступу до мікрофона", err);
      toast.error("Не вдалося отримати доступ до мікрофона");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleDictation = () => {
    if (isDictating) {
      setIsDictating(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Ваш браузер не підтримує розпізнавання мови");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "uk-UA"; // Можна додати вибір мови, але за замовчуванням UA
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsDictating(true);
      toast.info("Слухаю вас...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAiText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsDictating(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsDictating(false);
      if (event.error !== "no-speech") {
        toast.error("Помилка розпізнавання голосу");
      }
    };

    recognition.onend = () => {
      setIsDictating(false);
    };

    recognition.start();
  };

  const handleAiAnalyze = async () => {
    if (!aiText.trim() && aiFiles.length === 0 && !audioBlob) {
      toast.error("Введіть текст, додайте фото або запишіть голос для аналізу");
      return;
    }

    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append("text", aiText);
      aiFiles.forEach((file) => formData.append("images", file));
      if (audioBlob) {
        formData.append("audio", audioBlob, "voice_command.webm");
      }

      console.log('--- SENDING AI ANALYZE REQUEST ---', formData);
      
      const { data } = await api.post("/ai/logistics/parse-cargo", formData);

      if (data && data.loads && data.loads.length > 0) {
        setAiResults(data.loads);
        toast.success(`Знайдено заявок: ${data.loads.length}`);
      } else {
        toast.error("AI не зміг знайти дані у вашому запиті");
      }
    } catch (err) {
      console.error(err);
      toast.error("Помилка під час AI аналізу");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isValidDate = (dateStr: any) => {
    if (!dateStr || typeof dateStr !== "string") return false;
    const d = new Date(dateStr);
    return d instanceof Date && !isNaN(d.getTime());
  };

  const applyAiResult = (result: any, draftId?: string) => {
    if (!result) return;

    // Спершу очищаємо всі поля вантажу, щоб дані не змішувалися зі старими
    setValue("load_info", "");
    setValue("price", null);
    setValue("id_client", null);
    setCompanyLabel("");
    setValue("crm_load_trailer", []);
    setValue("is_collective", false);
    setValue("is_price_request", true);
    setValue("car_count_begin", 1);
    setValue("ids_valut", "UAH");
    // Не очищаємо id, щоб зберегти прив'язку якщо ми редагуємо існуючу заявку

    if (result.origins && result.origins.length > 0) {
      const newFrom = result.origins.map((loc: any, idx: number) => ({
        ...loc,
        address: loc.city || loc.address, // В інпут - лише місто
        ids_route_type: "LOAD_FROM",
        order_num: idx + 1,
      }));
      setValue("crm_load_route_from", newFrom as any);
    } else {
      setValue("crm_load_route_from", [{ address: "", ids_route_type: "LOAD_FROM", order_num: 1 }]);
    }

    if (result.destinations && result.destinations.length > 0) {
      const newTo = result.destinations.map((loc: any, idx: number) => ({
        ...loc,
        address: loc.city || loc.address, // В інпут - лише місто
        ids_route_type: "LOAD_TO",
        order_num: idx + 1,
      }));
      setValue("crm_load_route_to", newTo as any);
    } else {
      setValue("crm_load_route_to", [{ address: "", ids_route_type: "LOAD_TO", order_num: 1 }]);
    }

    if (result.price) {
      setValue("price", result.price);
      if (!result.isPriceRequest) {
        setValue("is_price_request", false);
      }
    }

    setValue("id_client", result.id_client || null);
    // Якщо є реальний ID клієнта (з чернетки), то ставимо лейбл.
    if (result.id_client) {
      setCompanyLabel(getCompanyName(result));
    } else if (result.companyName) {
      // Якщо є просто назва - можна підказати її менеджеру в info або залишити порожньою для ручного вибору
      // setCompanyLabel(result.companyName); // Можна розкоментувати, якщо хочемо підставляти назву без ID
    }

    if (result.currency) {
      const cur = result.currency.toUpperCase();
      const validCurrencies = valutList.map((v) => v.value);
      if (validCurrencies.includes(cur)) {
        setValue("ids_valut", cur);
      }
    }

    if (result.truckCount) {
      setValue("car_count_begin", result.truckCount);
    }

    if (result.isCollective !== undefined) {
      setValue("is_collective", result.isCollective);
    }

    if (result.isPriceRequest !== undefined) {
      setValue("is_price_request", result.isPriceRequest);
    }

    if (isValidDate(result.dateLoad)) {
      setValue("date_load", result.dateLoad);
    }
    if (isValidDate(result.dateLoad2)) {
      setValue("date_load2", result.dateLoad2);
    }
    if (isValidDate(result.dateUnload)) {
      setValue("date_unload", result.dateUnload);
    }

    // Трейлери (Truck Types)
    let mappedTrailers: { ids_trailer_type: string }[] = [];
    if (result.truckTypes && result.truckTypes.length > 0) {
      mappedTrailers = result.truckTypes
        .map((name: string) => {
          const found = truckList.find(
            (t) =>
              t.label.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(t.label.toLowerCase()),
          );
          return found ? { ids_trailer_type: found.value } : null;
        })
        .filter(Boolean) as { ids_trailer_type: string }[];
    }

    // Якщо нічого не знайшли або тип не вказано - ставимо "Крита" за замовчуванням
    if (mappedTrailers.length === 0) {
      const defaultTruck = truckList.find(
        (t) => t.label.toLowerCase() === "крита",
      );
      if (defaultTruck) {
        mappedTrailers = [{ ids_trailer_type: defaultTruck.value }];
      }
    }

    if (mappedTrailers.length > 0) {
      setValue("crm_load_trailer", mappedTrailers);
    }

    // Збираємо текстову інформацію про вантаж
    const infoParts = [];
    if (result.cargoName) infoParts.push(`Вантаж: ${result.cargoName}`);
    if (result.weight) infoParts.push(`Вага: ${result.weight}т`);
    if (result.volume) infoParts.push(`Об'єм: ${result.volume}м3`);
    if (result.description && result.description !== "null" && result.description !== "—")
      infoParts.push(result.description);

    const newInfo = infoParts.join(". ");
    if (newInfo) {
      // Тепер просто вставляємо, бо поле вже очищене на початку методу
      setValue("load_info", newInfo);
    }

    if (draftId) {
      setActiveDraftId(draftId);
    } else {
      setActiveDraftId(null);
    }


    setAiResults((prev) => prev.filter((r) => r !== result));
    if (aiResults.length <= 1) {
      setAiText("");
      setAiFiles([]);
    }
    toast.success("Дані завантажено у форму!");
  };

  const handleBulkSaveAiToDrafts = () => {
    const newDrafts = aiResults.map((res) => {
      const draftData = {
        origins: res.origins,
        destinations: res.destinations,
        price: res.price,
        currency: res.currency,
        truckCount: res.truckCount,
        isCollective: res.isCollective,
        isPriceRequest: res.isPriceRequest,
        dateLoad: res.dateLoad,
        dateUnload: res.dateUnload,
        cargoName: res.cargoName,
        description: res.description,
        companyName: res.companyName,
        truckTypes: res.truckTypes,
      };

      return {
        id: Math.random().toString(36).substring(2, 9),
        title: [
          ...(res.origins || []),
          ...(res.destinations || []),
        ]
          .map((loc) => loc.city || loc.address)
          .join(", "),
        data: draftData,
        createdAt: new Date().toISOString(),
      };
    });

    setDrafts((prev) => [...newDrafts, ...prev].slice(0, 20));

    setAiResults([]);
    setShowAiWarning(false);

    if (pendingAction === "submit" && pendingSubmitValues) {
      onSubmit(pendingSubmitValues);
    } else if (pendingAction === "reset") {
      reset();
      setCompanyLabel("");
      setActiveDraftId(null);
    }
    setPendingAction(null);
  };

  const handleDiscardAiResults = () => {
    setAiResults([]);
    setShowAiWarning(false);
    if (pendingAction === "submit" && pendingSubmitValues) {
      onSubmit(pendingSubmitValues);
    } else if (pendingAction === "reset") {
      reset();
      setCompanyLabel("");
      setActiveDraftId(null);
    }
    setPendingAction(null);
  };

  const saveToDrafts = (result: any) => {
    const newDraft = {
      id: Math.random().toString(36).substr(2, 9),
      title: [...(result.origins || []), ...(result.destinations || [])].map(loc => loc.city || loc.address).join(", "),
      data: result,
      createdAt: new Date().toISOString(),
      isPinned: false,
    };
    setDrafts((prev) => [newDraft, ...prev].slice(0, 20));
    setAiResults((prev) => prev.filter((r) => r !== result));
    toast.success("Збережено в чернетки");
  };

  const togglePinDraft = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, isPinned: !d.isPinned } : d));
  };

  const toggleSelectDraft = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedDraftIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDeleteDraft = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setConfirmDialog({
      open: true,
      title: "Видалити чернетку?",
      description: "Цю дію неможливо буде скасувати.",
      confirmText: "Видалити",
      variant: "danger",
      onConfirm: () => {
        setDrafts(prev => prev.filter(d => d.id !== id));
        setSelectedDraftIds(prev => prev.filter(item => item !== id));
        setConfirmDialog(prev => ({ ...prev, open: false }));
        toast.success("Чернетку видалено");
      }
    });
  };

  const handleDeleteSelectedDrafts = () => {
    setConfirmDialog({
      open: true,
      title: `Видалити обрані (${selectedDraftIds.length})?`,
      description: `Ви впевнені, що хочете видалити ${selectedDraftIds.length} чернеток?`,
      confirmText: "Видалити всі",
      variant: "danger",
      onConfirm: () => {
        setDrafts(prev => prev.filter(d => !selectedDraftIds.includes(d.id)));
        setSelectedDraftIds([]);
        setConfirmDialog(prev => ({ ...prev, open: false }));
        toast.success("Обрані чернетки видалено");
      }
    });
  };

  const handleDeleteAllDrafts = () => {
    setConfirmDialog({
      open: true,
      title: "Видалити ВСІ чернетки?",
      description: "Це видалить абсолютно всі збережені чернетки без можливості відновлення.",
      confirmText: "Видалити все",
      variant: "danger",
      onConfirm: () => {
        setDrafts([]);
        setSelectedDraftIds([]);
        setConfirmDialog(prev => ({ ...prev, open: false }));
        toast.success("Всі чернетки видалено");
      }
    });
  };

  const handleSaveCurrentToDrafts = () => {
    const values = form.getValues();
    // Перевіряємо чи є хоча б місто завантаження або розвантаження
    if (
      !values.crm_load_route_from?.[0]?.address &&
      !values.crm_load_route_to?.[0]?.address
    ) {
      toast.error("Будь ласка, вкажіть хоча б маршрут для збереження");
      return;
    }

    const draftData = {
      origins: values.crm_load_route_from,
      destinations: values.crm_load_route_to,
      price: values.price,
      currency: values.ids_valut,
      truckCount: values.car_count_begin,
      isCollective: values.is_collective,
      isPriceRequest: values.is_price_request,
      dateLoad: values.date_load,
      dateUnload: values.date_unload,
      cargoName: values.load_info?.split("\n")?.[0]?.replace("Вантаж: ", ""),
      description: values.load_info,
      id_client: values.id_client,
      companyName: companyLabel,
      truckTypes: values.crm_load_trailer
        ?.map((t: any) => {
          const found = truckList.find((tl) => tl.value === t.ids_trailer_type);
          return found ? found.label : null;
        })
        .filter(Boolean),
    };

    saveToDrafts(draftData);
    // handleManualReset(); // Очищаємо форму після збереження в чернетку
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEndFrom = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fromFields.findIndex((f) => f.id === active.id);
      const newIndex = fromFields.findIndex((f) => f.id === over.id);
      moveFrom(oldIndex, newIndex);

      // Оновлюємо order_num після переміщення
      setTimeout(() => {
        const currentFields = form.getValues("crm_load_route_from");
        currentFields.forEach((_, i) => {
          setValue(`crm_load_route_from.${i}.order_num`, i + 1);
        });
      }, 0);
    }
  };

  const handleDragEndTo = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = toFields.findIndex((f) => f.id === active.id);
      const newIndex = toFields.findIndex((f) => f.id === over.id);
      moveTo(oldIndex, newIndex);

      // Оновлюємо order_num після переміщення
      setTimeout(() => {
        const currentFields = form.getValues("crm_load_route_to");
        currentFields.forEach((_, i) => {
          setValue(`crm_load_route_to.${i}.order_num`, i + 1);
        });
      }, 0);
    }
  };

  return (
    <div className="pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: AI ASSISTANT (4 cols) */}
        {!defaultValues && !copyId && (
          <div className="lg:col-span-4 space-y-4 order-1">
            {/* Mobile Header for AI */}
            <button
              onClick={() => setIsAiExpanded(!isAiExpanded)}
              className="lg:hidden w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden relative"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-xl">
                  <Sparkles className="text-white w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">AI Помічник</h3>
                  <p className="text-[10px] text-slate-500">
                    {aiFiles.length > 0 || aiText ? "Данні додано" : "Вставити текст або фото"}
                  </p>
                </div>
              </div>
              {isAiExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>

            <div className={cn(
              "space-y-4 lg:block animate-in fade-in duration-300",
              isAiExpanded ? "block" : "hidden"
            )}>
              <div
                className={cn(
                  "bg-gradient-to-br from-indigo-50/50 to-fuchsia-50/50 dark:from-indigo-950/10 dark:to-fuchsia-950/10 backdrop-blur-md border border-indigo-200/50 dark:border-indigo-500/20 p-6 rounded-[2rem] shadow-sm relative overflow-hidden transition-all duration-300",
                  isAiDragging && "ring-4 ring-indigo-500 ring-inset scale-[1.02]"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsAiDragging(true);
                }}
                onDragLeave={() => setIsAiDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsAiDragging(false);
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                  if (files.length > 0) {
                    setAiFiles(prev => [...prev, ...files]);
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
                    <span className="mt-4 text-indigo-700 dark:text-indigo-300 font-black uppercase tracking-widest text-sm">Перетягніть фото сюди</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-5 lg:flex hidden">
                  <Sparkles className="text-indigo-500 w-5 h-5" />
                  <h3 className="font-bold text-slate-800 dark:text-white">AI Помічник</h3>
                </div>

                <div
                  className="space-y-4"
                  onPaste={(e) => {
                    const items = e.clipboardData.items;
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].type.indexOf("image") !== -1) {
                        const file = items[i].getAsFile();
                        if (file) {
                          setAiFiles((prev) => [...prev, file]);
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
                          <Trash2 size={12} />
                          Очистити все
                        </button>
                        {aiFiles.map((file, idx) => {
                          const url = URL.createObjectURL(file);
                          return (
                            <div key={idx} className="relative w-20 aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group/img animate-in zoom-in-95">
                              <img src={url} alt="preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setAiFiles((prev) => prev.filter((_, i) => i !== idx))}
                                className="absolute top-1 right-1 bg-red-500/80 p-1 rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                              >
                                <X size={10} className="text-white" />
                              </button>
                            </div>
                          );
                        })}
                        <label className="w-20 aspect-square rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-500/20 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-colors">
                          <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => {
                            if (e.target.files) {
                              setAiFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                              setAiText("");
                            }
                          }} />
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
                              <X size={18} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleDictation}
                            className={cn(
                              "transition-all",
                              isDictating ? "text-red-500 animate-pulse" : "text-slate-300 hover:text-indigo-500"
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
                      <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => {
                        if (e.target.files) setAiFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                      }} />
                      <UploadCloud className="text-slate-400 w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Фото</span>
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
                            : "border-dashed border-slate-200 dark:border-white/10 text-slate-400 hover:border-indigo-500 hover:bg-indigo-50/30"
                      )}
                    >
                      {isRecording ? (
                        <div className="flex flex-col items-center justify-center w-full">
                          <VoiceVisualizer stream={audioStream} />
                          <div className="flex items-center gap-2 mt-1">
                            <Square size={14} className="animate-pulse" />
                            <span className="text-[10px] font-bold uppercase">
                              {Math.floor(recordingDuration / 60)}:
                              {String(recordingDuration % 60).padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                      ) : audioBlob ? (
                        <div className="flex flex-col items-center justify-center w-full">
                          <div className="flex items-center gap-2 mb-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isPlaying) {
                                  audioRef.current?.pause();
                                  setIsPlaying(false);
                                } else {
                                  if (!audioRef.current) {
                                    audioRef.current = new Audio(URL.createObjectURL(audioBlob));
                                    audioRef.current.onended = () => setIsPlaying(false);
                                  }
                                  audioRef.current.play();
                                  setIsPlaying(true);
                                }
                              }}
                              className="p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                            >
                              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                            </button>
                            <Volume2 size={12} className="text-slate-400" />
                            <span className="text-[10px] font-bold uppercase truncate max-w-[60px]">Аудіо</span>
                          </div>

                          <button
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
                          <span className="text-[10px] font-bold uppercase">Голос</span>
                        </>
                      )}
                    </button>
                    <AppButton
                      onClick={handleAiAnalyze}
                      isLoading={isAnalyzing}
                      disabled={isAnalyzing || (!aiText.trim() && aiFiles.length === 0 && !audioBlob)}
                      className="flex-[2] bg-indigo-600 shadow-indigo-600/20 shadow-lg !rounded-2xl"
                      leftIcon={<Zap size={16} />}
                    >
                      Аналізувати
                    </AppButton>
                  </div>
                </div>
              </div>

              {/* Found results list - sticky/scrollable */}
              {aiResults.length > 0 && (
                <div className="space-y-4 animate-in slide-in-from-left-4 duration-500">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="text-indigo-500 w-4 h-4" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Знайдені ({aiResults.length})</h4>
                    </div>
                    {aiResults.length > 1 && (
                      <button
                        onClick={handleBulkSaveAiToDrafts}
                        className="text-[9px] font-black text-indigo-500 uppercase hover:underline"
                      >
                        Зберегти всі
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                    {aiResults.map((res, i) => (
                      <LoadPreviewCard
                        key={i}
                        data={res}
                        onApply={() => applyAiResult(res)}
                        onSave={() => saveToDrafts(res)}
                        onDelete={() => setAiResults((prev) => prev.filter((r) => r !== res))}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DRAFTS SECTION (Below AI on desktop, below AI on mobile) */}
            <div className="space-y-4">
              {/* Mobile Header for Drafts */}
              <button
                onClick={() => setIsDraftsExpanded(!isDraftsExpanded)}
                className="lg:hidden w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm mt-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <ClipboardList className="text-slate-500 w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Чернетки ({drafts.length})</h3>
                </div>
                {isDraftsExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              <div className={cn(
                "space-y-4 lg:block animate-in fade-in duration-300",
                isDraftsExpanded ? "block" : "hidden"
              )}>
                <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 p-5 rounded-[2rem] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ваші чернетки</h4>
                    <div className="flex gap-2">
                      {selectedDraftIds.length > 0 && (
                        <button onClick={handleDeleteSelectedDrafts} className="text-[9px] text-red-500 font-bold uppercase hover:underline">Видалити обрані</button>
                      )}
                      {drafts.length > 0 && (
                        <button onClick={handleDeleteAllDrafts} className="text-[9px] text-zinc-400 font-bold uppercase hover:text-red-500">Очистити</button>
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
                        <LoadPreviewCard
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
                        <p className="text-xs font-bold">Чернеток немає</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* MIDDLE COLUMN: MAIN FORM (5-8 cols) */}
        <div className={cn(
          "space-y-6 order-3 lg:order-2",
          (!defaultValues && !copyId) ? "lg:col-span-8" : "lg:col-span-12"
        )}>
          <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 p-4 sm:p-8 rounded-[2.5rem] shadow-sm">
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
                    onClick={handleSaveCurrentToDrafts}
                    className="text-indigo-500 hover:text-indigo-600 h-8 px-2 flex items-center gap-1.5"
                    leftIcon={<Save size={14} />}
                  >
                    Зберегти в чернетку
                  </AppButton>
                  <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10 mx-1" />
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputDate
                    name="date_load"
                    control={control}
                    label="Дата завантаження (з)"
                    required
                  />
                  <InputDate
                    name="date_load2"
                    control={control}
                    label="Дата завантаження (по)"
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
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEndFrom}
                    >
                      <SortableContext
                        items={fromFields.map((f) => f.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {fromFields.map((field, idx) => (
                          <SortableRouteItem
                            key={field.id}
                            id={field.id}
                            onRemove={() => removeFrom(idx)}
                            showRemove={fromFields.length > 1}
                          >
                            <FormField
                              control={control}
                              name={`crm_load_route_from.${idx}.address`}
                              render={({ field: formField }) => (
                                <FormItem>
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
                                          ids_country: loc.countryCode,
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
                                  {(watch(`crm_load_route_from.${idx}.street`) || watch(`crm_load_route_from.${idx}.house`)) && (
                                    <div className="grid grid-cols-12 gap-2 mt-2">
                                      <div className="col-span-8">
                                        <InputText
                                          name={`crm_load_route_from.${idx}.street`}
                                          control={control}
                                          label="Вулиця"
                                        />
                                      </div>
                                      <div className="col-span-4">
                                        <InputText
                                          name={`crm_load_route_from.${idx}.house`}
                                          control={control}
                                          label="Буд."
                                        />
                                      </div>
                                    </div>
                                  )}
                                  <FormMessage className="text-[10px] uppercase font-bold" />
                                </FormItem>
                              )}
                            />
                          </SortableRouteItem>
                        ))}
                      </SortableContext>
                    </DndContext>
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
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEndTo}
                    >
                      <SortableContext
                        items={toFields.map((f) => f.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {toFields.map((field, idx) => (
                          <SortableRouteItem
                            key={field.id}
                            id={field.id}
                            onRemove={() => removeTo(idx)}
                            showRemove={toFields.length > 1}
                          >
                            <FormField
                              control={control}
                              name={`crm_load_route_to.${idx}.address`}
                              render={({ field: formField }) => (
                                <FormItem>
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
                                          ids_country: loc.countryCode,
                                          city: loc.city,
                                          ids_region: loc.regionCode,
                                          street: loc.street,
                                          house: loc.house,
                                          post_code: loc.postCode,
                                          order_num: idx + 1,
                                          ids_route_type: "LOAD_TO",
                                        };
                                        Object.entries(data).forEach(([k, v]) =>
                                          setValue(
                                            `crm_load_route_to.${idx}.${k}` as any,
                                            v,
                                          ),
                                        );
                                        clearErrors(
                                          `crm_load_route_to.${idx}.address`,
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  {(watch(`crm_load_route_to.${idx}.street`) || watch(`crm_load_route_to.${idx}.house`)) && (
                                    <div className="grid grid-cols-12 gap-2 mt-2">
                                      <div className="col-span-8">
                                        <InputText
                                          name={`crm_load_route_to.${idx}.street`}
                                          control={control}
                                          label="Вулиця"
                                        />
                                      </div>
                                      <div className="col-span-4">
                                        <InputText
                                          name={`crm_load_route_to.${idx}.house`}
                                          control={control}
                                          label="Буд."
                                        />
                                      </div>
                                    </div>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </SortableRouteItem>
                        ))}
                      </SortableContext>
                    </DndContext>
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
      </div>

      <Dialog open={showAiWarning} onOpenChange={setShowAiWarning}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-none rounded-[2.5rem] p-8 shadow-2xl">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-4">
              <BrainCircuit className="text-amber-500 w-8 h-8" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-slate-800 dark:text-white mb-2">
              У вас є незбережені АІ результати!
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 dark:text-slate-400 text-sm">
              Ви виявили {aiResults.length} {aiResults.length === 1 ? 'варіант' : 'варіанти'} перевезень через AI, які ще не були перенесені до чернеток чи використані. Бажаєте зберегти їх перед виходом?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <AppButton
              onClick={handleBulkSaveAiToDrafts}
              className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 shadow-lg h-12 rounded-2xl font-bold"
              leftIcon={<Save size={18} />}
            >
              Зберегти всі в чернетки
            </AppButton>
            <div className="grid grid-cols-2 gap-3">
              <AppButton
                variant="ghost"
                onClick={handleDiscardAiResults}
                className="h-12 rounded-2xl font-bold text-slate-400 hover:text-red-500 hover:bg-red-50"
              >
                Видалити
              </AppButton>
              <AppButton
                variant="ghost"
                onClick={() => setShowAiWarning(false)}
                className="h-12 rounded-2xl font-bold text-slate-500"
              >
                Скасувати
              </AppButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialog.open} onOpenChange={(val) => setConfirmDialog(prev => ({ ...prev, open: val }))}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-slate-900 border-none rounded-[2rem] p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800 dark:text-white">
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <AppButton
              variant="ghost"
              onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
              className="flex-1 h-11 rounded-xl font-bold text-slate-400"
            >
              Скасувати
            </AppButton>
            <AppButton
              onClick={confirmDialog.onConfirm}
              className={cn(
                "flex-1 h-11 rounded-xl font-bold text-white shadow-lg",
                confirmDialog.variant === "danger" ? "bg-red-500 shadow-red-500/20 hover:bg-red-600" : "bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700"
              )}
            >
              {confirmDialog.confirmText || "Підтвердити"}
            </AppButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}