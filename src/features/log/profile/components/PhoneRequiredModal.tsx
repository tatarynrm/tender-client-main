"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { isValidPhoneNumber } from "react-phone-number-input";
import { Phone } from "lucide-react";

import { PhoneInput, Button } from "@/shared/components/ui";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useModalStore } from "@/shared/stores/useModalStore";
import { profileService } from "../../services/profile.service";

interface FormValues {
  phone: string;
  is_telegram: boolean;
  is_viber: boolean;
  is_whatsapp: boolean;
}

const MESSENGERS: { key: keyof Omit<FormValues, "phone">; label: string }[] = [
  { key: "is_telegram", label: "Telegram" },
  { key: "is_viber", label: "Viber" },
  { key: "is_whatsapp", label: "WhatsApp" },
];

export const PhoneRequiredModal = () => {
  const router = useRouter();
  const closeModal = useModalStore((s) => s.closeModal);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
  } = useForm<FormValues>({
    defaultValues: {
      phone: "",
      is_telegram: false,
      is_viber: false,
      is_whatsapp: false,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: profileService.addPhone,
    onSuccess: () => {
      toast.success("Номер телефону збережено");
      closeModal();
      // Оновлюємо серверний профіль, щоб трекер більше не спрацьовував.
      router.refresh();
    },
    onError: () => {
      toast.error("Не вдалося зберегти номер. Спробуйте ще раз.");
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!values.phone || !isValidPhoneNumber(values.phone)) {
      setError("phone", { message: "Введіть коректний номер телефону" });
      return;
    }
    mutate(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
          <Phone className="w-6 h-6 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white uppercase">
            Вкажіть номер телефону
          </h2>
          <p className="mt-2 text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Щоб продовжити роботу, додайте свій контактний номер. Він потрібен
            для звʼязку в межах платформи.
          </p>
        </div>
      </div>

      <PhoneInput
        name="phone"
        control={control}
        label="Контактний номер"
        defaultCountry="UA"
        international
        disabled={isPending}
      />

      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase text-zinc-400 ml-1">
          Доступний у месенджерах
        </p>
        <div className="flex flex-col gap-3">
          {MESSENGERS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <Checkbox
                checked={watch(key)}
                onCheckedChange={(v) => setValue(key, v === true)}
                disabled={isPending}
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-200">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-[0.15em] text-[11px]"
      >
        {isPending ? "Збереження..." : "Зберегти"}
      </Button>
    </form>
  );
};
