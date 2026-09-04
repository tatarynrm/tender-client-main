"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  Fingerprint,
  ShieldCheck,
  Globe,
  Info,
  Star,
  Search,
  Loader2,
  X,
  Layers,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Form } from "@/shared/components/ui";
import { InputText } from "@/shared/components/Inputs/InputText";
import { InputSwitch } from "@/shared/components/Inputs/InputSwitch";
import { AppButton } from "@/shared/components/Buttons/AppButton";
import { useAdminCompanies } from "@/features/admin/hooks/useAdminCompanies";
import { ICompany } from "@/features/admin/types/company.types";
import { InputMultiSelect } from "@/shared/components/Inputs/InputMultiSelect";
import { InputSelect } from "@/shared/components/Inputs/InputSelect";
import { useDebounce } from "@/shared/hooks/useDebounce";
import api from "@/shared/api/instance.api";
const websiteRegex =
  /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

const tenderMemberSchema = z
  .union([z.enum(["ALL", "CARRIER", "MANAGER"]), z.literal("")])
  .nullable()
  .optional();

/* ======================= 
    SCHEMA 
======================= */
const companySchema = z.object({
  edrpou: z.string().min(8, "ЄДРПОУ має бути від 8 символів"),
  // Дозволяємо null або пустий рядок, щоб схема не "падала"
  address: z.string().nullable().optional(),
  web_site: z
    .string()
    .nullable() // Дозволяємо null, якщо з бази прийде null
    .optional() // Дозволяємо не заповнювати
    .refine((val) => !val || websiteRegex.test(val), {
      message:
        "Введіть коректну адресу сайту (напр. example.com або https://site.ua)",
    }),
  ids_carrier_rating: z.enum(["MAIN", "MEDIUM", "IMPORTANT"]),
  // Булеві значення зазвичай обов'язкові
  is_carrier: z.boolean(),
  is_client: z.boolean(),
  is_expedition: z.boolean(),
  company_form: z.string().nullable().optional(),
  company_name: z.string().min(2, "Назва занадто коротка"),
  company_name_full: z.string().min(2, "Назва занадто коротка"),
  ids_country: z.string().nullable().optional(),
  ids_members_exp: tenderMemberSchema,
  ids_members_imp: tenderMemberSchema,
  ids_members_reg: tenderMemberSchema,
});
type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyFormProps {
  // Тепер використовуємо чіткий інтерфейс
  defaultValues?: ICompany;
}
// Опції для селекту
const carrierRatingOptions = [
  { label: "MAIN (Основний)", value: "MAIN" },
  { label: "MEDIUM (Середній)", value: "MEDIUM" },
  { label: "IMPORTANT (Важливий)", value: "IMPORTANT" },
];

const tenderMemberOptions = [
  { label: "ALL (Всі)", value: "ALL" },
  { label: "CARRIER (Перевізники)", value: "CARRIER" },
  { label: "MANAGER (Менеджери)", value: "MANAGER" },
];

export default function SaveCompanyForm({ defaultValues }: CompanyFormProps) {
  const { createCompany, isCreating } = useAdminCompanies();
  const router = useRouter();
  const isEditMode = !!defaultValues?.id;

  // МАПІНГ: Серверний JSON -> Форма
  const initialValues = useMemo<CompanyFormValues>(
    () => ({
      company_name: defaultValues?.company_name ?? "",
      company_name_full: defaultValues?.company_name_full ?? "", // Додано
      company_form: defaultValues?.company_form ?? "", // Додано
      edrpou: defaultValues?.edrpou ?? defaultValues?.company_edrpou ?? "", // Враховуємо можливість отримати edrpou з company
      address: defaultValues?.address
        ? defaultValues.address.replace(/[\r\n]+/g, ", ")
        : "",
      web_site: defaultValues?.web_site ?? "",
      is_carrier:
        !!defaultValues?.is_carrier || !!defaultValues?.company_carrier, // Враховуємо можливість отримати is_carrier з company
      is_client: !!defaultValues?.is_client || !!defaultValues?.company_client, // Враховуємо можливість отримати is_client з company
      is_expedition:
        defaultValues?.is_expedition ??
        defaultValues?.company_expedition ??
        false, // Враховуємо можливість отримати is_expedition з company
      is_blocked: !!defaultValues?.is_blocked, // Додано
      black_list: !!defaultValues?.black_list, // Додано
      ids_country: defaultValues?.ids_country ?? "UA",
      ids_carrier_rating: defaultValues?.ids_carrier_rating ?? "MAIN",
      ids_members_exp: defaultValues?.ids_members_exp ?? null,
      ids_members_imp: defaultValues?.ids_members_imp ?? null,
      ids_members_reg: defaultValues?.ids_members_reg ?? null,
    }),
    [defaultValues],
  );

  const form = useForm<CompanyFormValues>({
    mode: "onTouched",
    resolver: zodResolver(companySchema),
    defaultValues: initialValues,
  });

  const { control, handleSubmit, reset, setValue } = form;

  useEffect(() => {
    if (defaultValues) reset(initialValues);
  }, [initialValues, reset, defaultValues]);

  /* =======================
     ORACLE: пошук компанії за ЄДРПОУ + автозаповнення форми.
     Використовує публічний ендпоінт GET /oracle/search-company?edrpou=,
     що шукає в реєстрі Oracle (таблиця ur) за zkpo. Той самий патерн, що й
     у формі реєстрації перевізника.
  ======================= */
  const [oracleQuery, setOracleQuery] = useState("");
  const [oracleOptions, setOracleOptions] = useState<any[]>([]);
  const [oracleOpen, setOracleOpen] = useState(false);
  const [oracleLoading, setOracleLoading] = useState(false);
  const oracleBoxRef = useRef<HTMLDivElement>(null);
  const debouncedOracleQuery = useDebounce(oracleQuery, 400);

  // Закриття випадаючого списку при кліку поза межами
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        oracleBoxRef.current &&
        !oracleBoxRef.current.contains(e.target as Node)
      ) {
        setOracleOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const q = debouncedOracleQuery?.trim();
    // Цифри → ЄДРПОУ (від 8), текст → назва (від 3 символів).
    const isNumeric = !!q && /^\d+$/.test(q);
    const tooShort = !q || (isNumeric ? q.length < 8 : q.length < 3);
    if (!q || tooShort || q.length > 60) {
      setOracleOptions([]);
      setOracleOpen(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setOracleLoading(true);
      try {
        const { data } = await api.get(
          `/oracle/search-company?edrpou=${encodeURIComponent(q)}`,
        );
        if (cancelled) return;
        setOracleOptions(Array.isArray(data) ? data : []);
        setOracleOpen((Array.isArray(data) ? data : []).length > 0);
      } catch (err) {
        if (!cancelled) {
          console.error("Oracle search-company error:", err);
          setOracleOptions([]);
          setOracleOpen(false);
        }
      } finally {
        if (!cancelled) setOracleLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedOracleQuery]);

  // Автозаповнення форми з обраної компанії Oracle:
  // zkpo → ЄДРПОУ, nur → назви, nadr → адреса.
  const handleSelectOracleCompany = (company: any) => {
    const opts = { shouldValidate: true, shouldDirty: true } as const;
    const name = company.nur || company.fo || "";
    if (company.zkpo) setValue("edrpou", String(company.zkpo), opts);
    if (name) {
      setValue("company_name", name, opts);
      setValue("company_name_full", name, opts);
    }
    if (company.nadr)
      setValue("address", String(company.nadr).replace(/[\r\n]+/g, ", "), opts);
    setOracleOpen(false);
    setOracleQuery("");
    toast.success("Дані компанії підставлено з Oracle");
  };

  const onSubmit: SubmitHandler<CompanyFormValues> = async (values) => {
    try {
      const sanitizedValues = {
        ...values,
        ids_members_exp: values.ids_members_exp || null,
        ids_members_imp: values.ids_members_imp || null,
        ids_members_reg: values.ids_members_reg || null,
      };
      const payload = isEditMode
        ? { ...sanitizedValues, id: defaultValues.id }
        : sanitizedValues;

      await createCompany(payload, {
        onSuccess: () => {
          toast.success(isEditMode ? "Дані оновлено" : "Компанію створено");
          router.push("/admin/companies");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Помилка збереження");
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Виведення повної назви для контексту (якщо це редагування) */}
      {isEditMode && defaultValues?.company_name_full && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl flex gap-3 items-start">
          <Info className="text-blue-500 mt-1" size={18} />
          <div>
            <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
              Повна назва (з реєстру)
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {defaultValues.company_name_full}
            </p>
          </div>
        </div>
      )}

      <Form<CompanyFormValues> {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ORACLE: пошук компанії за ЄДРПОУ для автозаповнення */}
          <div
            ref={oracleBoxRef}
            className="relative bg-indigo-50/40 dark:bg-indigo-500/5 p-6 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-500/20 space-y-3"
          >
            <div className="flex items-center gap-2 text-indigo-600">
              <Search size={18} />
              <span className="font-bold text-[10px] uppercase tracking-wider">
                Пошук компанії в Oracle
              </span>
            </div>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">
              Введіть ЄДРПОУ (від 8 цифр) або назву компанії (від 3 символів),
              оберіть зі списку — поля нижче заповняться автоматично.
            </p>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                {oracleLoading ? (
                  <Loader2 size={18} className="animate-spin text-indigo-600" />
                ) : (
                  <Search size={18} strokeWidth={2.2} />
                )}
              </div>
              <input
                value={oracleQuery}
                onChange={(e) => setOracleQuery(e.target.value)}
                onFocus={() => oracleOptions.length > 0 && setOracleOpen(true)}
                placeholder="ЄДРПОУ або назва компанії"
                className="w-full h-12 pl-12 pr-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[13px] font-medium outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 transition-all"
              />
              {oracleQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setOracleQuery("");
                    setOracleOptions([]);
                    setOracleOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <X size={14} />
                </button>
              )}

              {oracleOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[100] overflow-hidden max-h-[280px] overflow-y-auto custom-scrollbar">
                  {oracleOptions.length > 0 ? (
                    oracleOptions.map((c, idx) => (
                      <div
                        key={`${c.kod ?? c.zkpo ?? idx}`}
                        onClick={() => handleSelectOracleCompany(c)}
                        className="px-4 py-3 cursor-pointer border-b border-zinc-50 dark:border-zinc-900/50 last:border-none hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                      >
                        <div className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                          {c.nur || c.fo || "—"}
                        </div>
                        <div className="flex gap-3 text-[11px] text-slate-500 mt-0.5">
                          <span>ЄДРПОУ: {c.zkpo}</span>
                          {c.nadr && (
                            <span className="truncate">{c.nadr}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-[11px] uppercase tracking-[0.2em] font-bold text-slate-400">
                      {oracleLoading ? "Пошук..." : "Компанію не знайдено"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Building2 size={18} />
              <span className="font-bold text-[10px] uppercase tracking-wider">
                Основна інформація
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <InputText
                name="company_form"
                control={control}
                label={`Форма власності ФОП/ТОВ`}
              />
              <InputText
                name="company_name"
                control={control}
                label={`Коротка назва компанії`}
              />
              <InputText
                name="company_name_full"
                control={control}
                label={`Повна назва компанії`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputText
                name="edrpou"
                control={control}
                label="ЄДРПОУ / ІПН"
                icon={Fingerprint}
              />
              <InputText
                name="address"
                control={control}
                label="Юридична адреса"
                icon={MapPin}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputSelect
                name="ids_carrier_rating"
                control={control}
                label="Рейтинг перевізника"
                options={carrierRatingOptions}
                icon={Star}
                required
              />
            </div>
            <InputText
              name="web_site"
              control={control}
              label="Веб-сайт"
              icon={Globe}
            />
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck size={18} />
              <span className="font-bold text-[10px] uppercase tracking-wider">
                Ролі компанії
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputSwitch
                name="is_carrier"
                control={control}
                label="Перевізник"
              />
              <InputSwitch name="is_client" control={control} label="Клієнт" />
              <InputSwitch
                name="is_expedition"
                control={control}
                label="Експедиція"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <Layers size={18} />
                <span className="font-bold text-[10px] uppercase tracking-wider">
                  Учасники тендерів (Експорт / Імпорт / Регіональні)
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                За замовчуванням пусто
              </span>
            </div>

            <p className="text-[12px] text-slate-500 dark:text-slate-400">
              Виберіть види учасників для участі у відповідних напрямках тендерів (EXP / IMP / REG). За замовчуванням значення не обрано.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputSelect
                name="ids_members_exp"
                control={control}
                label="Експорт (EXP)"
                options={tenderMemberOptions}
                icon={Send}
                clearable
              />
              <InputSelect
                name="ids_members_imp"
                control={control}
                label="Імпорт (IMP)"
                options={tenderMemberOptions}
                icon={Globe}
                clearable
              />
              <InputSelect
                name="ids_members_reg"
                control={control}
                label="Регіональні (REG)"
                options={tenderMemberOptions}
                icon={MapPin}
                clearable
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <AppButton
              variant="primary"
              type="submit"
              isLoading={isCreating}
              className="px-12 h-12 shadow-lg"
            >
              {isEditMode ? "Зберегти зміни" : "Створити компанію"}
            </AppButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
