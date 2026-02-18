"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  User,
  Mail,
  ShieldCheck,
  Building2,
  Lock,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";

import {
  Form,
  FormField,
  FormItem,
  FormMessage,
  PhoneInput,
} from "@/shared/components/ui";
import { InputSwitch } from "@/shared/components/Inputs/InputSwitch";
import { AppButton } from "@/shared/components/Buttons/AppButton";
import { InputText } from "@/shared/components/Inputs/InputText";
import { InputAsyncSelectCompany } from "@/shared/components/Inputs/InputAsyncSelectCompany";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import { id } from "date-fns/locale";
import { useRouter } from "next/navigation";

/* =======================
   SCHEMA
======================= */
const userSchema = z.object({
  email: z.string().email({ message: "Некоректний формат email" }),

  id_company: z
    .number({
      message: "Оберіть компанію зі списку",
    })
    .min(1, { message: "Будь ласка, оберіть компанію" }),

  person: z.object({
    name: z.string().min(1, { message: "Ім'я є обов'язковим" }),
    surname: z.string().min(1, { message: "Прізвище є обов'язковим" }),

    // Залишаємо суворо: або рядок, або null (без автоматичних значень)
    last_name: z.string({ message: "По батькові має бути рядком" }).nullable(),

    ids_sex: z.enum(["M", "W"], { message: "Вкажіть стать" }),

    person_role: z.object({
      is_admin: z.boolean({ message: "Вкажіть права адміністратора" }),
      is_manager: z.boolean({ message: "Вкажіть права менеджера" }),
    }),

    person_phone: z
      .array(
        z.object({
          phone: z
            .string()
            .refine((value) => value && value.length > 0, {
              message: "Номер телефону обов'язковий",
            })
            .refine((value) => isValidPhoneNumber(value), {
              message: "Некоректний формат номера",
            }),
          is_viber: z.boolean(),
          is_telegram: z.boolean(),
          is_whatsapp: z.boolean(),
        }),
      )
      .min(1, { message: "Додайте хоча б один номер телефону" }),
  }),
});

export type UserFormValues = z.infer<typeof userSchema>;

/* =======================
   COMPONENT
======================= */

interface UserFormProps {
  defaultValues?: any;
}

export default function UserForm({ defaultValues }: UserFormProps) {
  const { saveUser, isSaving } = useAdminUsers();
  const router = useRouter();
  // Визначаємо, чи ми редагуємо, чи створюємо
  const isEditMode = !!defaultValues?.id;
  // 1. Ініціалізація форми з використанням useMemo (як у CargoForm)
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    mode: "onTouched",
    defaultValues: useMemo(
      () => ({
        email: "",
        id_company: 0,

        person: {
          name: "",
          surname: "",
          last_name: "",
          ids_sex: "M",
          person_role: { is_admin: false, is_manager: false },
          person_phone: [
            {
              phone: "",
              is_viber: false,
              is_telegram: false,
              is_whatsapp: false,
            },
          ],
        },
        ...defaultValues,
      }),
      [defaultValues],
    ),
  });

  const { control, handleSubmit, reset, formState } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "person.person_phone",
  });

  // 2. Ефект для синхронізації (як у CargoForm)
  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        // Явне приведення типів для вкладених об'єктів
        person: {
          ...defaultValues.person,
          person_role: {
            is_admin: !!defaultValues.person?.person_role?.is_admin,
            is_manager: !!defaultValues.person?.person_role?.is_manager,
          },
          person_phone: defaultValues.person?.person_phone?.length
            ? defaultValues.person.person_phone
            : [
                {
                  phone: "",
                  is_viber: false,
                  is_telegram: false,
                  is_whatsapp: false,
                },
              ],
        },
      });
    }
  }, [defaultValues, reset]);

  const onSubmit: SubmitHandler<UserFormValues> = (values) => {
    const payload = {
      ...values,
      id_person: defaultValues?.person?.id || null,
      person: {
        id: defaultValues?.person?.id || null,
        ...values.person,
      },
      ...(isEditMode && { id: defaultValues.id }),
    };

    // Викликаємо мутацію
    saveUser(payload, {
      onSuccess: (data) => {
        // 1. Логіка специфічна для цієї сторінки/форми
        toast.success(isEditMode ? "Оновлено!" : "Створено!");

        if (!isEditMode) {
          reset(); // Очистити форму тільки при створенні
        }

        router.push("/admin/users"); // Редірект
      },
      onError: (error) => {
        // Специфічна обробка помилок форми (наприклад, встановити помилки в поля)
        // setError('email', { message: 'Цей email вже зайнятий' });
      },
    });
  };

  useEffect(() => {
    if (formState.errors) {
      console.log("Form errors:", formState.errors);
    }
  }, [formState.errors]); // Слідкуємо за змінами форми для дебагу

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Секція 1: Акаунт */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-500">
              <ShieldCheck size={18} />
              <span className="font-bold text-sm uppercase text-[10px] tracking-wider">
                Акаунт та Компанія
              </span>
            </div>

            <InputAsyncSelectCompany
              name="id_company"
              control={control}
              label="Компанія"
              icon={Building2}
              initialLabel={defaultValues.company.company_name}
            />

            <InputText
              name="email"
              control={control}
              label="Email (Логін)"
              icon={Mail}
            />
          </div>

          {/* Секція 2: Особисті дані */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-500">
              <User size={18} />
              <span className="font-bold text-sm uppercase text-[10px] tracking-wider">
                Особиста інформація
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputText
                name="person.surname"
                control={control}
                label="Прізвище"
              />
              <InputText name="person.name" control={control} label="Ім'я" />
              <InputText
                name="person.last_name"
                control={control}
                label="По батькові"
              />
            </div>
            {/* Вибір статі */}
            <FormField
              control={control}
              name="person.ids_sex"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <label className="text-[10px] font-bold uppercase text-slate-400">
                    Стать
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => field.onChange("M")}
                      className={`flex-1 h-10 rounded-xl border text-xs font-bold transition-all ${
                        field.value === "M"
                          ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300"
                      }`}
                    >
                      Чоловіча
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange("W")}
                      className={`flex-1 h-10 rounded-xl border text-xs font-bold transition-all ${
                        field.value === "W"
                          ? "bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/20"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-pink-300"
                      }`}
                    >
                      Жіноча
                    </button>
                  </div>
                  <FormMessage className="text-[10px] uppercase font-bold" />
                </FormItem>
              )}
            />
            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase text-slate-400">
                  Телефони
                </label>
                <AppButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    append({
                      phone: "",
                      is_viber: false,
                      is_telegram: false,
                      is_whatsapp: false,
                    })
                  }
                  className="h-8 px-2 border-dashed border border-slate-300 text-[10px] uppercase font-bold"
                  leftIcon={<Plus size={14} />}
                >
                  Додати номер
                </AppButton>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border relative space-y-4"
                >
                  <PhoneInput
                    name={`person.person_phone.${index}.phone`}
                    control={control}
                    label={`Телефон #${index + 1}`}
                    defaultCountry="UA"
                    international
                  />

                  <div className="flex flex-wrap gap-6">
                    <InputSwitch
                      name={`person.person_phone.${index}.is_viber`}
                      control={control}
                      label="Viber"
                    />
                    <InputSwitch
                      name={`person.person_phone.${index}.is_telegram`}
                      control={control}
                      label="TG"
                    />
                    <InputSwitch
                      name={`person.person_phone.${index}.is_whatsapp`}
                      control={control}
                      label="WA"
                    />
                  </div>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Секція 3: Доступи */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-500">
              <Lock size={18} />
              <span className="font-bold text-sm uppercase text-[10px] tracking-wider">
                Доступи
              </span>
            </div>

            <div className="flex gap-8">
              <InputSwitch
                name="person.person_role.is_admin"
                control={control}
                label="Адміністратор"
              />
              <InputSwitch
                name="person.person_role.is_manager"
                control={control}
                label="Менеджер"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <AppButton
              variant="primary"
              type="submit"
              isLoading={isSaving} // Використовуємо стан з хука
              className="px-12 h-12 shadow-lg"
            >
              {isEditMode ? "Зберегти зміни" : "Створити користувача"}
            </AppButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
