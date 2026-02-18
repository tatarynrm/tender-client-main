"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Building2, MapPin, Fingerprint, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { Form } from "@/shared/components/ui";
import { InputText } from "@/shared/components/Inputs/InputText";
import { InputSwitch } from "@/shared/components/Inputs/InputSwitch";
import { AppButton } from "@/shared/components/Buttons/AppButton";
import { useAdminCompanies } from "@/features/admin/hooks/useAdminCompanies";

/* =======================
   SCHEMA
======================= */
const companySchema = z.object({
  company_name: z.string().min(2, "Назва занадто коротка"),
  edrpou: z.string().min(8, "ЄДРПОУ має бути від 8 символів"),
  address: z.string(),
  is_carrier: z.boolean(),
  is_client: z.boolean(),
  is_expedition: z.boolean(),
  is_blocked: z.boolean(),
  black_list: z.boolean(),
});

export type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyFormProps {
  defaultValues?: Partial<CompanyFormValues> & { id?: string };
}

export default function SaveCompanyForm({ defaultValues }: CompanyFormProps) {
  const { createCompany, isCreating } = useAdminCompanies();
  const router = useRouter();
  const isEditMode = !!defaultValues?.id;

  // Мемоізовані дефолтні значення, гарантуємо, що нічого не буде undefined
  const initialValues: CompanyFormValues = useMemo(
    () => ({
      company_name: defaultValues?.company_name ?? "",
      edrpou: defaultValues?.edrpou ?? "",
      address: defaultValues?.address ?? "",
      is_carrier: defaultValues?.is_carrier ?? false,
      is_client: defaultValues?.is_client ?? false,
      is_expedition: defaultValues?.is_expedition ?? false,
      is_blocked: defaultValues?.is_blocked ?? false,
      black_list: defaultValues?.black_list ?? false,
    }),
    [defaultValues],
  );

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: initialValues,
    mode: "onTouched",
  });

  const { control, handleSubmit, reset } = form;

  // Синхронізація при зміні defaultValues
  useEffect(() => {
    if (defaultValues) {
      reset(initialValues);
    }
  }, [defaultValues, initialValues, reset]);

  const onSubmit: SubmitHandler<CompanyFormValues> = async (values) => {
    const payload = isEditMode ? { ...values, id: defaultValues?.id } : values;

    await createCompany(payload, {
      onSuccess: () => {
        toast.success(isEditMode ? "Компанію оновлено" : "Компанію створено");
        router.push("/admin/companies");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Помилка при збереженні");
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Основна інформація */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Building2 size={18} />
              <span className="font-bold text-sm uppercase tracking-wider">
                Основна інформація
              </span>
            </div>

            <InputText
              name="company_name"
              control={control}
              label="Назва компанії"
            />

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
          </div>

          {/* Ролі компанії */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck size={18} />
              <span className="font-bold text-sm uppercase tracking-wider">
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

          {/* Статус безпеки */}
          <div className="bg-red-50/50 dark:bg-red-900/10 p-6 rounded-[1.5rem] border border-red-100 dark:border-red-900/30 space-y-4">
            <span className="font-bold text-sm uppercase tracking-wider text-red-600">
              Обмеження
            </span>
            <div className="flex gap-8">
              <InputSwitch
                name="is_blocked"
                control={control}
                label="Заблокована"
              />
              <InputSwitch
                name="black_list"
                control={control}
                label="Чорний список"
              />
            </div>
          </div>

          {/* Кнопка */}
          <div className="flex justify-end pt-4">
            <AppButton
              variant="primary"
              type="submit"
              isLoading={isCreating}
              className="px-12 h-12 shadow-lg"
            >
              {isEditMode ? "Оновити дані" : "Створити компанію"}
            </AppButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
