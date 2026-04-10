"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Label } from "@/shared/components/ui";
import { Checkbox } from "@/shared/components/ui/checkbox";
import ReactSelect from "react-select";
import api from "@/shared/api/instance.api";
import Loading from "@/shared/components/ui/Loading";
import { useNotificationSettings } from "../hooks/useNotificationSettings";
import { Globe, Truck, Bell, CheckSquare, Square } from "lucide-react";

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
    value: "Зміна статусу тендеру",
    ids_notify_type: "TENDER_STATUS_CHANGED",
    to_web: false,
    to_email: false,
    to_telegram: false,
    to_viber: false,
    to_whatsapp: false,
  },
];

export function NotificationsTab() {
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

  const onSubmit = (formData: NotificationFormValues) =>
    updateMutation.mutate(formData);

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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 pb-24 animate-in fade-in duration-500 overflow-visible "
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
      <section className="p-6 border border-zinc-200 dark:border-white/10 rounded-[2rem] bg-white/50 dark:bg-zinc-950/40 backdrop-blur-3xl shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-white/5 pb-4">
          <div className="p-2 bg-zinc-900 dark:bg-white rounded-xl shadow-lg">
            <Bell className="w-5 h-5 text-white dark:text-zinc-900" />
          </div>
          <h2 className="text-base font-black uppercase text-zinc-800 dark:text-white">
            Канали сповіщень
          </h2>
        </div>

        <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden max-w-4xl mx-auto">
          {/* SCROLLABLE WRAPPER FOR TABLE */}
          <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
            <table className="w-full border-separate border-spacing-0 min-w-[650px]">
              <thead>
                <tr className="text-[9px] font-black uppercase text-white h-16">
                  <th className="p-4 text-left text-zinc-400 bg-zinc-50 dark:bg-zinc-800/30 border-b dark:border-white/5 sticky left-0 z-10 backdrop-blur-sm">
                    Подія
                  </th>
                  {[
                    {
                      id: "to_telegram",
                      label: "Telegram",
                      bg: "bg-[#007cc3]",
                    },
                    { id: "to_email", label: "Email", bg: "bg-[#0070b4]" },
                    { id: "to_web", label: "WEB", bg: "bg-[#005a96]" },
                  ].map((col) => (
                    <th
                      key={col.id}
                      className={`${col.bg} p-2 text-center border-l border-white/10`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span>{col.label}</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => toggleAll(col.id as any, true)}
                            className="p-1 px-2 rounded-md bg-white/20 hover:bg-white/40 transition-colors flex items-center gap-1"
                          >
                            <CheckSquare className="w-3 h-3" />{" "}
                            <span className="text-[7px]">ВСІ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAll(col.id as any, false)}
                            className="p-1 px-2 rounded-md bg-white/10 hover:bg-white/30 transition-colors flex items-center gap-1"
                          >
                            <Square className="w-3 h-3" />{" "}
                            <span className="text-[7px]">ЖОДНОГО</span>
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                {notifyDest.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all h-14 group"
                  >
                    <td className="p-4 px-6 text-[12px] font-bold text-zinc-600 dark:text-zinc-400 sticky left-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-r dark:border-white/5">
                      {item.value}
                    </td>
                    {(["to_telegram", "to_email", "to_web"] as const).map(
                      (field) => (
                        <td
                          key={field}
                          className="p-4 text-center border-l border-zinc-100 dark:border-white/5"
                        >
                          <div className="flex justify-center">
                            <Controller
                              name={
                                `notify_destination.${index}.${field}` as const
                              }
                              control={control}
                              render={({ field: cb }) => (
                                <input
                                  type="checkbox"
                                  checked={!!cb.value}
                                  onChange={(e) =>
                                    cb.onChange(e.target.checked)
                                  }
                                  className="w-6 h-6 border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer rounded-lg checked:bg-blue-600 appearance-none flex items-center justify-center after:content-['✓'] after:text-white after:font-black after:text-sm after:hidden checked:after:block transition-all shadow-sm focus:ring-2 focus:ring-blue-500/20"
                                />
                              )}
                            />
                          </div>
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FINAL SUBMIT BUTTON */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-7 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          {updateMutation.isPending ? "Збереження..." : "Зберегти налаштування"}
        </Button>
      </div>
    </form>
  );
}
