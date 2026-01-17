"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Textarea,
  Button,
  Switch,
  Label,
  SelectTrigger,
  SelectValue,
  Select,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui";
import AsyncSelect from "react-select/async";
import { default as ReactSelect } from "react-select";
import api from "@/shared/api/instance.api";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { MyTooltip } from "@/shared/components/Tooltips/MyTooltip";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { GoogleLocationInput } from "@/shared/components/google-location-input/GoogleLocationInput";
import { useSockets } from "@/shared/providers/SocketProvider";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import { selectStyles } from "./config/style.config";

// ---------- Schemas (залишаємо без змін) ----------
const routeSchema = z.object({
  id: z.number().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  address: z.string().min(1, "Обов'язково"),
  ids_route_type: z.enum(["LOAD_FROM", "LOAD_TO"]),
  country: z.string().optional(),
  city: z.string().optional(),
  order_num: z.number(),
  ids_region: z.string().nullable().optional(),
});

const trailerSchema = z.object({
  ids_trailer_type: z.string(),
});

const cargoServerSchema = z.object({
  price: z.number().nullable().optional(),
  ids_valut: z.string().optional(),
  id_client: z.number().optional().nullable(),
  load_info: z.string().optional(),
  crm_load_route_from: z.array(routeSchema).min(1),
  crm_load_route_to: z.array(routeSchema).min(1),
  crm_load_trailer: z.array(trailerSchema).min(1, "Оберіть тип"),
  is_price_request: z.boolean().optional(),
  is_collective: z.boolean().optional(),
  car_count_begin: z.number().min(1).max(100),
});

export type CargoServerFormValues = z.infer<typeof cargoServerSchema>;

export default function LoadForm({ defaultValues }: { defaultValues?: any }) {
  const { config } = useFontSize();
  const [valutList, setValutList] = useState<any[]>([]);
  const [truckList, setTruckList] = useState<any[]>([]);
  const [isNextCargo, setIsNextCargo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Якщо це редагування, початкове значення беремо з defaultValues (якщо воно там є)
  const [companyLabel, setCompanyLabel] = useState<string>(
    defaultValues?.company_name || "",
  );
  const [currentTheme, setCurrentTheme] = useState("light");

  const router = useRouter();
  const { profile } = useAuth();
  const { load: loadSocket } = useSockets();

  const form = useForm<CargoServerFormValues>({
    resolver: zodResolver(cargoServerSchema),
    defaultValues: {
      load_info: "",
      ids_valut: "UAH",
      crm_load_route_from: [
        {
          address: "",
          lat: 0,
          lon: 0,
          ids_route_type: "LOAD_FROM",
          order_num: 1,
        },
      ],
      crm_load_route_to: [
        {
          address: "",
          lat: 0,
          lon: 0,
          ids_route_type: "LOAD_TO",
          order_num: 1,
        },
      ],
      crm_load_trailer: [],
      price: null,
      car_count_begin: 1,
      ...defaultValues,
    },
  });

  const { control, handleSubmit, setValue, clearErrors } = form;
  const {
    fields: fromFields,
    append: appendFrom,
    remove: removeFrom,
  } = useFieldArray({ control, name: "crm_load_route_from" });
  const {
    fields: toFields,
    append: appendTo,
    remove: removeTo,
  } = useFieldArray({ control, name: "crm_load_route_to" });

  useEffect(() => {
    api.get("/form-data/getCreateCargoFormData").then(({ data }) => {
      setValutList(
        data.content.valut_dropdown.map((v: any) => ({
          value: v.ids,
          label: v.ids,
        })),
      );
      setTruckList(
        data.content.trailer_type_dropdown.map((t: any) => ({
          value: t.ids,
          label: t.value,
        })),
      );
    });
  }, []);

  useEffect(() => {
    // Визначаємо початкову тему
    const isDark = document.documentElement.classList.contains("dark");
    setCurrentTheme(isDark ? "dark" : "light");

    // Слідкуємо за зміною класу dark на html
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setCurrentTheme(isDark ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);
  const onSubmit: SubmitHandler<CargoServerFormValues> = async (values) => {
    try {
      setIsLoading(true);
      const { data } = await api.post("/crm/load/save", {
        ...values,
        id: defaultValues?.id,
      });
      loadSocket?.emit("edit_load", data.content.id);
      if (data.content) {
        if (!isNextCargo) form.reset();
        loadSocket?.emit("send_update", {
          loadId: profile?.id,
          data: { status: "updated" },
        });
        toast.success("Готово!");
        if (defaultValues) router.push("/log/cargo");
      }
    } catch (err) {
      toast.error("Помилка збереження");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (defaultValues?.company_name) {
      setCompanyLabel(defaultValues.company_name);
    }
  }, [defaultValues?.company_name]);

  return (
    <div className="max-w-4xl mx-auto mb-10">
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 p-5 rounded-[1.5rem] shadow-sm ">
        <h3
          className={`${config.label} text-slate-500 uppercase tracking-widest mb-4 font-bold`}
        >
          {defaultValues ? "Редагування" : "Нова заявка"}
        </h3>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* МАРШРУТ (Двоколонковий) */}
            {/* МАРШРУТ (Двоколонковий) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* КОЛОНКА: ЗВІДКИ */}
              <div className="space-y-2">
                {fromFields.map((field, idx) => (
                  <div key={field.id} className="flex items-end gap-2 mb-2">
                    <FormField
                      control={control}
                      name={`crm_load_route_from.${idx}.address`}
                      render={({ field: formField }) => (
                        <FormItem className="flex-1">
                          <FormLabel
                            className={`${config.label} text-slate-400`}
                          >
                            {`Адреса завантаження #${idx + 1}`}
                          </FormLabel>
                          <FormControl>
                            <GoogleLocationInput
                              value={formField.value}
                              placeholder="Введіть адресу завантаження..."
                              onChange={(location) => {
                                const address = location.street
                                  ? `${location.street}${location.house ? `, ${location.house}` : ""}`
                                  : location.city || "";

                                formField.onChange(address);

                                // Заповнюємо додаткові дані
                                setValue(
                                  `crm_load_route_from.${idx}.lat`,
                                  location.lat,
                                );
                                setValue(
                                  `crm_load_route_from.${idx}.lon`,
                                  location.lng,
                                );
                                setValue(
                                  `crm_load_route_from.${idx}.country`,
                                  location.countryCode,
                                );
                                setValue(
                                  `crm_load_route_from.${idx}.city`,
                                  location.city,
                                );
                                setValue(
                                  `crm_load_route_from.${idx}.ids_region`,
                                  location.regionCode || null,
                                );

                                clearErrors(
                                  `crm_load_route_from.${idx}.address`,
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {idx > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mb-1"
                        onClick={() => removeFrom(idx)}
                      >
                        <Minus size={14} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 text-xs w-full border-dashed border"
                  onClick={() =>
                    appendFrom({
                      address: "",
                      lat: 0,
                      lon: 0,
                      ids_route_type: "LOAD_FROM",
                      order_num: fromFields.length + 1,
                    })
                  }
                >
                  + Точка завантаження
                </Button>
              </div>

              {/* КОЛОНКА: КУДИ */}
              <div className="space-y-2">
                {toFields.map((field, idx) => (
                  <div key={field.id} className="flex items-end gap-2 mb-2">
                    <FormField
                      control={control}
                      name={`crm_load_route_to.${idx}.address`}
                      render={({ field: formField }) => (
                        <FormItem className="flex-1">
                          <FormLabel
                            className={`${config.label} text-slate-400`}
                          >
                            {`Адреса розвантаження #${idx + 1}`}
                          </FormLabel>
                          <FormControl>
                            <GoogleLocationInput
                              value={formField.value}
                              placeholder="Введіть адресу розвантаження..."
                              onChange={(location) => {
                                const address = location.street
                                  ? `${location.street}${location.house ? `, ${location.house}` : ""}`
                                  : location.city || "";

                                formField.onChange(address);

                                // Заповнюємо додаткові дані
                                setValue(
                                  `crm_load_route_to.${idx}.lat`,
                                  location.lat,
                                );
                                setValue(
                                  `crm_load_route_to.${idx}.lon`,
                                  location.lng,
                                );
                                setValue(
                                  `crm_load_route_to.${idx}.country`,
                                  location.countryCode,
                                );
                                setValue(
                                  `crm_load_route_to.${idx}.city`,
                                  location.city,
                                );
                                setValue(
                                  `crm_load_route_to.${idx}.ids_region`,
                                  location.regionCode || null,
                                );

                                clearErrors(`crm_load_route_to.${idx}.address`);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {idx > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mb-1"
                        onClick={() => removeTo(idx)}
                      >
                        <Minus size={14} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 text-xs w-full border-dashed border"
                  onClick={() =>
                    appendTo({
                      address: "",
                      lat: 0,
                      lon: 0,
                      ids_route_type: "LOAD_TO",
                      order_num: toFields.length + 1,
                    })
                  }
                >
                  + Точка розвантаження
                </Button>
              </div>
            </div>

            {/* КОМПАНІЯ ТА ТИП ТРАНСПОРТУ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="id_client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={config.label}>Клієнт</FormLabel>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      placeholder="Оберіть клієнта..."
                      noOptionsMessage={({ inputValue }) =>
                        !inputValue
                          ? "Почніть вводити назву..."
                          : "Нічого не знайдено"
                      }
                      loadingMessage={() => "Пошук..."}
                      loadOptions={async (v) => {
                        // Пошук працює як і раніше
                        const { data } = await api.get(`/company/name/${v}`);
                        return data.map((c: any) => ({
                          value: c.id,
                          label: c.company_name,
                        }));
                      }}
                      styles={selectStyles(config) as any}
                      onChange={(opt: any) => {
                        field.onChange(opt?.value); // Записуємо ID у форму
                        setCompanyLabel(opt?.label || ""); // Записуємо текст у локальний стейт
                      }}
                      // Критично важлива частина для відображення:
                      value={
                        field.value
                          ? {
                              value: field.value,
                              label: companyLabel || "Завантаження...",
                            }
                          : null
                      }
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="crm_load_trailer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={config.label}>
                      Тип транспорту
                    </FormLabel>
                    <ReactSelect
                      isMulti
                      // Додайте ці два пропси:
                      closeMenuOnSelect={false}
                      blurInputOnSelect={false}
                      noOptionsMessage={() => "Більше немає опцій"}
                      options={truckList}
                      styles={selectStyles(config) as any}
                      placeholder="Оберіть типи..."
                      value={truckList.filter((t) =>
                        field.value?.some(
                          (v: any) => v.ids_trailer_type === t.value,
                        ),
                      )}
                      onChange={(opts: any) =>
                        field.onChange(
                          opts?.map((o: any) => ({
                            ids_trailer_type: o.value,
                          })) || [],
                        )
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ОПИС ТА ЦІНА (Компактно) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-2">
                <FormField
                  control={control}
                  name="load_info"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={config.label}>Інформація</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className={`${config.main} min-h-[40px] rounded-xl py-1`}
                          placeholder="Вантаж, вага..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={config.label}>Ціна</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-10 rounded-xl"
                          // Важливо: перетворюємо рядок на число при зміні
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? null : Number(val));
                          }}
                          // Переконуємося, що value завжди рядок для інпуту
                          value={field.value ?? ""}
                          // Додатково: прибираємо фокус, щоб випадково не прокрутити значення
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="ids_valut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={config.label}>Валюта</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {valutList.map((v) => (
                            <SelectItem key={v.value} value={v.value}>
                              {v.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ПЕРЕМИКАЧІ */}
            <div className="flex gap-4 p-2 bg-slate-50 dark:bg-white/5 rounded-xl justify-between">
              <div className="flex items-center gap-6">
                {/* Збірний вантаж */}
                <FormField
                  control={form.control}
                  name="is_collective"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_collective" // Унікальний ID
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label
                        htmlFor="is_collective" // Зв'язок з ID
                        className={`${config.label} cursor-pointer select-none`}
                      >
                        Збірний
                      </Label>
                    </div>
                  )}
                />

                {/* Запит ціни */}
                <FormField
                  control={form.control}
                  name="is_price_request"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_price_request" // Унікальний ID
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label
                        htmlFor="is_price_request" // Зв'язок з ID
                        className={`${config.label} cursor-pointer select-none`}
                      >
                        Запит ціни
                      </Label>
                    </div>
                  )}
                />
              </div>

              <div className="flex items-center gap-2 bg-blue-50/50 dark:bg-blue-500/5 px-3 py-1.5 rounded-xl border border-blue-100/50 dark:border-blue-500/10">
                <div className="flex items-center gap-1.5">
                  <Label
                    htmlFor="is_next"
                    className={`${config.label} text-blue-600 dark:text-blue-400 cursor-pointer select-none font-medium`}
                  >
                    Ще одну
                  </Label>
                  {/* Додаємо тултіп з вашим текстом */}
                  <MyTooltip text="Форма не буде очищена після збереження, що дозволить швидко створити схожу заявку" />
                </div>

                <Switch
                  id="is_next"
                  checked={isNextCargo}
                  onCheckedChange={setIsNextCargo}
                />
              </div>
            </div>

            <div className="flex justify-end">
              {/* КНОПКА */}
              <Button
                type="submit"
                disabled={isLoading}
                className={`h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white ${config.label} font-bold transition-all shadow-md`}
              >
                {isLoading
                  ? "Збереження..."
                  : defaultValues
                    ? "Оновити"
                    : "Опублікувати вантаж"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
