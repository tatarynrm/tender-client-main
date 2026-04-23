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
  UserCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

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
      className="w-full max-w-5xl mx-auto"
    >
      <div className="bg-white/70 dark:bg-zinc-950/40 backdrop-blur-3xl rounded-[2rem] border border-zinc-200 dark:border-white/10 p-6 lg:p-10 shadow-sm relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full -ml-32 -mb-32" />

        <div className="flex items-center gap-4 mb-12 relative z-10">
          <div className="p-2.5 bg-zinc-100 dark:bg-white/5 rounded-2xl border border-zinc-200/50 dark:border-white/5 shadow-inner">
            <User className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-white">
            ОСОБИСТА ІНФОРМАЦІЯ
          </h2>
        </div>

        <div className="max-w-3xl ml-0 lg:ml-12 space-y-5 relative z-10">
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-[2rem] p-6 lg:p-8 shadow-sm">
            <div className="space-y-6">
              {fields.map((field, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-10 group">
                  <div className="flex items-center gap-4 w-56 shrink-0">
                    <div className="p-2 bg-zinc-50 dark:bg-white/5 rounded-xl group-hover:bg-blue-500/10 transition-colors">
                      <field.icon className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                      {field.label}
                    </span>
                  </div>
                  
                  <div className="flex-1 px-5 py-3.5 bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-white/5 rounded-2xl text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:border-blue-500/30 transition-all shadow-inner">
                    <span className={field.isEmail ? "text-blue-500 font-bold" : "font-semibold"}>
                      {field.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-white/5">
              <ChangePasswordDialog>
                <button className="flex items-center gap-3 text-blue-500 hover:text-blue-600 font-black uppercase tracking-widest text-[10px] transition-all group">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-sm">
                    <Lock className="w-3.5 h-3.5" />
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
