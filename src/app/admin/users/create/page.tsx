"use client";

import * as React from "react";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { SearchInput } from "@/shared/components/Inputs/SearchInputWithResult";
import { IctSwitchWithConfirm } from "@/shared/components/Switch/SwitchWithConfirm";
import api from "@/shared/api/instance.api";
import {
  FaLock,
  FaKey,
  FaUserShield,
  FaMoneyBill,
  FaChalkboardTeacher,
  FaLaptopCode,
  FaUserPlus,
} from "react-icons/fa";
import { useAdminUsers } from "@/features/admin/hooks/useAdminUsers";

const userSchema = z.object({
  email: z.string().email("Невірний формат").min(5),
  last_name: z.string().min(1, "Обов'язково"),
  name: z.string().min(1, "Обов'язково"),
  surname: z.string().min(1, "Обов'язково"),
  is_blocked: z.boolean().optional(),
  two_factor_enabled: z.boolean().optional(),
  is_admin: z.boolean().optional(),
  is_accountant: z.boolean().optional(),
  is_manager: z.boolean().optional(),
  is_director: z.boolean().optional(),
  is_ict: z.boolean().optional(),
  id_company: z.number({ message: "Обов'язково" }),
});

type UserFormData = z.infer<typeof userSchema>;

export default function CreateUserPage() {
  const { createUser } = useAdminUsers();
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      is_blocked: false,
      two_factor_enabled: false,
      is_admin: false,
      is_accountant: false,
      is_manager: false,
      is_director: false,
      is_ict: false,
    },
  });
  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    try {
      const res = await createUser(data);

      // Перевіряємо, що саме прийшло в консолі
      console.log("Response from server:", res);

      // Якщо ваш API повертає структуру { data: { status: "ok" } } або просто { status: "ok" }
      // Переконайтеся, що умова відповідає вашій відповіді
      if (res && (res.status === "ok" || res.data?.status === "ok")) {
        form.reset({
          email: "",
          last_name: "",
          name: "",
          surname: "",
          id_company: undefined, // Очищуємо компанію
          is_blocked: false,
          two_factor_enabled: false,
          is_admin: false,
          is_accountant: false,
          is_manager: false,
          is_director: false,
          is_ict: false,
        });
        console.log("Form has been reset");
      }
    } catch (e) {
      console.error("Submit error:", e);
    }
  };

  return (
    <div className="px-4 py-6 w-full max-w-5xl mx-auto pb-24">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* КАРТКА 1: ОСНОВНІ ДАНІ */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-5 rounded-3xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <FormField
                  control={form.control}
                  name="id_company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-500 uppercase">
                        Компанія
                      </FormLabel>
                      <SearchInput
                        url="/company/name"
                        placeholder="Пошук..."
                        onChange={(val) => field.onChange(val?.id)}
                      />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-500 uppercase">
                        Email
                      </FormLabel>
                      <Input
                        {...field}
                        placeholder="mail@example.com"
                        className="h-10 rounded-xl"
                      />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { n: "last_name", l: "Прізвище" },
                  { n: "name", l: "Ім'я" },
                  { n: "surname", l: "По батькові" },
                ].map((u) => (
                  <FormField
                    key={u.n}
                    control={form.control}
                    name={u.n as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-400 uppercase">
                          {u.l}
                        </FormLabel>
                        <Input
                          {...field}
                          className="h-10 rounded-xl bg-slate-50/50"
                        />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* БЕЗПЕКА */}
            <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 p-4 rounded-3xl space-y-3">
              <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">
                Безпека
              </h4>
              {[
                {
                  name: "is_blocked",
                  label: "Блок",
                  icon: FaLock,
                  color: "text-red-500",
                },
                {
                  name: "two_factor_enabled",
                  label: "2FA",
                  icon: FaKey,
                  color: "text-blue-500",
                  confirm: true,
                },
              ].map((s) => (
                <FormField
                  key={s.name}
                  control={form.control}
                  name={s.name as any}
                  render={({ field }) => (
                    <div className="flex items-center justify-between bg-white dark:bg-white/5 p-2 px-3 rounded-xl border border-slate-100 dark:border-transparent transition-colors hover:bg-slate-100/50 dark:hover:bg-white/10">
                      <label
                        htmlFor={s.name}
                        className="flex items-center gap-2 cursor-pointer flex-1 py-1"
                      >
                        <s.icon className={`${s.color} text-sm`} />
                        <span className="text-xs font-medium">{s.label}</span>
                      </label>
                      <FormControl>
                        {s.confirm ? (
                          <IctSwitchWithConfirm
                            id={s.name}
                            field={field}
                            text="Увімкнути?"
                          />
                        ) : (
                          <Switch
                            id={s.name}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="scale-75"
                          />
                        )}
                      </FormControl>
                    </div>
                  )}
                />
              ))}
            </div>

            {/* РОЛІ */}
            <div className="md:col-span-2 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 p-4 rounded-3xl">
              <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">
                Ролі доступу
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    name: "is_admin",
                    label: "Admin",
                    icon: FaUserShield,
                    color: "text-red-500",
                  },
                  {
                    name: "is_accountant",
                    label: "Бухгалтер",
                    icon: FaMoneyBill,
                    color: "text-amber-500",
                  },
                  {
                    name: "is_manager",
                    label: "Менеджер",
                    icon: FaChalkboardTeacher,
                    color: "text-indigo-500",
                  },
                  {
                    name: "is_director",
                    label: "Директор",
                    icon: FaUserShield,
                    color: "text-purple-500",
                  },
                ].map((r) => (
                  <FormField
                    key={r.name}
                    control={form.control}
                    name={r.name as any}
                    render={({ field }) => (
                      <label
                        htmlFor={r.name}
                        className="flex flex-col items-center justify-center bg-white dark:bg-white/5 p-2 rounded-xl border border-slate-100 dark:border-transparent cursor-pointer transition-all hover:shadow-sm hover:border-blue-200 dark:hover:border-white/20 group"
                      >
                        <r.icon
                          className={`${r.color} text-base mb-1 group-hover:scale-110 transition-transform`}
                        />
                        <span className="text-[10px] font-bold uppercase mb-2 text-slate-600 dark:text-slate-400">
                          {r.label}
                        </span>
                        <FormControl>
                          <Switch
                            id={r.name}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="scale-75"
                          />
                        </FormControl>
                      </label>
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ICT СЕКЦІЯ */}
          <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 p-3 px-5 rounded-2xl">
            <FormField
              control={form.control}
              name="is_ict"
              render={({ field }) => (
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="is_ict"
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="p-2 bg-teal-500/20 rounded-lg">
                      <FaLaptopCode className="text-teal-600" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">
                        ICT Адміністратор
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Повний технічний доступ
                      </span>
                    </div>
                  </label>
                  <FormControl>
                    <IctSwitchWithConfirm
                      id="is_ict"
                      field={field}
                      text="Надати права?"
                    />
                  </FormControl>
                </div>
              )}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="w-full md:w-auto px-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
              <FaUserPlus /> Створити акаунт
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
