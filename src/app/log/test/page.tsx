"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InputText } from "@/shared/components/Inputs/InputText";
import { InputDateWithTime } from "@/shared/components/Inputs/InputDateWithTime";
import { InputDateRange } from "@/shared/components/Inputs/InputDateRange"; // Імпортуємо новий компонент

// Оновлюємо схему валідації
const formSchema = z.object({
  firstName: z.string().min(2, "Ім'я занадто коротке"),
  lastName: z.string().min(2, "Прізвище занадто коротке"),
  email: z.string().email("Некоректний email"),
  password: z.string().min(8, "Мінімум 8 символів"),
  
  // Дата з часом (одиночна)
  eventDate: z.string().min(1, "Оберіть дату та час"),

  // ДОДАНО: Валідація діапазону дат
  bookingPeriod: z.object({
    from: z.string().nullable().refine((val) => val !== null, "Оберіть дату початку"),
    to: z.string().nullable().refine((val) => val !== null, "Оберіть дату завершення"),
  }, { message: "Будь ласка, вкажіть період" }),
});

type FormValues = z.infer<typeof formSchema>;

const RegistrationPage = () => {
  const { control, handleSubmit, reset,formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      eventDate: "",
      // Початкові значення для діапазону
      bookingPeriod: { from: null, to: null }, 
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Відправка форми:", data);
    // Дані прийдуть у форматі:
    // bookingPeriod: { from: "2024-05-10...", to: "2024-05-15..." }
    // reset();
  };
useEffect(()=>{
console.log(formState.errors,'ERROR');

},[])
  return (
    <div className="max-w-md mx-auto mt-10 p-6 shadow-xl rounded-xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-slate-900">
      <h1 className="text-xl font-bold mb-6 text-slate-900 dark:text-white uppercase tracking-widest text-center">
        Бронювання
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputText name="firstName" control={control} label="Ім'я" />
          <InputText name="lastName" control={control} label="Прізвище" />
        </div>

        {/* Вибір однієї дати з часом */}
        <InputDateWithTime
          name="eventDate"
          control={control}
          label="Дата заїзду"
          required
        />

        {/* ВСТАВЛЕНО: Компонент діапазону дат */}
        <InputDateRange
          name="bookingPeriod"
          control={control}
          label="Період оренди"
          required
        />

        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98] uppercase tracking-[0.2em] text-[12px] mt-6"
        >
          Забронювати
        </button>
      </form>
    </div>
  );
};

export default RegistrationPage;