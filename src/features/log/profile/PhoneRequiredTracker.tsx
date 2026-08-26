"use client";

import { useEffect, useRef } from "react";

import { IUserProfile } from "@/shared/types/user.types";
import { useModalStore } from "@/shared/stores/useModalStore";
import { PhoneRequiredModal } from "./components/PhoneRequiredModal";

// Якщо в менеджера /log немає жодного телефону — примусово відкриваємо модалку
// для внесення номера з галочками месенджерів. Модалку не можна закрити повз
// збереження (без хрестика й без кліку поза межами).
export const PhoneRequiredTracker = ({
  profile,
}: {
  profile: IUserProfile;
}) => {
  const openModal = useModalStore((s) => s.openModal);
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;

    const phones = profile?.person_phone ?? [];
    const hasPhone = phones.some((p) => p.phone && p.phone.trim().length > 0);

    if (!hasPhone) {
      shown.current = true;
      openModal(<PhoneRequiredModal />, {
        size: "md",
        showCloseButton: false,
        closeOnOutsideClick: false,
        preventCloseOnOutsideClick: true,
      });
    }
  }, [profile, openModal]);

  return null;
};
