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
  toggleAll: (
    field: "to_telegram" | "to_email" | "to_web",
    value: boolean,
  ) => void;
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
    <section className="p-5 border border-[#D0DDF0] rounded-[24px] bg-white dark:bg-zinc-950/40 shadow-sm space-y-6 overflow-visible h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-slate-800 dark:text-zinc-200" />
          <h2 className="text-[13px] font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wide leading-none">
            {title}
          </h2>
        </div>

        <div>
          {!isTelegramLinked ? (
            <div className="[&>button]:bg-[#54A0FF] [&>button]:hover:bg-[#4889E0] [&>button]:text-white [&>button]:px-5 [&>button]:py-2.5 [&>button]:rounded-xl [&>button]:text-[12px] [&>button]:font-bold [&>button]:transition-all [&>button]:shadow-sm">
              <TelegramConnectButton email={profile?.email} token={null} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-green-500 tracking-widest">
                Telegram Підключено
              </span>
              <div className="[&>button]:text-[10px] [&>button]:px-3 [&>button]:py-1.5 [&>button]:rounded-lg [&>button]:bg-zinc-100 dark:[&>button]:bg-zinc-800 [&>button]:text-zinc-500 [&>button]:hover:text-red-500 [&>button]:transition-all">
                <TelegramDisconnectButton
                  telegram_id={profile?.person_telegram?.telegram_id as number}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[16px] border border-[#D0DDF0] dark:border-white/5 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full scrollbar-thin">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-[10px] font-black uppercase text-zinc-500 h-14">
                <th className="p-4 text-left bg-white border-b border-[#D0DDF0] dark:border-white/5 sticky left-0 z-10">
                  Подія
                </th>
                {[
                  {
                    id: "to_telegram",
                    label: "TELEGRAM",
                    bg: "bg-[#DDE5FF]",
                    textColor: "text-[#4863D4]",
                    disabled: !isTelegramLinked,
                  },
                  {
                    id: "to_email",
                    label: "EMAIL",
                    bg: "bg-[#4863D4]",
                    textColor: "text-white",
                    disabled: false,
                  },
                  {
                    id: "to_web",
                    label: "WEB",
                    bg: "bg-[#33467A]",
                    textColor: "text-white",
                    disabled: false,
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
                          <div className={cn("w-3 h-3 rounded-full border flex items-center justify-center transition-colors", col.id === "to_telegram" ? "border-[#4863D4]/50 group-hover:bg-[#4863D4]/10" : "border-white/50 group-hover:bg-white/20")}>
                            <div className={cn("w-1.5 h-1.5 rounded-full opacity-0 group-active:opacity-100", col.id === "to_telegram" ? "bg-[#4863D4]" : "bg-white")} />
                          </div>
                          <span className="text-[10px] opacity-80 capitalize">Всі</span>
                        </button>
                        <button
                          type="button"
                          disabled={col.disabled}
                          onClick={() => toggleAll(col.id as any, false)}
                          className="flex items-center gap-1.5 group cursor-pointer"
                        >
                          <div className={cn("w-3 h-3 rounded-full border flex items-center justify-center transition-colors", col.id === "to_telegram" ? "border-[#4863D4]/30 group-hover:bg-[#4863D4]/5" : "border-white/30 group-hover:bg-white/10")}>
                            <div className={cn("w-1.5 h-1.5 rounded-full opacity-0 group-active:opacity-100", col.id === "to_telegram" ? "bg-[#4863D4]/50" : "bg-white/50")} />
                          </div>
                          <span className="text-[10px] opacity-70 capitalize">
                            Жодного
                          </span>
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
                  <td className="p-2 px-6 text-[13px] font-medium text-[#4863D4] dark:text-blue-400 bg-white dark:bg-zinc-900/50 border-r border-[#D0DDF0] border-b dark:border-white/5 sticky left-0 z-10">
                    {item.value}
                  </td>
                  {(["to_telegram", "to_email", "to_web"] as const).map(
                    (field) => {
                      const isDisabled =
                        field === "to_telegram" && !isTelegramLinked;
                      return (
                        <td
                          key={field}
                          className="p-2 text-center border-l border-[#D0DDF0] border-b dark:border-white/5"
                        >
                          <div className="flex justify-center">
                            <Controller
                              name={`${nameRef}.${index}.${field}` as const}
                              control={control}
                              render={({ field: cb }) => (
                                <div
                                  className={cn(
                                    "w-[20px] h-[20px] rounded-full flex items-center justify-center cursor-pointer transition-all",
                                    isDisabled
                                      ? "opacity-20 cursor-not-allowed border-2 border-zinc-200"
                                      : cb.value
                                        ? "bg-[#4863D4]"
                                        : "border-2 border-slate-300 dark:border-zinc-700 hover:border-[#4863D4]",
                                  )}
                                  onClick={() =>
                                    !isDisabled && cb.onChange(!cb.value)
                                  }
                                >
                                  {cb.value && !isDisabled && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                        </td>
                      );
                    },
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
