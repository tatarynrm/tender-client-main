"use client";

import React, { useState, useMemo } from "react";
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
  Info,
} from "lucide-react";

import { Form, FormField, FormItem, FormMessage } from "@/shared/components/ui";
import { InputSwitch } from "@/shared/components/Inputs/InputSwitch";
import { AppButton } from "@/shared/components/Buttons/AppButton";
import { InputText } from "@/shared/components/Inputs/InputText";
import { InputAsyncSelectCompany } from "@/shared/components/Inputs/InputAsyncSelectCompany";

// ---------- Schema ----------

const userSchema = z.object({
  email: z.string().email("Невірний формат email"),
  id_company: z.number({ message: "Оберіть компанію" }),
  password_hash: z
    .string()
    .min(6, "Мінімум 6 символів")
    .optional()
    .or(z.literal("")),

  person: z.object({
    name: z.string().min(1, "Ім'я обов'язкове"),
    surname: z.string().min(1, "Прізвище обов'язкове"),
    last_name: z.string().optional().nullable(),
    ids_sex: z.enum(["M", "F"]).default("M"),

    person_role: z.object({
      is_admin: z.boolean().default(false),
      is_manager: z.boolean().default(false),
    }),

    person_phone: z
      .array(
        z.object({
          phone: z.string().min(10, "Мінімум 10 цифр"),
          is_viber: z.boolean().default(false),
          is_telegram: z.boolean().default(false),
          is_whatsapp: z.boolean().default(false),
        }),
      )
      .min(1, "Додайте хоча б один номер телефону"),
  }),
});

export type UserFormValues = z.infer<typeof userSchema>;

export default function UserForm({ defaultValues }: { defaultValues?: any }) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema) as any,
    mode: "onTouched",
    defaultValues: useMemo(
      () => ({
        email: defaultValues?.email || "",
        id_company: defaultValues?.id_company || undefined,
        password_hash: "",
        person: {
          name: defaultValues?.person?.name || "",
          surname: defaultValues?.person?.surname || "",
          last_name: defaultValues?.person?.last_name || "",
          ids_sex: defaultValues?.person?.ids_sex || "M",
          person_role: {
            is_admin: defaultValues?.person?.person_role?.is_admin || false,
            is_manager: defaultValues?.person?.person_role?.is_manager || false,
          },
          person_phone:
            defaultValues?.person?.person_phone &&
            defaultValues.person.person_phone.length > 0
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
      }),
      [defaultValues],
    ),
  });

  const { control, handleSubmit } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "person.person_phone",
  });

  const onSubmit: SubmitHandler<UserFormValues> = async (values) => {
    try {
      setIsLoading(true);
      console.log("Final Object for API:", values);
      toast.success("Дані успішно збережено");
    } catch (err) {
      toast.error("Помилка збереження");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 1. Акаунт та Компанія */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <ShieldCheck size={18} />
              <span className="font-bold text-sm uppercase">
                Акаунт та Компанія
              </span>
            </div>

            <div className="space-y-2">
              <FormField
                control={control}
                name="id_company"
                render={({ field }) => (
                  <FormItem>
                    <InputAsyncSelectCompany
                      {...field}
                      control={control}
                      label="Компанія"
                      icon={Building2}
                      initialLabel={
                        defaultValues?.company?.company_name_full ||
                        ""
                      }
                      // Якщо компонент всередині використовує Select з об'єктами,
                      // передаємо назву через окремий пропс, якщо ваш компонент це підтримує,
                      // або просто покладаємось на початкове значення у формі.
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <InputText
                name="email"
                control={control}
                label="Email (Логін)"
                icon={Mail}
              />
            </div>
          </div>

          {/* 2. Особисті дані */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <User size={18} />
              <span className="font-bold text-sm uppercase">
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

            {/* ДИНАМІЧНІ ТЕЛЕФОНИ */}
            <div className="mt-6 space-y-4">
              <AppButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    phone: "",
                    is_viber: false,
                    is_telegram: false,
                    is_whatsapp: false,
                  })
                }
                className="h-7 gap-1 text-[11px] flex flex-row"
              >
                <Plus size={12} />
              </AppButton>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-white/5 space-y-4 relative"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <InputText
                      name={`person.person_phone.${index}.phone`}
                      control={control}
                      label={`Телефон #${index + 1}`}
                      icon={Phone}
                    />
                    <div className="flex flex-wrap items-center gap-4 pb-2">
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
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Ролі */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-500">
              <Lock size={18} />
              <span className="font-bold text-sm uppercase">Доступи</span>
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
              isLoading={isLoading}
              className="px-12 h-12 shadow-lg"
            >
              {defaultValues ? "Зберегти зміни" : "Створити користувача"}
            </AppButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
