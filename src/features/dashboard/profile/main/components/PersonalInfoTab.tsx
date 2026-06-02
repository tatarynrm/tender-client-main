"use client";

import React from "react";
import { useProfile } from "@/shared/hooks";
import {
  User,
  Contact,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { cn } from "@/shared/utils";

export function PersonalInfoTab() {
  const { profile, isProfileLoading } = useProfile();

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) return null;

  const roles = [];
  if (profile.role.is_admin) roles.push("адміністратор");
  if (profile.role.is_ict) roles.push("ICT");
  if (profile.role.is_manager) roles.push("менеджер");
  if (roles.length === 0) roles.push("користувач");

  const fields = [
    {
      label: "Ім'я та прізвище",
      value: `${profile.person.name} ${profile.person.surname}`,
      icon: User,
    },
    {
      label: "Посада",
      value: profile.department?.department_name || "Менеджер логіст",
      icon: Contact,
    },
    {
      label: "E-mail",
      value: profile.email,
      icon: Mail,
      isEmail: true,
    },
    {
      label: "Номер телефону",
      value: profile.person.phone || "(067) 443-43-70",
      icon: Phone,
    },
    {
      label: "Права доступу",
      value: roles.join(" / "),
      icon: ShieldCheck,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full pb-10"
    >
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-[#D0DDF0] dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-slate-800 dark:text-zinc-200" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-zinc-100">
            Особиста інформація
          </h2>
        </div>

        <div className="border border-[#D0DDF0] dark:border-zinc-800 rounded-xl p-6 flex flex-col gap-4 bg-[#F8FAFF] dark:bg-zinc-900/50 sm:bg-white sm:dark:bg-zinc-950">
          {fields.map((field, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
            >
              <div className="flex items-center gap-4 sm:w-64 shrink-0">
                <field.icon className="w-5 h-5 text-slate-800 dark:text-zinc-200" />
                <span className="text-[14px] font-bold text-slate-800 dark:text-zinc-200">
                  {field.label}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="w-full border border-[#D0DDF0] dark:border-zinc-700 rounded-[8px] p-2.5 px-4 bg-white dark:bg-zinc-900 shadow-sm">
                  <span
                    className={cn(
                      "text-[14px] font-semibold truncate block",
                      field.isEmail
                        ? "text-[#4863D4] dark:text-blue-400"
                        : "text-slate-600 dark:text-zinc-300"
                    )}
                  >
                    {field.value}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <ChangePasswordDialog>
              <button className="flex items-center gap-4 sm:w-64 shrink-0 text-[#4863D4] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-[14px] transition-colors group">
                <Lock className="w-5 h-5" />
                <span>Змінити пароль</span>
              </button>
            </ChangePasswordDialog>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
