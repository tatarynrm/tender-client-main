"use client";

import React, { useState, useEffect } from "react";
import { 
  Send, 
  Users, 
  Building2, 
  ShieldCheck, 
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  X,
  Target,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/utils";
import api from "@/shared/api/instance.api";
import { toast } from "sonner";
import AsyncSelect from "react-select/async";

export default function TelegramBroadcastPage() {
  const [message, setMessage] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<any[]>([]);
  const [onlyICT, setOnlyICT] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Fetch stats on mount
  useEffect(() => {
    api.get("/admin/telegram-stats").then(({ data }) => setStats(data));
  }, []);

  const loadCompanies = async (inputValue: string) => {
    try {
      const { data } = await api.get(`/company/all?search=${inputValue}`);
      const list = data.data?.list || [];
      return list.map((c: any) => ({
        value: c.id,
        label: `${c.company_name} (${c.edrpou || 'ID ' + c.id})`
      }));
    } catch (err) {
      return [];
    }
  };

  const handleSend = async () => {
    setShowConfirm(false);
    if (!message.trim()) {
      toast.error("Введіть текст повідомлення");
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        message,
        filter: {
          companyIds: selectedCompanies.map(c => c.value),
          onlyICT
        }
      };

      const { data } = await api.post("/admin/telegram-broadcast", payload);
      
      toast.success(`Розсилка завершена! Надіслано: ${data.success}, Помилок: ${data.failed}`);
      setMessage("");
      setSelectedCompanies([]);
      setOnlyICT(false);
    } catch (error) {
      console.error(error);
      toast.error("Сталася помилка при відправці розсилки");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600 rounded-[22px] shadow-xl shadow-indigo-500/20 rotate-3 group-hover:rotate-0 transition-transform">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
              Telegram Розсилка
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm">
                Централізована відправка повідомлень підписникам боту
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex gap-4">
          <StatCard 
            label="Підписники" 
            value={stats?.total || 0} 
            icon={Users} 
            color="indigo" 
          />
          <StatCard 
            label="ICT Менеджери" 
            value={stats?.ict_count || 0} 
            icon={ShieldCheck} 
            color="blue" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-950 rounded-[40px] border border-zinc-200 dark:border-white/5 p-8 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="space-y-8 relative z-10">
              {/* Message */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">
                    Текст повідомлення (HTML підтримується)
                  </label>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    message.length > 3500 ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-500"
                  )}>
                    {message.length} / 4096
                  </span>
                </div>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Привіт! Починаємо технічні роботи о 22:00..."
                  className="min-h-[220px] rounded-3xl bg-zinc-50/50 dark:bg-white/5 border-zinc-100 dark:border-white/5 focus:ring-indigo-500 dark:focus:ring-indigo-500 transition-all text-lg font-medium p-8 resize-none shadow-inner"
                />
              </div>

              {/* Targeting */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                   <Target className="w-4 h-4 text-indigo-500" />
                   <h3 className="text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300">Націлювання</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 ml-1 italic">Обмежити по компаніям (залиште пустим для всіх)</label>
                    <AsyncSelect
                      isMulti
                      cacheOptions
                      defaultOptions
                      loadOptions={loadCompanies}
                      value={selectedCompanies}
                      onChange={(val: any) => setSelectedCompanies(val)}
                      placeholder="Почніть вводити назву компанії..."
                      className="text-sm react-select-container"
                      classNamePrefix="react-select"
                      styles={customSelectStyles}
                    />
                  </div>

                  <div 
                    onClick={() => setOnlyICT(!onlyICT)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all",
                      onlyICT 
                        ? "bg-blue-50/50 border-blue-500 dark:bg-blue-500/10" 
                        : "bg-zinc-50 dark:bg-white/5 border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        onlyICT ? "bg-blue-500 text-white" : "bg-zinc-200 dark:bg-white/10 text-zinc-500"
                      )}>
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight">Тільки менеджери ICT</p>
                        <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 italic">Відправка лише внутрішнім співробітникам</p>
                      </div>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      onlyICT ? "border-blue-500 bg-blue-500" : "border-zinc-300 dark:border-white/10"
                    )}>
                      {onlyICT && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowConfirm(true)}
                disabled={isSending || !message.trim()}
                className="w-full h-20 rounded-[28px] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 transition-all active:scale-95 flex gap-4 overflow-hidden relative group"
              >
                 <span className="relative z-10 flex items-center gap-3">
                    Почати розсилку
                    <Send className={cn("w-5 h-5", !isSending && "group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform")} />
                 </span>
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[40px] p-8 text-white shadow-2xl shadow-indigo-600/30 overflow-hidden relative">
             <div className="absolute bottom-0 right-0 opacity-10 -mr-8 -mb-8">
                <BarChart3 className="w-48 h-48" />
             </div>
             <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4 leading-tight">Важлива інформація</h3>
                <ul className="space-y-4">
                  <ListItem text="Розсилка працює в асинхронному режимі (25 пов/сек)." />
                  <ListItem text="Повідомлення отримають ТІЛЬКИ ті користувачі, які активували бота." />
                  <ListItem text="Використовуйте <b>, <i>, <a> теги для форматування тексту." />
                  <ListItem text="Заборонено відправляти спам або несанкціоновану рекламу." />
                </ul>
             </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200/50 dark:border-amber-900/20 rounded-[40px] p-8 space-y-4">
             <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
                <AlertCircle className="w-6 h-6" />
                <h4 className="font-black uppercase text-sm tracking-widest">Увага</h4>
             </div>
             <p className="text-sm font-bold text-amber-800/80 dark:text-amber-500/80 leading-relaxed">
                Операція розсилки є незворотною. Після натискання кнопки "Так, відправити", бот почне розсилати повідомлення всім вибраним одержувачам.
             </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[48px] border border-zinc-200 dark:border-white/5 p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 via-amber-500 to-indigo-500" />
              
              <div className="flex flex-col items-center text-center space-y-6">
                 <div className="p-5 bg-red-50 dark:bg-red-500/10 rounded-full">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                 </div>
                 
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase text-zinc-900 dark:text-white">Підтвердження відправки</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
                       Ви впевнені, що хочете почати розсилку?
                    </p>
                 </div>

                 <div className="w-full p-6 bg-zinc-50 dark:bg-white/5 rounded-3xl border border-dashed border-zinc-200 dark:border-white/10 text-left">
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Отримувачі:</p>
                    <p className="text-sm font-black text-indigo-600">
                       {selectedCompanies.length > 0 
                          ? `${selectedCompanies.length} вибр. компаній` 
                          : onlyICT ? "Тільки менеджери ICT" : "Усі підписники бота"}
                    </p>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Button 
                       variant="outline"
                       onClick={() => setShowConfirm(false)}
                       className="flex-1 h-16 rounded-2xl border-2 font-black uppercase text-xs"
                    >
                       Скасувати
                    </Button>
                    <Button 
                       onClick={handleSend}
                       className="flex-1 h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs shadow-xl shadow-indigo-500/20"
                    >
                       Так, відправити
                    </Button>
                 </div>
              </div>

              <button 
                onClick={() => setShowConfirm(false)}
                className="absolute top-6 right-6 p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sending Overlay */}
      <AnimatePresence>
        {isSending && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center">
             <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-md" />
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white dark:bg-zinc-900 p-12 rounded-[50px] shadow-3xl text-center space-y-6 max-w-md w-full border border-indigo-100 dark:border-indigo-500/20"
             >
                <div className="relative">
                  <div className="w-24 h-24 border-8 border-indigo-100 dark:border-white/5 rounded-full mx-auto" />
                  <div className="w-24 h-24 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0 mx-auto" />
                  <SiTelegram className="w-10 h-10 text-indigo-600 absolute inset-0 m-auto" />
                </div>
                <div className="space-y-2">
                   <h4 className="text-2xl font-black uppercase">Відправка триває</h4>
                   <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                      Будь ласка, не закривайте сторінку до завершення операції.
                   </p>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .react-select__control {
          background-color: transparent !important;
          border-radius: 1rem !important;
          border-width: 2px !important;
          padding: 0.5rem !important;
          transition: all 0.2s !important;
        }
        .dark .react-select__control {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-color: transparent !important;
        }
        .react-select__control:hover {
          border-color: #6366f1 !important;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-zinc-950 p-4 px-6 rounded-[28px] border border-zinc-200 dark:border-white/5 shadow-sm flex items-center gap-4">
    <div className={cn(
      "p-3 rounded-2xl",
      color === 'indigo' ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" : "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
    )}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-black tracking-tighter">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
    </div>
  </div>
);

const ListItem = ({ text }: { text: string }) => (
  <li className="flex gap-3 text-sm font-bold">
    <div className="h-2 w-2 rounded-full bg-white/40 mt-1.5 shrink-0" />
    <span dangerouslySetInnerHTML={{ __html: text }} />
  </li>
);

const customSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    boxShadow: 'none',
    borderColor: state.isFocused ? '#6366f1' : 'transparent',
    '&:hover': {
      borderColor: '#6366f1'
    }
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: '#6366f115',
    borderRadius: '8px',
    padding: '2px 8px'
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: '#6366f1',
    fontWeight: '800',
    fontSize: '11px',
    textTransform: 'uppercase'
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: '#6366f1',
    '&:hover': {
      backgroundColor: '#fecaca',
      color: '#ef4444'
    }
  })
};

const SiTelegram = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.944 0C5.347 0 0 5.347 0 11.944c0 6.595 5.347 11.944 11.944 11.944 6.596 0 11.944-5.349 11.944-11.944C23.888 5.347 18.54 0 11.944 0zM18.17 7.749c-.197 2.068-1.047 7.078-1.481 9.401-.183.984-.544 1.314-.895 1.346-.763.07-1.341-.505-2.081-.99-1.157-.76-1.81-1.233-2.934-1.972-1.298-.853-.457-1.321.283-2.091.192-.202 3.551-3.257 3.616-3.535.008-.035.016-.165-.06-.232-.077-.067-.19-.044-.271-.026-.115.025-1.944 1.234-5.485 3.626-.518.356-.988.532-1.408.522-.463-.011-1.353-.263-2.016-.479-.812-.264-1.458-.405-1.402-.854.029-.234.35-.473.964-.716 3.778-1.646 6.297-2.731 7.556-3.256 3.596-1.5 4.342-1.761 4.829-1.77.107-.002.344.024.498.15.13.105.166.248.179.351.013.104.015.343.003.447z" />
  </svg>
);
