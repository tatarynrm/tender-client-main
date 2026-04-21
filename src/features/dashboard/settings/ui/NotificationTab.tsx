"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Label } from "@/shared/components/ui";
import { Checkbox } from "@/shared/components/ui/checkbox";
import ReactSelect from "react-select";
import api from "@/shared/api/instance.api";
import Loading from "@/shared/components/ui/Loading";
import { useNotificationSettings } from "../hooks/useNotificationSettings";
import {
  Globe,
  Truck,
  Bell,
  CheckSquare,
  Square,
  FileText,
  BarChart,
  MailWarning,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/utils";
import { toast } from "sonner";
import { NotificationChannelsTable } from "../components/NotificationChannelsTable";

interface NotifyDestination {
  value: string;
  ids_notify_type: string;
  to_web: boolean;
  to_email: boolean;
  to_telegram: boolean;
  to_viber?: boolean;
  to_whatsapp?: boolean;
}

interface NotificationFormValues {
  id: string | number | null;
  tr: boolean;
  exp: boolean;
  imp: boolean;
  reg: boolean;
  trailer_any: boolean;
  imp_region_to_any: boolean;
  reg_region_to_any: boolean;
  tr_country_to_any: boolean;
  exp_country_to_any: boolean;
  exp_region_from_any: boolean;
  reg_region_from_any: boolean;
  tr_country_from_any: boolean;
  imp_country_from_any: boolean;
  notify_destination: NotifyDestination[];
  tender_notify_trailer: any[];
  tender_notify_imp_region_to: any[];
  tender_notify_reg_region_to: any[];
  tender_notify_tr_country_to: any[];
  tender_notify_exp_country_to: any[];
  tender_notify_exp_region_from: any[];
  tender_notify_reg_region_from: any[];
  tender_notify_tr_country_from: any[];
  tender_notify_imp_country_from: any[];
}

const DEFAULT_EVENTS: NotifyDestination[] = [
  {
    value: "Про плановий тендер",
    ids_notify_type: "TENDER_PLAN",
    to_web: false,
    to_email: false,
    to_telegram: false,
    to_viber: false,
    to_whatsapp: false,
  },
  {
    value: "Про початок тендеру",
    ids_notify_type: "TENDER_ACTUAL",
    to_web: false,
    to_email: false,
    to_telegram: false,
    to_viber: false,
    to_whatsapp: false,
  },
  {
    value: "Про зміни у тендері",
    ids_notify_type: "TENDER_CHANGED",
    to_web: false,
    to_email: false,
    to_telegram: false,
    to_viber: false,
    to_whatsapp: false,
  },
  {
    value: "Про пролонгацію тендеру",
    ids_notify_type: "TENDER_PROLONGATION",
    to_web: false,
    to_email: false,
    to_telegram: false,
    to_viber: false,
    to_whatsapp: false,
  },
  {
    value: "Про закінчення тендеру",
    ids_notify_type: "TENDER_CLOSED",
    to_web: false,
    to_email: false,
    to_telegram: false,
    to_viber: false,
    to_whatsapp: false,
  },
  {
    value: "Про результати тендеру",
    ids_notify_type: "TENDER_RESULT",
    to_web: false,
    to_email: false,
    to_telegram: false,
    to_viber: false,
    to_whatsapp: false,
  },
  {
    value: "Кастомні повідомлення",
    to_web: false,
    to_email: false,
    to_viber: false,
    to_telegram: false,
    to_whatsapp: false,
    ids_notify_type: "TENDER_MESSAGE_ANY",
  },
];

const SETTINGS_CATEGORIES = [
  { id: "tenders", label: "Тендери", icon: Truck },
  { id: "orders", label: "Заявки", icon: FileText },
  { id: "analytics", label: "Аналітика", icon: BarChart },
  { id: "system", label: "Системні повідомлення", icon: MailWarning },
];

export function NotificationsTab() {
  const [activeCategory, setActiveCategory] = useState("tenders");
  const {
    data: settingsData,
    isLoading,
    updateMutation,
  } = useNotificationSettings();
  const [trailers, setTrailers] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [regions, setRegions] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [countries, setCountries] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data } = await api.get("/notification/form-data");
        const content = Array.isArray(data) ? data[0] : data?.content || data;
        if (content) {
          if (content.trailer_type_dropdown)
            setTrailers(
              content.trailer_type_dropdown.map((t: any) => ({
                value: t.ids,
                label: t.value || t.ids,
              })),
            );
          if (content.region_dropdown)
            setRegions(
              content.region_dropdown.map((r: any) => ({
                value: r.ids,
                label: r.region_name || r.short_name || r.ids,
              })),
            );
          if (content.country_dropdown)
            setCountries(
              content.country_dropdown.map((c: any) => ({
                value: c.ids,
                label: c.country_name || c.ids,
              })),
            );
        }
      } catch (err) {
        console.error("Failed dictionary load", err);
      }
    };
    fetchOptions();
  }, []);

  const form = useForm<NotificationFormValues>({
    defaultValues: {
      id: null,
      tr: false,
      exp: false,
      imp: false,
      reg: false,
      trailer_any: false,
      imp_region_to_any: false,
      reg_region_to_any: false,
      tr_country_to_any: false,
      exp_country_to_any: false,
      exp_region_from_any: false,
      reg_region_from_any: false,
      tr_country_from_any: false,
      imp_country_from_any: false,
      notify_destination: DEFAULT_EVENTS,
      tender_notify_trailer: [],
      tender_notify_imp_region_to: [],
      tender_notify_reg_region_to: [],
      tender_notify_tr_country_to: [],
      tender_notify_exp_country_to: [],
      tender_notify_exp_region_from: [],
      tender_notify_reg_region_from: [],
      tender_notify_tr_country_from: [],
      tender_notify_imp_country_from: [],
    },
  });

  const { control, handleSubmit, reset, watch, setValue } = form;

  useEffect(() => {
    if (settingsData) {
      const existingEvents = settingsData.notify_destination || [];

      // Use a Map to deduplicate by ids_notify_type, prioritizing the first occurrence from database
      const dedupedMap = new Map<string, NotifyDestination>();

      existingEvents.forEach((event: NotifyDestination) => {
        if (!dedupedMap.has(event.ids_notify_type)) {
          dedupedMap.set(event.ids_notify_type, event);
        }
      });

      // Fill in missing events from DEFAULT_EVENTS
      DEFAULT_EVENTS.forEach((def) => {
        if (!dedupedMap.has(def.ids_notify_type)) {
          dedupedMap.set(def.ids_notify_type, def);
        }
      });

      const mergedData: NotificationFormValues = {
        ...settingsData,
        notify_destination: Array.from(dedupedMap.values()).sort((a, b) => {
          const order = DEFAULT_EVENTS.map((e) => e.ids_notify_type);
          return (
            order.indexOf(a.ids_notify_type) - order.indexOf(b.ids_notify_type)
          );
        }),
      };
      reset(mergedData);
    }
  }, [settingsData, reset]);

  if (isLoading)
    return (
      <div className="py-20 flex justify-center">
        <Loading />
      </div>
    );

  const onSubmit = (formData: NotificationFormValues) => {
    toast.promise(updateMutation.mutateAsync(formData), {
      loading: "Збереження налаштувань...",
      success: "Налаштування сповіщень успішно збережено",
      error: "Не вдалося зберегти налаштування",
    });
  };

  const toggleAll = (
    field: "to_telegram" | "to_email" | "to_web",
    value: boolean,
  ) => {
    const current = watch("notify_destination");
    const updated = current.map((item) => ({ ...item, [field]: value }));
    setValue("notify_destination", updated);
  };

  const renderMultiSelect = (
    name: keyof NotificationFormValues,
    options: { value: string; label: string }[],
    placeholder: string,
    keyMapping: string,
    isDisabled: boolean = false,
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <ReactSelect
          isMulti
          options={options}
          closeMenuOnSelect={false}
          blurInputOnSelect={false}
          isDisabled={isDisabled}
          value={options.filter((opt) =>
            (field.value as any[])?.some(
              (val: any) => val[keyMapping] === opt.value,
            ),
          )}
          onChange={(selected: any) =>
            field.onChange(
              selected
                ? selected.map((opt: any) => ({
                    id_parent: form.getValues("id"),
                    [keyMapping]: opt.value,
                  }))
                : [],
            )
          }
          placeholder={isDisabled ? "Напрямок вимкнено" : placeholder}
          className="w-full text-[12px]"
          classNamePrefix="my-react-select"
          menuPortalTarget={
            typeof document !== "undefined" ? document.body : null
          }
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "none",
              minHeight: "36px",
              backgroundColor: isDisabled ? "#f9fafb" : "white",
              "&:hover": { border: "1px solid #3b82f6" },
            }),
            menu: (base) => ({
              ...base,
              zIndex: 9999,
              borderRadius: "8px",
              backgroundColor: "white",
            }),
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
        />
      )}
    />
  );

  const notifyDest = watch("notify_destination") || [];

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-24">
      {/* Лівий сайдбар з меню категорій */}
      <div className="w-full md:w-64 flex flex-col gap-2 shrink-0 md:border-r border-zinc-200/80 dark:border-white/5 md:pr-6">
        {SETTINGS_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "text-left px-4 py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-3 text-[13px] group border",
              activeCategory === cat.id
                ? "bg-[#6366f1]/10 text-[#6366f1] dark:bg-indigo-500/20 dark:text-indigo-400 border-[#6366f1]/20 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-transparent hover:border-zinc-200 dark:hover:border-white/5",
            )}
          >
            <cat.icon
              className={cn(
                "w-5 h-5 transition-colors",
                activeCategory === cat.id
                  ? "text-[#6366f1] dark:text-indigo-400"
                  : "text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300",
              )}
            />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 w-full ">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeCategory === "tenders" ? (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 animate-in fade-in duration-500 overflow-visible"
              >
                {/* SECTION: DIRECTIONS */}
                <section className="p-6 border border-zinc-200 dark:border-white/10 rounded-[2rem] bg-white/50 dark:bg-zinc-950/40 backdrop-blur-3xl shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-white/5 pb-4">
                    <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-base font-black uppercase tracking-tight text-zinc-800 dark:text-white">
                      Напрямки сповіщень
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        id_active: "reg",
                        label: "По Україні",
                        fromList: "tender_notify_reg_region_from",
                        fromOpts: regions,
                        fromKey: "ids_region",
                        toList: "tender_notify_reg_region_to",
                        toOpts: regions,
                        toKey: "ids_region",
                      },
                      {
                        id_active: "exp",
                        label: "Експорт",
                        fromList: "tender_notify_exp_region_from",
                        fromOpts: regions,
                        fromKey: "ids_region",
                        toList: "tender_notify_exp_country_to",
                        toOpts: countries,
                        toKey: "ids_country",
                      },
                      {
                        id_active: "imp",
                        label: "Імпорт",
                        fromList: "tender_notify_imp_country_from",
                        fromOpts: countries,
                        fromKey: "ids_country",
                        toList: "tender_notify_imp_region_to",
                        toOpts: regions,
                        toKey: "ids_region",
                      },
                      {
                        id_active: "tr",
                        label: "Міжнародні",
                        fromList: "tender_notify_tr_country_from",
                        fromOpts: countries,
                        fromKey: "ids_country",
                        toList: "tender_notify_tr_country_to",
                        toOpts: countries,
                        toKey: "ids_country",
                      },
                    ].map((dir, i) => {
                      const isActive = watch(dir.id_active as any);
                      return (
                        <div
                          key={i}
                          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-sm space-y-4 transition-all hover:shadow-md"
                        >
                          <div className="flex items-center justify-between border-b border-zinc-50 dark:border-white/5 pb-2">
                            <div className="flex items-center gap-3">
                              <Controller
                                name={dir.id_active as any}
                                control={control}
                                render={({ field }) => (
                                  <Checkbox
                                    id={dir.id_active}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="w-5 h-5 rounded-md"
                                  />
                                )}
                              />
                              <Label
                                htmlFor={dir.id_active}
                                className="font-black uppercase text-[11px] text-zinc-700 dark:text-zinc-200 cursor-pointer"
                              >
                                {dir.label}
                              </Label>
                            </div>
                          </div>

                          <div
                            className={`grid grid-cols-1 gap-3 transition-opacity duration-300 ${!isActive ? "opacity-50" : "opacity-100"}`}
                          >
                            <div className="space-y-1.5">
                              <div className="text-[9px] font-black uppercase text-zinc-400 px-1">
                                Звідки
                              </div>
                              {renderMultiSelect(
                                dir.fromList as any,
                                dir.fromOpts,
                                "Виберіть звідки...",
                                dir.fromKey,
                                !isActive,
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <div className="text-[9px] font-black uppercase text-zinc-400 px-1">
                                Куди
                              </div>
                              {renderMultiSelect(
                                dir.toList as any,
                                dir.toList ? dir.toOpts : [],
                                "Виберіть куди...",
                                dir.toKey,
                                !isActive,
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* SECTION: TRAILERS */}
                <section className="p-6 border border-zinc-200 dark:border-white/10 rounded-[2rem] bg-white/50 dark:bg-zinc-950/40 backdrop-blur-3xl shadow-sm">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-600 rounded-xl shadow-lg">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-base font-black uppercase text-zinc-800 dark:text-white">
                        Тип транспорту
                      </h2>
                    </div>
                    <div className="flex-1 w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-white/5 shadow-inner">
                      {renderMultiSelect(
                        "tender_notify_trailer",
                        trailers,
                        "Виберіть типи причепів...",
                        "ids_trailer",
                      )}
                    </div>
                  </div>
                </section>

                {/* SECTION: MESSAGING TABLE */}
                <NotificationChannelsTable
                  control={control}
                  nameRef="notify_destination"
                  items={notifyDest}
                  toggleAll={toggleAll}
                  title="Канали сповіщень (Тендери)"
                />

                {/* FINAL SUBMIT BUTTON */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-7 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    {updateMutation.isPending
                      ? "Збереження..."
                      : "Зберегти налаштування"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 lg:p-24 border border-dashed border-zinc-200 dark:border-white/10 rounded-3xl lg:rounded-[2rem] bg-white/50 dark:bg-zinc-950/40 backdrop-blur-2xl text-center">
                <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-full shadow-inner border border-zinc-100 dark:border-white/5 mb-4 text-zinc-400">
                  {activeCategory === "system" ? (
                    <MailWarning className="w-8 h-8" />
                  ) : (
                    <Globe className="w-8 h-8" />
                  )}
                </div>
                <h2 className="text-xl font-black uppercase text-zinc-700 dark:text-zinc-200">
                  {
                    SETTINGS_CATEGORIES.find((c) => c.id === activeCategory)
                      ?.label
                  }
                </h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Цей розділ наразі перебуває в стадії розробки. Специфічні
                  сповіщення з'являться незабаром.
                </p>
                <div className="mt-6 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm text-[10px] uppercase font-black">
                  У розробці
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
