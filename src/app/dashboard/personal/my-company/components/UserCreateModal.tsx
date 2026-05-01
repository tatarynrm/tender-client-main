"use client";

import { useForm, useFieldArray } from "react-hook-form";
import {
  X,
  Plus,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  MessageSquare,
  Shield,
  Loader2,
  Edit2,
} from "lucide-react";
import { Button, Input, Label, Switch } from "@/shared/components/ui";
import { useCompanyUsers } from "../hooks/useCompanyUsers";
import { cn } from "@/shared/utils";
import { createPortal } from "react-dom";
import { PhoneInput } from "@/shared/components/ui/phone-input";
import { useEffect, useState, useMemo } from "react";

interface UserCreateModalProps {
  onClose: () => void;
  userId?: number | string;
}

export function UserCreateModal({ onClose, userId }: UserCreateModalProps) {
  const { saveUser, getOneUser } = useCompanyUsers();
  const [isFetching, setIsFetching] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      person: {
        name: "",
        surname: "",
        last_name: "",
        ids_sex: "M",
        person_role: {
          is_admin: false,
          is_manager: true,
        },
        person_phone: [
          { phone: "", is_viber: true, is_telegram: true, is_whatsapp: false },
        ],
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "person.person_phone",
  });

  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        setIsFetching(true);
        try {
          const user = await getOneUser(userId);
          if (user) {
            setInitialData(user);
            form.reset({
              email: user.email || "",
              person: {
                name: user.person?.name || "",
                surname: user.person?.surname || "",
                last_name: user.person?.last_name || "",
                ids_sex: user.person?.ids_sex || "M",
                person_role: {
                  is_admin: !!user.person?.person_role?.is_admin,
                  is_manager: !!user.person?.person_role?.is_manager,
                },
                person_phone: user.person?.person_phone?.length
                  ? user.person.person_phone.map((p: any) => ({
                      phone: p.phone,
                      is_viber: !!p.is_viber,
                      is_telegram: !!p.is_telegram,
                      is_whatsapp: !!p.is_whatsapp,
                    }))
                  : [{ phone: "", is_viber: true, is_telegram: true, is_whatsapp: false }],
              },
            });
          }
        } catch (e) {
          console.error("Error fetching user:", e);
        } finally {
          setIsFetching(false);
        }
      };
      fetchUser();
    }
  }, [userId, getOneUser]);

  const onSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        id_person: initialData?.person?.id || null,
        person: {
          ...values.person,
          id: initialData?.person?.id || null,
          id_company: initialData?.person?.id_company || null,
        },
        ...(userId && { id: userId }),
      };
      await saveUser.mutateAsync(payload);
      onClose();
    } catch (e) {}
  };

  const isEdit = !!userId;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-950 w-full max-w-2xl rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              {isEdit ? <Edit2 size={20} /> : <UserPlus size={20} />}
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">
                {isEdit ? "Редагувати користувача" : "Додати користувача"}
              </h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                {isEdit
                  ? "Оновлення даних співробітника"
                  : "Створення нового облікового запису"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full transition-colors text-zinc-400"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-5 sm:p-8 space-y-6 sm:space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar relative"
        >
          {isFetching && (
            <div className="absolute inset-0 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-[2rem] sm:rounded-[2.5rem]">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          )}
          {/* PERSONAL INFO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                Прізвище
              </Label>
              <Input
                {...form.register("person.surname", { required: true })}
                placeholder="Іванов"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                Ім'я
              </Label>
              <Input
                {...form.register("person.name", { required: true })}
                placeholder="Іван"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                По батькові
              </Label>
              <Input
                {...form.register("person.last_name")}
                placeholder="Іванович"
                className="rounded-2xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
              Email (Логін)
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                {...form.register("email", { required: true })}
                type="email"
                placeholder="example@company.com"
                className="rounded-2xl pl-12"
              />
            </div>
          </div>

          {/* ROLES */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-white/5 pb-2">
              Права доступу
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-200">
                    Адмін
                  </span>
                  <span className="text-[9px] text-zinc-400 uppercase font-bold">
                    Повний доступ
                  </span>
                </div>
                <Switch
                  checked={form.watch("person.person_role.is_admin")}
                  onCheckedChange={(val) => form.setValue("person.person_role.is_admin", val)}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-200">
                    Менеджер
                  </span>
                  <span className="text-[9px] text-zinc-400 uppercase font-bold">
                    Робота з тендерами
                  </span>
                </div>
                <Switch
                  checked={form.watch("person.person_role.is_manager")}
                  onCheckedChange={(val) => form.setValue("person.person_role.is_manager", val)}
                />
              </div>
            </div>
          </div>

          {/* PHONES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Контактні телефони
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  append({
                    phone: "",
                    is_viber: true,
                    is_telegram: true,
                    is_whatsapp: false,
                  })
                }
                className="h-7 text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700"
              >
                <Plus size={14} className="mr-1" /> Додати телефон
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-4 items-start p-4 rounded-3xl bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 animate-in slide-in-from-top-2 duration-300"
                >
                  <div className="flex-1 space-y-2">
                    <PhoneInput
                      name={`person.person_phone.${index}.phone`}
                      control={form.control}
                      defaultCountry="UA"
                      className="rounded-2xl"
                    />
                    <div className="flex gap-4 ml-1">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          {...form.register(
                            `person.person_phone.${index}.is_viber` as const,
                          )}
                          className="hidden"
                        />
                        <div
                          className={cn(
                            "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
                            form.watch(`person.person_phone.${index}.is_viber`)
                              ? "bg-purple-500 border-purple-500 text-white"
                              : "border-zinc-200 dark:border-white/10",
                          )}
                        >
                          {form.watch(`person.person_phone.${index}.is_viber`) && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                          Viber
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          {...form.register(
                            `person.person_phone.${index}.is_telegram` as const,
                          )}
                          className="hidden"
                        />
                        <div
                          className={cn(
                            "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
                            form.watch(`person.person_phone.${index}.is_telegram`)
                              ? "bg-sky-500 border-sky-500 text-white"
                              : "border-zinc-200 dark:border-white/10",
                          )}
                        >
                          {form.watch(`person.person_phone.${index}.is_telegram`) && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                          Telegram
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          {...form.register(
                            `person.person_phone.${index}.is_whatsapp` as const,
                          )}
                          className="hidden"
                        />
                        <div
                          className={cn(
                            "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
                            form.watch(`person.person_phone.${index}.is_whatsapp`)
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-zinc-200 dark:border-white/10",
                          )}
                        >
                          {form.watch(`person.person_phone.${index}.is_whatsapp`) && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                          WhatsApp
                        </span>
                      </label>
                    </div>
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-zinc-400 hover:text-red-500 transition-colors mt-6"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl text-[11px] font-black uppercase tracking-[0.2em]"
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={saveUser.isPending}
              className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 text-[11px] font-black uppercase tracking-[0.2em]"
            >
              {saveUser.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isEdit ? (
                "Зберегти зміни"
              ) : (
                "Додати користувача"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
