"use client";

import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { AppButton } from "@/shared/components/Buttons/AppButton";
import { InputSwitch } from "@/shared/components/Inputs/InputSwitch";
import { InputNumber } from "@/shared/components/Inputs/InputNumber";
import { useDebounce } from "@/shared/hooks/useDebounce";

const RegisterForm = () => {
  const [preRegisterData, setPreRegisterData] = useState<any>({});

  const form = useForm<TypeRegisterSchema>({
    resolver: zodResolver(RegisterSchema),
    mode: "onTouched",
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

  const edrpouValue = useWatch({
    control: form.control,
    name: "company_edrpou",
  });
  const debouncedEdrpou = useDebounce(edrpouValue, 400);
  const [companyOptions, setCompanyOptions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEdrpou, setSelectedEdrpou] = useState("");

  const handleSelectCompany = (company: any) => {
    const edrpou = company.zkpo;
    setSelectedEdrpou(edrpou);
    form.setValue("company_edrpou", edrpou, { shouldValidate: true });
    form.setValue("company_name", company.nur || company.fo || "", {
      shouldValidate: true,
    });
    form.setValue("company_address", company.nadr || "", {
      shouldValidate: true,
    });
    setShowDropdown(false);
  };

  useEffect(() => {
    if (
      debouncedEdrpou &&
      debouncedEdrpou.length >= 8 &&
      debouncedEdrpou.length <= 20
    ) {
      if (debouncedEdrpou === selectedEdrpou) {
        setShowDropdown(false);
        return;
      }

      const fetchCompanies = async () => {
        setIsSearching(true);
        try {
          const { data } = await api.get(
            `/oracle/search-company?edrpou=${debouncedEdrpou}`,
          );
          setCompanyOptions(data || []);
          if (data && data.length > 0) {
            setShowDropdown(true);
          } else {
            setShowDropdown(false);
          }
        } catch (error) {
          console.error("Search company error:", error);
        } finally {
          setIsSearching(false);
        }
      };
      fetchCompanies();
    } else {
      setCompanyOptions([]);
      setShowDropdown(false);
    }
  }, [debouncedEdrpou, selectedEdrpou]);

  const { register, isLoadingRegister } = userRegisterMutation();

  const onSubmit = (values: TypeRegisterSchema) => {
    console.log(values, "VALUES");

    register(
      { values },
      {
        onSuccess: () => {
          form.reset();
          setSelectedEdrpou(""); // також скидаємо стан вибраного ЄДРПОУ
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
  console.log(form.formState.errors, "ERRORS");

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
                icon={User}
                disabled={isLoadingRegister}
              />
              <InputText
                name="name"
                control={form.control}
                label="Ім'я"
                icon={User}
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
              <PhoneInput
                name="phone"
                control={form.control}
                label="Контактний номер"
                defaultCountry="UA"
                international
                disabled={isLoadingRegister}
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
                  icon={Lock}
                  disabled={isLoadingRegister}
                />
              </div>
            </div>

            {/* Секція Компанії */}
            <div className="flex-1 p-5 bg-white dark:bg-slate-900 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-4 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-widest text-teal-600 mb-4 flex items-center gap-2">
                <Building2 size={14} /> Дані компанії
              </h2>
              <div className="relative">
                <InputText
                  name="company_edrpou"
                  control={form.control}
                  label="ЄДРПОУ / ІПН"
                  icon={Fingerprint}
                  disabled={isLoadingRegister}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-teal-600 font-bold uppercase animate-pulse z-30">
                    Пошук...
                  </div>
                )}
                {/* Autocomplete Dropdown */}
                {showDropdown && companyOptions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[100] max-h-64 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2">
                    {companyOptions.map((comp) => (
                      <div
                        key={comp.kod}
                        className="p-3 border-b border-zinc-100 dark:border-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 cursor-pointer transition-colors"
                        onClick={() => handleSelectCompany(comp)}
                      >
                        <div className="font-bold text-[13px] text-slate-800 dark:text-slate-200">
                          {comp.nur || comp.fo}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex flex-col sm:flex-row justify-between gap-1">
                          <span className="text-teal-600 dark:text-teal-400 font-semibold">
                            ЄДРПОУ: {comp.zkpo}
                          </span>
                          <span className="truncate opacity-70">
                            {comp.nadr}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <InputText
                name="company_name"
                control={form.control}
                label="Назва компанії"
                icon={Building2}
                disabled={isLoadingRegister}
              />

              <InputText
                name="company_address"
                control={form.control}
                label="Юридична адреса"
                icon={MapPin}
                disabled={isLoadingRegister}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center items-center justify-center">
                {/* <InputText
                  name="company_form"
                  control={form.control}
                  label="Форма (ФОП/ТОВ)"
                  icon={Briefcase}
                  disabled={isLoadingRegister}
                /> */}

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
              <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                {[
                  { name: "company_vat_payer", label: "Платник ПДВ" },
                  { name: "company_carrier", label: "Я перевізник" },
                  { name: "company_expedition", label: "Я експедитор" },
                  { name: "company_freighter", label: "Я замовник" },
                ].map((item) => (
                  <InputSwitch
                    key={item.name}
                    name={item.name as any}
                    control={form.control}
                    label={item.label}
                    className="hover:bg-zinc-50 dark:hover:bg-white/5 py-2 rounded-lg transition-colors"
                  />
                ))}

                {/* Висновок загальної помилки для ролей */}
                {/* Перевірка через опціональний ланцюжок і типізацію */}
                {form.formState.errors &&
                  (form.formState.errors as any).roles_error && (
                    <p className="text-[10px] uppercase font-black tracking-tight text-red-500 ml-1 mt-2">
                      {(form.formState.errors as any).roles_error.message}
                    </p>
                  )}
              </div>
            </div>
          </div>

          <AppButton
            disabled={isLoadingRegister}
            type="submit"
            className="w-full max-w-md mx-auto flex h-11 uppercase tracking-wider font-bold text-xs shadow-lg shadow-teal-500/10 cursor-pointer bg-[#718AF6]"
          >
            Створити аккаунт
          </AppButton>
        </form>
      </Form>
    </AuthWrapper>
  );
};

export default RegisterForm;
