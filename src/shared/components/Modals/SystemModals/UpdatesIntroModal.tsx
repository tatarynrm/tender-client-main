"use client";

import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";
import { AppBaseModal } from "../AppBaseModal";
import { useLocalStorageState } from "@/shared/hooks/useLocalStorageForModal";

export function UpdatesIntroModal() {
  const [viewedSteps, setStepViewed] = useLocalStorageState("app_onboarding", {
    updates_intro: false,
  });

  const isOpen = !viewedSteps.updates_intro;

  const handleConfirm = () => {
    setStepViewed("updates_intro", true);
  };

  if (!isOpen) return null;

  return (
    <AppBaseModal
      isOpen={isOpen}
      onClose={handleConfirm}
      closeOnBackdropClick={false}
      // Робимо модалку ширшою на десктопі, але стандартною на мобілці
      className="md:max-w-4xl !p-0 overflow-hidden" 
      maxWidth="max-w-[min(95vw,500px)] md:max-w-4xl"
    >
      <div className="flex flex-col md:flex-row-reverse h-full max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-hidden bg-white dark:bg-zinc-950">
        
        {/* ТЕКСТОВА ЧАСТИНА */}
        <div className="flex flex-col p-6 md:p-12 md:w-1/2">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-teal-50 dark:bg-teal-500/10 rounded-xl md:rounded-2xl text-teal-600">
              <Sparkles size={28} className="md:w-8 md:h-8" />
            </div>

            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-3 md:mb-4 dark:text-white leading-tight">
              Ми стали <br className="md:hidden" /> ще кращими!
            </h3>

            <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 md:mb-8">
              Ми запустили <span className="text-teal-600 font-bold">Журнал оновлень</span>.
              Тепер всі покращення зібрані в одному місці.
            </p>

            <button
              onClick={handleConfirm}
              className="group w-full py-4 bg-zinc-950 dark:bg-white dark:text-zinc-950 text-white rounded-xl text-xs md:text-sm uppercase font-black flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
            >
              Зрозуміло
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* ФОТО ЧАСТИНА */}
        {/* h-[200px] на мобільці замість 300px, щоб залишити місце для тексту */}
        <div className="relative w-full h-[200px] sm:h-[250px] md:h-auto md:w-1/2 bg-zinc-50 dark:bg-zinc-900 border-t md:border-t-0 md:border-r border-zinc-100 dark:border-white/5">
          <Image
            src="/learn/updates.png"
            alt="Updates Interface"
            fill
            className="object-contain "
            priority
          />
          {/* Тінь зверху на мобільці для переходу */}
          <div className="md:hidden absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/5 to-transparent" />
        </div>

      </div>
    </AppBaseModal>
  );
}