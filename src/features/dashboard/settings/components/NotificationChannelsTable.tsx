import React, { useEffect } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { useSockets } from "@/shared/providers/SocketProvider";
import { Bell, CheckSquare, Square } from "lucide-react";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { TelegramConnectButton } from "./TelegramConnectButton";
import { TelegramDisconnectButton } from "./TelegramDisconectButton";

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
    <section className="p-6 border border-zinc-200 dark:border-white/10 rounded-[2rem] bg-white/50 dark:bg-zinc-950/40 backdrop-blur-3xl shadow-sm space-y-6 overflow-visible">
      <div className="flex items-start justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 dark:bg-white rounded-xl shadow-lg">
            <Bell className="w-5 h-5 text-white dark:text-zinc-900" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase text-zinc-800 dark:text-white leading-none">
              {title}
            </h2>
            <div className="mt-2.5">
              {!isTelegramLinked ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <p className="text-[11px] text-red-500/90 dark:text-red-400 font-black tracking-wide leading-tight max-w-xs">
                    ⚠️ Telegram не підключено. <br className="hidden sm:block" />Підключіть бота для отримання сповіщень:
                  </p>
                  <div className="[&>button]:text-[11px] [&>button]:px-4 [&>button]:py-1.5 [&>button]:rounded-md hover:[&>button]:scale-105 active:[&>button]:scale-95 [&>button]:transition-all">
                    <TelegramConnectButton email={profile?.email} token={null} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <p className="text-[11px] text-green-600 dark:text-green-400 font-black tracking-wide leading-tight">
                    ✅ Telegram успішно підключено.
                  </p>
                  <div className="[&>button]:text-[10px] [&>button]:px-3 [&>button]:py-1 [&>button]:rounded-md [&>button]:bg-zinc-100 dark:[&>button]:bg-zinc-800 [&>button]:text-zinc-600 dark:[&>button]:text-zinc-400 hover:[&>button]:bg-red-50 hover:[&>button]:text-red-500 transition-all [&>button]:shadow-none [&>button]:border [&>button]:border-zinc-200 dark:[&>button]:border-white/5">
                    <TelegramDisconnectButton telegram_id={profile?.person_telegram?.telegram_id as number} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl overflow-visible max-w-4xl mx-auto">
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
                    bg: isTelegramLinked ? "bg-[#007cc3]" : "bg-zinc-400",
                    disabled: !isTelegramLinked
                  },
                  { id: "to_email", label: "Email", bg: "bg-[#0070b4]", disabled: false },
                  { id: "to_web", label: "WEB", bg: "bg-[#005a96]", disabled: false },
                ].map((col) => (
                  <th
                    key={col.id}
                    className={`${col.bg} p-2 text-center border-l border-white/10 relative transition-colors`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span>{col.label} {col.disabled && "🔒"}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={col.disabled}
                          onClick={() => toggleAll(col.id as any, true)}
                          className="p-1 px-2 rounded-md bg-white/20 hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                        >
                          <CheckSquare className="w-3 h-3" />{" "}
                          <span className="text-[7px]">ВСІ</span>
                        </button>
                        <button
                          type="button"
                          disabled={col.disabled}
                          onClick={() => toggleAll(col.id as any, false)}
                          className="p-1 px-2 rounded-md bg-white/10 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
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
              {items.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all h-14 group"
                >
                  <td className="p-4 px-6 text-[12px] font-bold text-zinc-600 dark:text-zinc-400 sticky left-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-r dark:border-white/5">
                    {item.value}
                  </td>
                  {(["to_telegram", "to_email", "to_web"] as const).map(
                    (field) => {
                      const isDisabled = field === "to_telegram" && !isTelegramLinked;
                      return (
                        <td
                          key={field}
                          className="p-4 text-center border-l border-zinc-100 dark:border-white/5"
                        >
                          <div className="flex justify-center">
                            <Controller
                              name={`${nameRef}.${index}.${field}` as const}
                              control={control}
                              render={({ field: cb }) => (
                                <input
                                  type="checkbox"
                                  disabled={isDisabled}
                                  checked={isDisabled ? false : !!cb.value}
                                  onChange={(e) => {
                                    if (isDisabled) return;
                                    cb.onChange(Boolean(e.target.checked));
                                  }}
                                  className={
                                    "w-6 h-6 border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer rounded-lg checked:bg-blue-600 appearance-none flex items-center justify-center after:content-['✓'] after:text-white after:font-black after:text-sm after:hidden checked:after:block transition-all shadow-sm focus:ring-2 focus:ring-blue-500/20 " +
                                    (isDisabled ? "opacity-30 cursor-not-allowed" : "hover:border-blue-400")
                                  }
                                />
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
