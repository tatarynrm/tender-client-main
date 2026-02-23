"use client";

import React, { useEffect, useMemo } from "react";
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
const websiteRegex =
  /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

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
    }),
    [defaultValues],
  );

  const form = useForm<CompanyFormValues>({
    mode: "onTouched",
    resolver: zodResolver(companySchema),
    defaultValues: initialValues,
  });

  const { control, handleSubmit, reset } = form;

  useEffect(() => {
    if (defaultValues) reset(initialValues);
  }, [initialValues, reset, defaultValues]);

  const onSubmit: SubmitHandler<CompanyFormValues> = async (values) => {
    try {
      const payload = isEditMode ? { ...values, id: defaultValues.id } : values;

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
