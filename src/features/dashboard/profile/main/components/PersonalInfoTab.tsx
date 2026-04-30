"use client";

import React from "react";
import { useProfile } from "@/shared/hooks";
import {
  User,
  Briefcase,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  UserCircle,
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
      label: "Імя та прізвище",
      value: `${profile.person.name} ${profile.person.surname}`,
      icon: UserCircle,
    },
    {
      label: "Посада",
      value: profile.department?.department_name || "Менеджер логіст",
      icon: Briefcase,
    },
    {
      label: "E-mail",
      value: profile.email,
      icon: Mail,
      isEmail: true,
    },
    {
      label: "Номер телефону",
      value: profile.person.phone || "+380504308661",
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
      className="w-full"
    >
      <div className="bg-white dark:bg-zinc-950/40 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 p-10 lg:p-12 shadow-sm relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />

        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="w-6 h-6 flex items-center justify-center">
            <User className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            ОСОБИСТА ІНФОРМАЦІЯ
          </h2>
        </div>

        <div className="relative z-10 p-8 lg:p-10 rounded-[2.5rem] border border-zinc-100/80 dark:border-white/5 bg-zinc-50/10 dark:bg-zinc-900/10">
          <div className="space-y-6 max-w-4xl">
            {fields.map((field, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12 group"
              >
                <div className="flex items-center gap-4 w-56 shrink-0">
                  <div className="flex items-center justify-center">
                    <field.icon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                  </div>
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {field.label}
                  </span>
                </div>

                <div className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-white/10 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 shadow-sm transition-all">
                  <span
                    className={cn(
                      "font-semibold",
                      field.isEmail
                        ? "text-blue-500"
                        : "text-zinc-600 dark:text-zinc-400",
                    )}
                  >
                    {field.value}
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <ChangePasswordDialog>
                <button className="flex items-center gap-3 text-blue-500 hover:text-blue-600 font-bold text-sm transition-all group">
                  <div className="flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  Змінити пароль
                </button>
              </ChangePasswordDialog>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
