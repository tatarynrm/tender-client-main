"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InputText } from "@/shared/components/Inputs/InputText";

// 1. Визначаємо схему валідації за допомогою Zod
const formSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Ім'я має містити принаймні 2 символи")
    .max(50, "Ім'я не може бути довшим за 50 символів")
    .regex(/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ' ]+$/, "Ім'я може містити лише літери"),

  lastName: z
    .string()
    .trim()
    .min(2, "Будь ласка, вкажіть ваше прізвище")
    .max(50, "Прізвище не може бути довшим за 50 символів")
    .regex(/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ' ]+$/, "Прізвище може містити лише літери"),

  email: z
    .string()
    .trim()
    .min(1, "Електронна пошта є обов'язковою")
    .email("Введіть коректну адресу (наприклад: name@company.com)")
    .max(30, "Email занадто довгий (макс. 30 символів)"),

  password: z
    .string()
    .min(8, "Пароль має містити мінімум 8 символів")
    .regex(
      /^[\x20-\x7E]+$/,
      "Пароль може містити лише англійські символи, цифри та спецсимволи",
    )
    .regex(/[A-Z]/, "Пароль повинен містити хоча б одну велику літеру")
    .regex(/[a-z]/, "Пароль повинен містити хоча б одну малу літеру")
    .regex(/[0-9]/, "Пароль повинен містити хоча б одну цифру")
    .regex(
      /[@$!%*?&]/,
      "Пароль повинен містити хоча б один спецсимвол (@$!%*?&)",
    ),
});

// 2. Створюємо тип на основі схеми
type FormValues = z.infer<typeof formSchema>;

const RegistrationPage = () => {
  // 3. Ініціалізуємо форму
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Данні форми:", data);
    // Тут логіка відправки на бекенд
    reset(); // Очистити форму після успіху
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6  shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Реєстрація</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputText name="firstName" control={control} label="Ім'я" />
          <InputText name="lastName" control={control} label="Прізвище" />
        </div>

        <InputText name="email" control={control} label="Email" type="email" />

        <InputText
          name="password"
          control={control}
          label="Пароль"
          type="password"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-4"
        >
          Створити акаунт
        </button>
      </form>
    </div>
  );
};

export default RegistrationPage;
