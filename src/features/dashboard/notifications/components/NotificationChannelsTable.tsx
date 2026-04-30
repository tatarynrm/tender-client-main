import React, { useEffect } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { useSockets } from "@/shared/providers/SocketProvider";
import { Bell, CheckSquare, Square } from "lucide-react";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { TelegramConnectButton } from "./TelegramConnectButton";
import { TelegramDisconnectButton } from "./TelegramDisconectButton";
import { cn } from "@/shared/utils";

interface NotificationChannelProps {
  control: any;
  nameRef: string;
  items: any[];
  toggleAll: (field: "to_telegram" | "to_email" | "to_web", value: boolean) => void;
  title?: string;
}

export function NotificationChannelsTable({
  control,
  nameRef,
  items,
  toggleAll,
  title = "Канали сповіщень",
}: NotificationChannelProps) {
  const { profile, setProfile } = useAuth();
  const isTelegramLinked = !!profile?.person_telegram?.telegram_id;
  const { user: userSocket } = useSockets();

  useEffect(() => {
    if (!userSocket) return;

    const handleTelegramConnected = (data: { telegram_id: number }) => {
      toast.success("Telegram успішно підключено!");
      if (profile) {
        setProfile({
          ...profile,
          person_telegram: {
            telegram_id: data.telegram_id,
            username: null,
            first_name: null,
          },
        });
      }
    };

    userSocket.on("telegram_connected", handleTelegramConnected);
    return () => {
      userSocket.off("telegram_connected", handleTelegramConnected);
    };
  }, [userSocket, profile, setProfile]);

  return (
    <section className="p-6 border border-zinc-200/60 dark:border-white/10 rounded-[2rem] bg-white dark:bg-zinc-950/40 shadow-sm space-y-6 overflow-visible">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-zinc-900 dark:text-white" />
          <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white leading-none">
            {title}
          </h2>
        </div>

        <div>
          {!isTelegramLinked ? (
            <div className="[&>button]:bg-[#2fbcd6] [&>button]:hover:bg-[#269cb3] [&>button]:text-white [&>button]:px-5 [&>button]:py-2.5 [&>button]:rounded-xl [&>button]:text-[11px] [&>button]:font-black [&>button]:uppercase [&>button]:tracking-widest [&>button]:transition-all [&>button]:shadow-sm">
              <TelegramConnectButton email={profile?.email} token={null} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-green-500 tracking-widest">
                Telegram OK
              </span>
              <div className="[&>button]:text-[10px] [&>button]:px-3 [&>button]:py-1.5 [&>button]:rounded-lg [&>button]:bg-zinc-100 dark:[&>button]:bg-zinc-800 [&>button]:text-zinc-500 [&>button]:hover:text-red-500 [&>button]:transition-all">
                <TelegramDisconnectButton telegram_id={profile?.person_telegram?.telegram_id as number} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full scrollbar-thin">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-[10px] font-black uppercase text-zinc-500 h-14">
                <th className="p-4 text-left bg-zinc-50/50 dark:bg-zinc-800/30 border-b dark:border-white/5 sticky left-0 z-10">
                  Подія
                </th>
                {[
                  {
                    id: "to_telegram",
                    label: "Telegram",
                    bg: isTelegramLinked ? "bg-[#b8ccf3]" : "bg-zinc-100",
                    textColor: "text-zinc-600",
                    disabled: !isTelegramLinked
                  },
                  { 
                    id: "to_email", 
                    label: "Email", 
                    bg: "bg-[#7c9ff6]", 
                    textColor: "text-white", 
                    disabled: false 
                  },
                  { 
                    id: "to_web", 
                    label: "WEB", 
                    bg: "bg-[#2b4fa4]", 
                    textColor: "text-white", 
                    disabled: false 
                  },
                ].map((col) => (
                  <th
                    key={col.id}
                    className={`${col.bg} ${col.textColor} p-2 text-center border-l border-white/10`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="tracking-widest">{col.label}</span>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          disabled={col.disabled}
                          onClick={() => toggleAll(col.id as any, true)}
                          className="flex items-center gap-1.5 group cursor-pointer"
                        >
                          <div className="w-3 h-3 rounded-full border border-white/50 flex items-center justify-center group-hover:bg-white/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-0 group-active:opacity-100" />
                          </div>
                          <span className="text-[8px] opacity-80">Всі</span>
                        </button>
                        <button
                          type="button"
                          disabled={col.disabled}
                          onClick={() => toggleAll(col.id as any, false)}
                          className="flex items-center gap-1.5 group cursor-pointer"
                        >
                          <div className="w-3 h-3 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50 opacity-0 group-active:opacity-100" />
                          </div>
                          <span className="text-[8px] opacity-70">Жодного</span>
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-white/5">
              {items.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50/50 dark:hover:bg-blue-900/5 transition-colors h-14"
                >
                  <td className="p-4 px-6 text-[13px] font-medium text-zinc-700 dark:text-zinc-300 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-r dark:border-white/5 sticky left-0 z-10">
                    {item.value}
                  </td>
                  {(["to_telegram", "to_email", "to_web"] as const).map(
                    (field) => {
                      const isDisabled = (field === "to_telegram" && !isTelegramLinked);
                      return (
                        <td
                          key={field}
                          className="p-4 text-center border-l border-zinc-50 dark:border-white/5"
                        >
                          <div className="flex justify-center">
                            <Controller
                              name={`${nameRef}.${index}.${field}` as const}
                              control={control}
                              render={({ field: cb }) => (
                                <div 
                                  className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all",
                                    isDisabled ? "opacity-20 cursor-not-allowed border-zinc-200" :
                                    cb.value ? "bg-indigo-600 border-indigo-600" : "border-zinc-200 dark:border-zinc-700 hover:border-indigo-400"
                                  )}
                                  onClick={() => !isDisabled && cb.onChange(!cb.value)}
                                >
                                  {cb.value && !isDisabled && (
                                    <div className="text-white text-[10px] font-black">✓</div>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                        </td>
                      );
                    }
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
