"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import {
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import api from "@/shared/api/instance.api";
import { MyTooltip } from "@/shared/components/Tooltips/MyTooltip";
import { SearchInput } from "@/shared/components/Inputs/SearchInputWithResult";
import {
  FaGlobe,
  FaMapMarkerAlt,
  FaBuilding,
  FaListAlt,
  FaUsers,
  FaTruck,
  FaHandshake,
  FaExclamationTriangle,
  FaFileAlt,
} from "react-icons/fa";
import { toast } from "sonner";

// ✅ Zod схема валідації
const companySchema = z.object({
  company_name: z.string().min(1, "Назва компанії — обов'язкове поле"),
  company_name_full: z.string().optional(),
  edrpou: z
    .string({ message: "Заповніть ІПН або ЄРДПОУ" })
    .min(1, "ЄДРПОУ — обов'язкове поле"),
  address: z.string({ message: "Заповніть адресу" }),
  company_form: z.string().optional(),
  lei: z.string().optional(),
  web_site: z.string().url("Некоректна адреса сайту").optional(),
  is_client: z.boolean().optional(),
  is_carrier: z.boolean().optional(),
  is_expedition: z.boolean().optional(),
  use_medok: z.boolean().optional(),
  use_vchasno: z.boolean().optional(),
  ids_country: z.string(),
  ids_carrier_rating: z.string(),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function CreateCompanyPage() {
  const [formStatus, setFormStatus] = useState<string | null>(null);
  const [preRegisterData, setPreRegisterData] = useState<any>({});
  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit: SubmitHandler<CompanyFormData> = async (data) => {
    try {
      const res = await api.post("/company/admin/create", data);
      console.log("Company created:", res.data);
      toast.success("Успішне створення компанії");
      console.log(res,'RESSSS!!!');
      
      // form.reset();
    } catch (error) {
      console.error(error,'ERRRORR');
    }
  };
  React.useEffect(() => {
    const getPreRegisterData = async () => {
      try {
        const { data } = await api.get("/company/form-data/create");

        console.log(data, "DATA REGISTER PRE DATA");
        console.log(data.status, "DATA STATUS");
        setPreRegisterData(data.content);
      } catch (error) {
        console.log(error);
      }
    };
    getPreRegisterData();
  }, []);

  console.log(preRegisterData, "preregister data");

  return (
    <div className="px-4 py-6 w-full overflow-y-auto">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 🔹 Основна інформація */}
          <Card className="p-4 rounded-2xl border border-gray-300">
            <h2 className="text-2xl font-semibold mb-4">Основна інформація</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FaBuilding className="text-gray-500" />
                      Коротка назва
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Назва компанії" />
                    </FormControl>
                    <FormMessage>{errors.company_name?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="company_name_full"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Повна назва</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Повна назва компанії" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="edrpou"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ЄДРПОУ</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Код ЄДРПОУ" />
                    </FormControl>
                    <FormMessage>{errors.edrpou?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-500" />
                      Адреса
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Адреса компанії" />
                    </FormControl>
                    <FormMessage>{errors.address?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="company_form"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Організаційна форма</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ТОВ / ФОП / ПП ..." />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* 🔹 Контакти та гео */}
          <Card className="p-4 rounded-2xl border border-gray-300">
            <h2 className="text-2xl font-semibold mb-4">Контакти та гео</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={control}
                name="web_site"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FaGlobe className="text-gray-500" /> Вебсайт
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com" />
                    </FormControl>
                    <FormMessage>{errors.web_site?.message}</FormMessage>
                  </FormItem>
                )}
              />
              {/* Ваша країна */}
              <FormField
                control={form.control}
                name="ids_country"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Країна</FormLabel>
                    <FormControl>
                      <Select
                        // disabled={isLoadingRegister}
                        value={field.value?.toString() || ""}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Вкажіть країну" />
                        </SelectTrigger>
                        <SelectContent>
                          {preRegisterData?.country_dropdown?.map(
                            (
                              item: { country_name: any; ids: any },
                              idx: React.Key | null | undefined
                            ) => (
                              <SelectItem key={idx} value={String(item.ids)}>
                                {item.country_name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* 🔹 Ролі компанії */}
          <Card className="p-4 rounded-2xl border border-gray-300">
            <h2 className="text-2xl font-semibold mb-4">Ролі компанії</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={control}
                name="is_client"
                render={({ field }) => (
                  <FormItem className="flex items-center ">
                    <FormLabel className="flex items-center gap-2">
                      <FaUsers className="text-gray-500" /> Клієнт
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="is_carrier"
                render={({ field }) => (
                  <FormItem className="flex items-center ">
                    <FormLabel className="flex items-center gap-2">
                      <FaTruck className="text-gray-500" /> Перевізник
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="is_expedition"
                render={({ field }) => (
                  <FormItem className="flex items-center ">
                    <FormLabel className="flex items-center gap-2">
                      <FaHandshake className="text-gray-500" /> Експедиція
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* 🔹 Сервіси та статус */}
          <Card className="p-4 rounded-2xl border border-gray-300">
            <h2 className="text-2xl font-semibold mb-4">Сервіси та статус</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={control}
                name="use_medok"
                render={({ field }) => (
                  <FormItem className="flex items-center ">
                    <FormLabel>Використовує M.E.Doc</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="use_vchasno"
                render={({ field }) => (
                  <FormItem className="flex items-center ">
                    <FormLabel>Використовує Вчасно</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="ids_carrier_rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип тендеру</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Оберіть тип" />
                      </SelectTrigger>
                      <SelectContent>
                        {preRegisterData?.rating_dropdown?.map((t: any) => (
                          <SelectItem key={t.value} value={t.ids}>
                            {t.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <div className="mt-4 flex justify-end border-t border-teal-500 pt-4">
            <Button type="submit" className="w-1/2 md:w-1/4">
              Створити компанію
            </Button>
          </div>

          {formStatus && (
            <p className="text-center text-sm text-gray-600">{formStatus}</p>
          )}
        </form>
      </FormProvider>
    </div>
  );
}
