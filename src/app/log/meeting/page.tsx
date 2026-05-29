"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useProfile } from "@/shared/hooks/useProfile";

export default function MeetingRoomPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("id");
  const { profile, isProfileLoading } = useProfile();
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  // Якщо ID кімнати немає, показуємо помилку
  if (!roomId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-zinc-500">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Нарада не знайдена</h2>
        <p>Не передано ID кімнати.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-80px)] rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-200 dark:border-white/10">
      
      {/* Лоадер, поки завантажується профіль або Iframe */}
      {!isIframeLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 text-white">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
          <h3 className="text-lg font-bold tracking-wider">Підключення до наради...</h3>
          <p className="text-sm text-slate-400 mt-2">Організовуємо захищений канал зв'язку</p>
        </div>
      )}

      {/* Jitsi Iframe */}
      {profile && (
        <iframe
          src={`https://meet.jit.si/ICTenderMeeting_${roomId}#userInfo.displayName="${encodeURIComponent(
            (profile.person?.name && profile.person?.surname) ? `${profile.person.name} ${profile.person.surname}` : "Користувач"
          )}"`}
          allow="camera; microphone; fullscreen; display-capture"
          className="w-full h-full border-none"
          onLoad={() => setIsIframeLoaded(true)}
        />
      )}
    </div>
  );
}
