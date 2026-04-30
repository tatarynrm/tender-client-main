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
  // { id: "orders", label: "Заявки", icon: FileText },
  // { id: "analytics", label: "Аналітика", icon: BarChart },
  // { id: "system", label: "Системні повідомлення", icon: MailWarning },
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
            control: (base, state) => ({
              ...base,
              borderRadius: "14px",
              border: state.isFocused
                ? "1px solid #6366f1"
                : "1px solid #e2e8f0",
              boxShadow: state.isFocused
                ? "0 0 0 3px rgba(99, 102, 241, 0.1)"
                : "none",
              minHeight: "30px",
              backgroundColor: isDisabled ? "#f8fafc" : "white",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: state.isFocused ? "#6366f1" : "#cbd5e1",
              },
            }),
            placeholder: (base) => ({
              ...base,
              color: "#94a3b8",
              fontSize: "12px",
              fontWeight: "500",
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: "#f1f4f9",
              borderRadius: "8px",
              padding: "2px 6px",
            }),
            multiValueLabel: (base) => ({
              ...base,
              color: "#475569",
              fontSize: "11px",
              fontWeight: "700",
            }),
            multiValueRemove: (base) => ({
              ...base,
              color: "#94a3b8",
              cursor: "pointer",
              ":hover": {
                backgroundColor: "transparent",
                color: "#ef4444",
              },
            }),
            menu: (base) => ({
              ...base,
              zIndex: 9999,
              borderRadius: "16px",
              backgroundColor: "white",
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              padding: "4px",
              border: "1px solid #f1f5f9",
            }),
            option: (base, state) => ({
              ...base,
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "500",
              backgroundColor: state.isFocused ? "#f8fafc" : "transparent",
              color: state.isSelected ? "#6366f1" : "#475569",
              ":active": {
                backgroundColor: "#f1f5f9",
              },
            }),
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
        />
      )}
    />
  );

  const notifyDest = watch("notify_destination") || [];

  return (
    <div className="space-y-2 pb-24">
      {/* Категорії налаштувань */}
      <div className="flex flex-wrap items-center  bg-zinc-100/50 dark:bg-white/5  rounded-[1.5rem] border border-zinc-200/50 dark:border-white/5 w-fit">
        {SETTINGS_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "relative flex items-center gap-2.5 px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all duration-300 group",
                isActive
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-500/10 border border-zinc-200/50 dark:border-white/10"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200",
              )}
            >
              <cat.icon
                className={cn(
                  "w-4 h-4 transition-transform duration-500",
                  isActive
                    ? "scale-110"
                    : "group-hover:scale-110 group-hover:rotate-6",
                )}
              />
              <span className="relative z-10">{cat.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="w-full">
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
                <section className="p-4 border border-zinc-200/60 dark:border-white/10 rounded-[2rem] bg-white dark:bg-zinc-950/40 shadow-sm space-y-6 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-zinc-900 dark:text-white" />
                      <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                        Напрямки сповіщень
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
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
                        id_active: "tr",
                        label: "Міжнародні",
                        fromList: "tender_notify_tr_country_from",
                        fromOpts: countries,
                        fromKey: "ids_country",
                        toList: "tender_notify_tr_country_to",
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
                        id_active: "exp",
                        label: "Експорт",
                        fromList: "tender_notify_exp_region_from",
                        fromOpts: regions,
                        fromKey: "ids_region",
                        toList: "tender_notify_exp_country_to",
                        toOpts: countries,
                        toKey: "ids_country",
                      },
                    ].map((dir, i) => {
                      const isActive = watch(dir.id_active as any);
                      return (
                        <div
                          key={i}
                          className={cn(
                            "p-2 rounded-[1.5rem] transition-all duration-300 border",
                            isActive
                              ? "bg-white dark:bg-zinc-900 border-indigo-500/30 shadow-sm"
                              : "bg-zinc-50/30 dark:bg-zinc-900/10 border-transparent opacity-60",
                          )}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <Controller
                              name={dir.id_active as any}
                              control={control}
                              render={({ field }) => (
                                <div
                                  id={dir.id_active}
                                  className={cn(
                                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2",
                                    field.value
                                      ? "bg-indigo-600 shadow-lg shadow-indigo-500/20"
                                      : "bg-zinc-200 dark:bg-zinc-800",
                                  )}
                                  onClick={() => field.onChange(!field.value)}
                                >
                                  <motion.div
                                    className="h-3.5 w-3.5 rounded-full bg-white shadow-sm"
                                    animate={{ x: field.value ? 18 : 3 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 500,
                                      damping: 30,
                                    }}
                                  />
                                </div>
                              )}
                            />
                            <Label
                              htmlFor={dir.id_active}
                              onClick={() =>
                                setValue(
                                  dir.id_active as any,
                                  !watch(dir.id_active as any),
                                )
                              }
                              className="font-black uppercase text-[11px] text-zinc-900 dark:text-zinc-100 cursor-pointer tracking-widest select-none"
                            >
                              {dir.label}
                            </Label>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <div className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">
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
                              <div className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
                  {/* SECTION: TRAILERS */}
                  <div className="lg:col-span-4 space-y-4">
                    <section className="p-4 border border-zinc-200/60 dark:border-white/10 rounded-[2rem] bg-white dark:bg-zinc-950/40 shadow-sm h-full">
                      <div className="flex items-center gap-2 mb-6">
                        <Truck className="w-5 h-5 text-zinc-900 dark:text-white" />
                        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                          Тип транспорту
                        </h2>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-white/5 shadow-inner p-1">
                        {renderMultiSelect(
                          "tender_notify_trailer",
                          trailers,
                          "Виберіть тип причепів...",
                          "ids_trailer",
                        )}
                      </div>
                    </section>
                  </div>

                  {/* SECTION: MESSAGING TABLE */}
                  <div className="lg:col-span-8">
                    <NotificationChannelsTable
                      control={control}
                      nameRef="notify_destination"
                      items={notifyDest}
                      toggleAll={toggleAll}
                      title="Канали сповіщень"
                    />
                  </div>
                </div>

                {/* FINAL SUBMIT BUTTON */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-500/20 transition-all"
                  >
                    {updateMutation.isPending
                      ? "Збереження..."
                      : "Зберегти налаштування"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 lg:p-32 border border-dashed border-zinc-200 dark:border-white/10 rounded-[2.5rem] bg-white/50 dark:bg-zinc-950/40 backdrop-blur-2xl text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                <div className="relative z-10">
                  <div className="p-2 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-white/5 mb-8 text-zinc-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 mx-auto w-fit">
                    {activeCategory === "system" ? (
                      <MailWarning className="w-10 h-10 text-amber-500" />
                    ) : (
                      <Globe className="w-10 h-10 text-indigo-500" />
                    )}
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-800 dark:text-zinc-100 mb-3">
                    {
                      SETTINGS_CATEGORIES.find((c) => c.id === activeCategory)
                        ?.label
                    }
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto font-medium leading-relaxed mb-8">
                    Цей розділ наразі перебуває в стадії розробки. <br />
                    Специфічні сповіщення для цієї категорії з'являться в
                    наступних оновленнях.
                  </p>
                  <div className="mx-auto w-fit px-5 py-2.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm text-[10px] uppercase font-black tracking-[0.2em] animate-pulse">
                    Розробляється
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
