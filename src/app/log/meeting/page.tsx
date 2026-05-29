"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ExternalLink, ShieldAlert, CheckCircle2, VideoOff } from "lucide-react";
import { useProfile } from "@/shared/hooks/useProfile";
import { adminSystemService } from "@/features/admin/services/admin.system.service";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/shared/api/instance.api";

export default function MeetingRoomPage() {
  const { profile } = useProfile();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hasOpened, setHasOpened] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // Отримуємо поточну нараду (щоб взяти її URL)
  const { data: currentMeeting, isLoading } = useQuery({
    queryKey: ["currentMeeting"],
    queryFn: async () => {
      const res = await api.get("/systems/meeting/current");
      return res.data;
    },
  });

  const meetingUrl = currentMeeting?.url;

  // Автоматичне відкриття в новій вкладці
  useEffect(() => {
    if (meetingUrl && profile && !hasOpened) {
      window.open(meetingUrl, "_blank");
      setHasOpened(true);
    }
  }, [meetingUrl, profile, hasOpened]);

  // Функція для завершення наради організатором
  const handleStopMeeting = async () => {
    try {
      setIsEnding(true);
      await adminSystemService.stopMeeting();
      queryClient.setQueryData(['currentMeeting'], null);
      toast.success("Нараду успішно завершено для всіх");
      router.push("/log"); // Повертаємо організатора в CRM
    } catch (error) {
      toast.error("Не вдалося завершити нараду");
      setIsEnding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-center p-8 text-zinc-500">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
      </div>
    );
  }

  if (!meetingUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-zinc-500">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Нарада не знайдена</h2>
        <p>Не вдалося отримати посилання на зустріч.</p>
      </div>
    );
  }

  const isAdmin = profile?.role?.is_admin;

  return (
    <div className="relative w-full h-[calc(100vh-80px)] rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center p-6">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-lg w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10 text-center shadow-2xl">
        
        {!hasOpened ? (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-blue-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">З'єднання...</h2>
            <p className="text-slate-300">Перенаправляємо на відео-зустріч</p>
          </>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Нарада відкрита!
            </h2>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Відео-нарада була відкрита у новій вкладці вашого браузера.
            </p>

            <div className="pt-6 border-t border-white/10 space-y-4">
              <button 
                onClick={() => window.open(meetingUrl, "_blank")}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Відкрити вкладку ще раз
              </button>

              {isAdmin && (
                <button 
                  onClick={handleStopMeeting}
                  disabled={isEnding}
                  className="w-full bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isEnding ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <VideoOff className="w-5 h-5" />
                  )}
                  Завершити нараду для всіх
                </button>
              )}
            </div>
            
            {isAdmin && (
              <div className="flex items-start gap-2 text-left bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg mt-4">
                <ShieldAlert className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-500/90">
                  Ви є організатором. Не забудьте завершити нараду тут, коли всі закінчать розмову, щоб прибрати кнопку у менеджерів.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
