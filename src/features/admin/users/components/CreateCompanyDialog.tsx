"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import api from "@/shared/api/instance.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";

import { useCreateCompany } from "../hooks/useCreateCompany";
import {
  createCompanySchema,
  TypeCreateCompanySchema,
} from "../schemas/create-company.schema";

interface Props {
  companyData: { id: number };
}

export function CreateCompanyDialog({ companyData }: Props) {
  const [open, setOpen] = React.useState(false); // 👈 додаємо стан для відкриття/закриття
  const [countries, setCountries] = React.useState<
    { ids: number; country_name: string }[]
  >([]);
  // const { refetch } = useGetUsersPreRegister();
  console.log(companyData, "COMPANY DATA");

  // Отримуємо onSubmit та isPending з хуку (тільки сабміт)
  const { onSubmit: handleCreateCompany, isPending } = useCreateCompany();

  // useForm безпосередньо у компоненті
  const form = useForm<TypeCreateCompanySchema>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {},
  });

  // Завантаження даних компанії та країн
  const getFormValues = async (id: number) => {
    try {
      const { data } = await api.post("/users/company-fill", {
        id_usr_pre_register: id,
      });

      const companyDataFromServer: Partial<TypeCreateCompanySchema> = {
        company_name: data.content.company.company_name ?? "",
        company_name_full: data.content.company.company_name_full ?? "",
        company_form: data.content.company.company_form ?? "",
        address: data.content.company.address ?? "",
        edrpou: data.content.company.edrpou ?? "",
        is_carrier: data.content.is_carrier ?? false,
        is_expedition: data.content.is_expedition ?? false,
        is_client: data.content.is_client ?? false,
        ids_country: data.content.company.id_country ?? 52,
      };

      // Оновлюємо форму
      form.reset(companyDataFromServer);

      // Оновлюємо список країн
      setCountries(data.content.country_dropdown ?? []);
    } catch (error) {
      console.error("Помилка при отриманні даних компанії:", error);
    }
  };

  const onSubmit: SubmitHandler<TypeCreateCompanySchema> = (data) => {
    handleCreateCompany(data);

    form.reset(); // скидаємо форму
    setOpen(false); // закриваємо діалог
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            getFormValues(companyData.id);
            setOpen(true);
          }}
          size="sm"
          variant="outline"
          className="text-xs"
        >
          Створити компанію
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Створення компанії</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_name_full"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Повна назва компанії</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Повна назва"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Коротка назва компанії</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Коротка назва" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="edrpou"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ЄДРПОУ</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="231321123132"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_form"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Форма компанії</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="ФОП  / ТОВ"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адреса</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Городоцька 211"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {countries.length > 0 && (
              <FormField
                control={form.control}
                name="ids_country"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Країна</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Вкажіть країну" />
                        </SelectTrigger>
                        <SelectContent className="z-[2000]">
                          {countries.map((item) => (
                            <SelectItem key={item.ids} value={String(item.ids)}>
                              {item.country_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Створюємо..." : "Створити"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
