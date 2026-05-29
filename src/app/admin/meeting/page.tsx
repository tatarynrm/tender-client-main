'use client'
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/instance.api";
import { Loader2, Video, StopCircle, PlayCircle, Users, Link as LinkIcon, Target } from "lucide-react";
import { adminSystemService } from "@/features/admin/services/admin.system.service";
import { useIctUsers } from "@/features/admin/hooks/useAdminUsers";
import { toast } from "sonner";

export default function AdminMeetingPage() {
  const queryClient = useQueryClient();
  const [meetingUrl, setMeetingUrl] = useState("");
  const [audienceType, setAudienceType] = useState<'all' | 'heads' | 'selective'>('all');
  const [targetIds, setTargetIds] = useState<number[]>([]);

  const { data: ictUsersData } = useIctUsers();
  const ictUsers = ictUsersData?.content || [];

  // Зберігаємо/відновлюємо посилання з локального сховища для зручності адміна
  useEffect(() => {
    const savedUrl = localStorage.getItem("savedAdminMeetingUrl");
    if (savedUrl) setMeetingUrl(savedUrl);
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeetingUrl(e.target.value);
    localStorage.setItem("savedAdminMeetingUrl", e.target.value);
  };

  const startMeeting = useMutation({
    mutationFn: (data: { url: string; audienceType: 'all' | 'heads' | 'selective'; targetIds: number[] }) => 
      api.post("/admin/system/meeting/start", data).then(res => res.data),
    onSuccess: (data) => {
      toast.success("Нараду успішно розпочато!");
      queryClient.setQueryData(["currentMeeting"], data);
    },
    onError: () => toast.error("Помилка запуску наради"),
  });

  const stopMeeting = useMutation({
    mutationFn: () => adminSystemService.stopMeeting(),
    onSuccess: () => {
      toast.success("Нараду успішно завершено!");
      queryClient.setQueryData(["currentMeeting"], null);
    },
    onError: () => toast.error("Помилка зупинки наради"),
  });

  const { data: currentMeeting, isLoading } = useQuery({
    queryKey: ["currentMeeting"],
    queryFn: async () => {
      const res = await api.get("/systems/meeting/current");
      return res.data;
    },
    refetchInterval: 5000,
  });

  const isActive = currentMeeting && currentMeeting.active !== false && currentMeeting.id;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-slate-800 dark:text-white">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <Video className="w-6 h-6" />
            </div>
            Керування Відео-нарадою
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Запускайте внутрішні відео-наради для співробітників компанії.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Керування */}
        <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
            <Users className="w-5 h-5 text-indigo-500" />
            Статус наради
          </h2>

          {isActive ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-500/10 rounded-2xl border border-green-200 dark:border-green-500/20">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full relative z-10"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-400">В ефірі</h3>
                  <p className="text-sm text-green-600 dark:text-green-500/80">Нарада зараз активна для всіх менеджерів</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                <button
                  onClick={() => stopMeeting.mutate()}
                  disabled={stopMeeting.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white p-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]"
                >
                  {stopMeeting.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <StopCircle className="w-5 h-5" />
                  )}
                  Завершити нараду для всіх
                </button>

                <a
                  href={currentMeeting.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 p-4 rounded-xl font-bold transition-all"
                >
                  <Video className="w-5 h-5" />
                  Приєднатися до наради
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                <div className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Не активна</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Зараз відео-нарад немає</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Постійне посилання на зустріч (Meet, Zoom, тощо)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      value={meetingUrl}
                      onChange={handleUrlChange}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Оберіть отримувачів
                  </label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="audience" 
                        value="all" 
                        checked={audienceType === 'all'} 
                        onChange={(e) => setAudienceType(e.target.value as any)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Усі співробітники</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="audience" 
                        value="heads" 
                        checked={audienceType === 'heads'} 
                        onChange={(e) => setAudienceType(e.target.value as any)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Лише начальники відділів</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="audience" 
                        value="selective" 
                        checked={audienceType === 'selective'} 
                        onChange={(e) => setAudienceType(e.target.value as any)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Вибірково (співробітники ICT)</span>
                    </label>
                  </div>
                  
                  {audienceType === 'selective' && (
                    <div className="mt-4 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800/50">
                      {ictUsers.length === 0 ? (
                         <p className="text-sm text-slate-500 text-center py-2">Немає ICT користувачів</p>
                      ) : (
                        ictUsers.map((user: any) => {
                          const fullName = `${user.person?.surname || ""} ${user.person?.name || ""}`.trim();
                          const isChecked = targetIds.includes(user.id);
                          return (
                            <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                              <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTargetIds([...targetIds, user.id]);
                                  } else {
                                    setTargetIds(targetIds.filter(id => id !== user.id));
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{fullName}</span>
                                {user.person?.person_role?.is_head_department && (
                                  <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-1.5 py-0.5 rounded w-fit uppercase font-bold">Начальник</span>
                                )}
                              </div>
                            </label>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    let finalTargetIds = targetIds;
                    if (audienceType === 'heads') {
                      finalTargetIds = ictUsers
                        .filter((u: any) => u.person?.person_role?.is_head_department)
                        .map((u: any) => u.id);
                    } else if (audienceType === 'all') {
                      finalTargetIds = ictUsers.map((u: any) => u.id);
                    }
                    startMeeting.mutate({ url: meetingUrl, audienceType, targetIds: finalTargetIds });
                  }}
                  disabled={startMeeting.isPending || !meetingUrl.trim() || (audienceType === 'selective' && targetIds.length === 0)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(37,99,235,0.4)]"
                >
                  {startMeeting.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <PlayCircle className="w-5 h-5" />
                  )}
                  Почати нову відео-нараду
                </button>
                <p className="text-xs text-center text-slate-400 mt-4">
                  При натисканні всі менеджери онлайн отримають миттєве сповіщення і зможуть долучитись.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Інформація */}
        <div className="bg-slate-50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-300">
            Як це працює?
          </h3>
          <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold text-xs mt-0.5">1</span>
              <span>Адміністратор вставляє <strong>своє постійне посилання</strong> на нараду (Meet, Zoom).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold text-xs mt-0.5">2</span>
              <span>Натискає кнопку <strong>Почати нову відео-нараду</strong>.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold text-xs mt-0.5">3</span>
              <span>Всі співробітники, які онлайн, миттєво отримують сповіщення. Кнопка у їх шапці перекидає їх за вказаним посиланням.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold text-xs mt-0.5">4</span>
              <span>Після зустрічі адміністратор натискає <strong>Завершити нараду для всіх</strong> і кнопка у співробітників зникає.</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
