"use client";

import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/shared/components/ui";

import { InputSwitch } from "@/shared/components/Inputs/InputSwitch";
import { AppButton } from "@/shared/components/Buttons/AppButton";

import { useAdminUsers } from "@/features/admin/hooks/useAdminUsers";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import {
  Lock,
  ShieldCheck,
  Banknote,
  GraduationCap,
  Laptop,
  UserPlus,
  Mail,
  AlertCircle,
} from "lucide-react";
import { InputText } from "@/shared/components/Inputs/InputText";
import { InputAsyncSelectCompany } from "@/shared/components/Inputs/InputAsyncSelectCompany";
import { cn } from "@/shared/utils";
import { InputSwitchWithConfirm } from "@/shared/components/Inputs/InputSwitchWithConfirm";

const personPhone = z.array(
  z.object({
    phone: z.string().min(5, "Невірний формат"),
    is_telegram: z.boolean().optional(),
    is_viber: z.boolean().optional(),
    is_whatsapp: z.boolean().optional(),
  }),
);

const userSchema = z
  .object({
    email: z
      .string()
      .trim() // Видаляє пробіли на початку і в кінці
      .toLowerCase() // Перетворює на малий регістр
      .email("Невірний формат")
      .min(5, "Обов'язково"),
    last_name: z.string().min(1, "Обов'язково"),
    ids_sex: z.enum(["W", "M"], { message: "Оберіть стать" }),
    name: z.string().min(1, "Обов'язково"),
    surname: z.string().min(1, "Обов'язково"),
    is_blocked: z.boolean().optional(),

    is_admin: z.boolean().optional(),

    is_manager: z.boolean().optional(),

    is_ict: z.boolean().optional(),
    id_company: z.number({ message: "Обов'язково" }),
    person_phone: personPhone.optional(),
  })
  .refine(
    (data) => {
      // ПЕРЕВІРКА: хоча б одна з основних ролей має бути true
      return data.is_admin || data.is_manager;
    },
    {
      message: "Оберіть хоча б одну роль",
      path: ["is_roles"],
    },
  );

type UserFormData = z.infer<typeof userSchema>;

export default function CreateUserPage() {
  const { config } = useFontSize();
  const { createUser } = useAdminUsers();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: "onTouched",
    defaultValues: {
      is_blocked: false,

      is_admin: false,

      is_manager: false,

      is_ict: false,
      email: "",
      last_name: "",
      name: "",
      surname: "",
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    try {
      const res = await createUser(data);

      if (res && (res.status === "ok" || res.data?.status === "ok")) {
        reset();
      }
    } catch (e) {
      console.error("Submit error:", e);
    }
  };

  const rolesError = (errors as any).is_roles;

  return (
    <div className="mx-auto mb-10 px-4">
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 p-5 rounded-[1.5rem] shadow-sm">
        <h3
          className={cn(
            config.label,
            "text-slate-500 uppercase tracking-widest mb-6 font-bold",
          )}
        >
          Новий користувач
        </h3>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7">
                <InputAsyncSelectCompany
                  name="id_company"
                  control={control}
                  label="Компанія"
                  required
                />
              </div>
              <div className="md:col-span-5">
                <InputText
                  name="email"
                  control={control}
                  label="Email"
                  icon={Mail}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputText
                name="last_name"
                control={control}
                label="Прізвище"
                required
              />
              <InputText name="name" control={control} label="Ім'я" required />
              <InputText
                name="surname"
                control={control}
                label="По батькові"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* БЕЗПЕКА */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400 border-b pb-2">
                  Безпека
                </h4>
                <InputSwitch
                  control={control}
                  name="is_blocked"
                  label="Блокування"
                  icon={Lock}
                  className="data-[state=checked]:bg-red-500"
                />
              </div>

              {/* РОЛІ */}
              <div
                className={cn(
                  "md:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-sm transition-all",
                  rolesError
                    ? "border-red-500 bg-red-50/5"
                    : "border-slate-200 dark:border-white/10",
                )}
              >
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400">
                    Ролі доступу
                  </h4>
                  {rolesError && (
                    <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 animate-pulse">
                      <AlertCircle size={12} /> {rolesError.message}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      name: "is_admin",
                      label: "Admin",
                      icon: ShieldCheck,
                      color: "text-red-500",
                    },

                    {
                      name: "is_manager",
                      label: "Менеджер",
                      icon: GraduationCap,
                      color: "text-indigo-500",
                    },
                  ].map((r) => {
                    const isActive = form.watch(r.name as any);
                    return (
                      <label
                        key={r.name}
                        onClick={() => {
                          // Додаємо тригер валідації при кліку на картку
                          setTimeout(() => trigger("is_roles" as any), 10);
                        }}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer select-none",
                          isActive
                            ? "border-blue-500 bg-blue-50/30 dark:bg-blue-500/10"
                            : "border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/5 hover:border-slate-300",
                        )}
                      >
                        <r.icon
                          className={cn(
                            r.color,
                            "mb-2",
                            !isActive && "opacity-50",
                          )}
                          size={20}
                        />
                        <span className="text-[10px] font-bold uppercase mb-3 text-slate-500 text-center">
                          {r.label}
                        </span>
                        <InputSwitch
                          control={control}
                          name={r.name as any}
                          label=""
                          className="scale-90 pointer-events-none"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <InputSwitchWithConfirm
                id="is_ict"
                icon={Laptop}
                label="Користувач ICT ?"
                text="Користувач отримає повні права адміністратора ICT системи."
                field={{
                  value: form.watch("is_ict") || false,
                  onChange: (val) => {
                    form.setValue("is_ict", val);
                    // ICT не є частиною валідації "хоча б одна роль", тому тут тригер не обов'язковий,
                    // але можна додати для надійності
                    trigger("is_roles" as any);
                  },
                }}
              />
            </div>

            <div className="flex justify-end pt-4">
              <AppButton
                type="submit"
                size="lg"
                className="w-full sm:w-auto px-12 shadow-lg bg-blue-600 hover:bg-blue-700"
                leftIcon={<UserPlus size={18} />}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Створення..." : "Створити акаунт"}
              </AppButton>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
