"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Інформаційна cookie-плашка. Ми використовуємо лише необхідний сесійний cookie
 * (centrifuge) — аналітики/реклами немає, тож за законом достатньо поінформувати,
 * а не питати згоду по категоріях. Вибір користувача зберігаємо в localStorage,
 * щоб плашка більше не показувалась. Нічого не блокує й не сповільнює сайт.
 */
const CONSENT_KEY = "ict_cookie_consent_v1";

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(false); // для плавної появи

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) {
        setVisible(true);
        // невелика затримка, щоб спрацював transition
        requestAnimationFrame(() => setShown(true));
      }
    } catch {
      // localStorage недоступний (приватний режим тощо) — просто не показуємо
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    setShown(false);
    // ховаємо після завершення анімації
    setTimeout(() => setVisible(false), 250);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Повідомлення про файли cookie"
      className={`fixed inset-x-3 bottom-3 z-[1000] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(10,37,64,0.12)] transition-all duration-300 ease-out sm:p-5 motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <p className="text-[13px] leading-relaxed text-slate-600">
          Ми використовуємо необхідні файли <strong>cookie</strong>, щоб платформа
          працювала — зокрема для входу та збереження сесії. Продовжуючи
          користуватися сайтом, ви погоджуєтеся з їх використанням.{" "}
          <Link
            href="/privacy"
            className="font-medium text-[#4256D5] hover:underline"
          >
            Докладніше
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-xl bg-[#4256D5] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#3143b5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4256D5] focus-visible:ring-offset-2"
        >
          Прийняти
        </button>
      </div>
    </div>
  );
};
