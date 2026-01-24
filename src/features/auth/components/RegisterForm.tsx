"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Phone,
  Mail,
  Lock,
  Building2,
  Fingerprint,
  MapPin,
  Briefcase,
} from "lucide-react";

import { RegisterSchema, TypeRegisterSchema } from "../schemes";
import { userRegisterMutation } from "../hooks";
import api from "@/shared/api/instance.api";
import { InputText } from "@/shared/components/Inputs/InputText";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  PhoneInput, // Переконайся, що імпорт працює
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@/shared/components/ui";
import AuthWrapper from "./AuthWrapper";

const RegisterForm = () => {
  const [preRegisterData, setPreRegisterData] = useState<any>({});

  const form = useForm<TypeRegisterSchema>({
    resolver: zodResolver(RegisterSchema),
    mode: "onChange",
    defaultValues: {
      surname: "",
      name: "",
      last_name: "",
      phone: "",
      email: "",
      password: "",
      passwordRepeat: "",
      company_name: "",
      company_edrpou: "",
      company_vat_payer: false,
      company_carrier: false,
      company_expedition: false,
      company_freighter: false,
    },
  });

  const { register, isLoadingRegister } = userRegisterMutation();

  const onSubmit = (values: TypeRegisterSchema) => {
    register(
      { values },
      {
        onSuccess: () => {
          form.reset(); // Очищує всі поля форми до defaultValues
          // Тут також можна додати toast.success("Реєстрація успішна!");
        },
      },
    );
  };

  useEffect(() => {
    const getPreRegisterData = async () => {
      try {
        const { data } = await api.get("/auth/registerFormData");
        setPreRegisterData(data.content);
      } catch (error) {
        console.error("Помилка завантаження даних:", error);
      }
    };
    getPreRegisterData();
  }, []);

  return (
    <AuthWrapper
      heading="Реєстрація"
      description="Створіть корпоративний аккаунт для роботи з платформою"
      backButtonLabel="Вже є аккаунт? Увійти"
      backButtonHref="/auth/login"
      isShowSocial
      isFullSize
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Секція Користувача */}
            <div className="flex-1 p-5 bg-white dark:bg-slate-900 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-4 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-widest text-teal-600 mb-4 flex items-center gap-2">
                <User size={14} /> Дані користувача
              </h2>

              <InputText
                name="surname"
                control={form.control}
                label="Прізвище"
                
                disabled={isLoadingRegister}
              />
              <InputText
                name="name"
                control={form.control}
                label="Ім'я"
                // leftIcon={<User />}
                disabled={isLoadingRegister}
              />
              <InputText
                name="last_name"
                control={form.control}
                label="По-батькові"
                icon={User}
                disabled={isLoadingRegister}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel className="text-[11px] font-bold uppercase text-zinc-400 ml-1">
                      Контактний номер
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="UA"
                        international
                        disabled={isLoadingRegister}
                        value={field.value}
                        onChange={field.onChange}
                        className="flex h-11 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-black tracking-tight" />
                  </FormItem>
                )}
              />

              <InputText
                name="email"
                control={form.control}
                label="E-mail"
                type="email"
                icon={Mail}
                disabled={isLoadingRegister}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputText
                  name="password"
                  control={form.control}
                  label="Пароль"
                  type="password"
                  icon={Lock}
                  disabled={isLoadingRegister}
                  onChange={() => {
                    // Якщо в полі повтору вже щось написано — перевіряємо його знову
                    if (form.getValues("passwordRepeat")) {
                      form.trigger("passwordRepeat");
                    }
                  }}
                />

                <InputText
                  name="passwordRepeat"
                  control={form.control}
                  label="Повтор пароля"
                  type="password"
                  icon={Lock }
                  disabled={isLoadingRegister}
                />
              </div>
            </div>

            {/* Секція Компанії */}
            <div className="flex-1 p-5 bg-white dark:bg-slate-900 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-4 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-widest text-teal-600 mb-4 flex items-center gap-2">
                <Building2 size={14} /> Дані компанії
              </h2>

              <InputText
                name="company_name"
                control={form.control}
                label="Назва компанії"
                icon={Building2}
                disabled={isLoadingRegister}
              />
              <InputText
                name="company_edrpou"
                control={form.control}
                label="ЄДРПОУ / ІПН"
                icon={Fingerprint}
                disabled={isLoadingRegister}
              />
              <InputText
                name="company_address"
                control={form.control}
                label="Юридична адреса"
                icon={MapPin }
                disabled={isLoadingRegister}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center items-center justify-center">
                <InputText
                  name="company_form"
                  control={form.control}
                  label="Форма (ФОП/ТОВ)"
                  icon={Briefcase }
                  disabled={isLoadingRegister}
                />

                <FormField
                  control={form.control}
                  name="ids_country"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <Select
                        disabled={isLoadingRegister}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 border-zinc-200 dark:border-zinc-800 bg-transparent text-[13px]">
                            <SelectValue placeholder="Оберіть країну" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {preRegisterData?.country_dropdown?.map(
                            (item: any) => (
                              <SelectItem
                                key={item.ids}
                                value={String(item.ids)}
                              >
                                {item.country_name}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px] uppercase font-black tracking-tight" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Перемикачі */}
              <div className="space-y-3 pt-2 border-t border-zinc-50 dark:border-zinc-800">
                {[
                  { name: "company_vat_payer", label: "Платник ПДВ" },
                  { name: "company_carrier", label: "Я перевізник" },
                  { name: "company_expedition", label: "Я експедитор" },
                  { name: "company_freighter", label: "Я замовник" },
                ].map((item) => (
                  <FormField
                    key={item.name}
                    control={form.control}
                    name={item.name as any}
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0 rounded-lg border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 p-1 px-2 transition-colors">
                        <FormLabel className="text-[12px] uppercase font-bold text-zinc-500 cursor-pointer">
                          {item.label}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoadingRegister}
                            className="scale-75"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

<Button
  disabled={isLoadingRegister}
  loading={isLoadingRegister}
  type="submit"
  className="w-full max-w-md mx-auto flex h-11 uppercase tracking-wider font-bold text-xs shadow-lg shadow-teal-500/10"
>
  Створити аккаунт
</Button>
        </form>
      </Form>
    </AuthWrapper>
  );
};

export default RegisterForm;
