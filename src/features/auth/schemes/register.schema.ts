import z from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const RegisterSchema = z
  .object({
    // --- Користувач ---
    surname: z
      .string({ message: "Прізвище - обов'язкове поле" })
      .min(1, { message: "Будь ласка, введіть ваше прізвище" })
      .min(2, { message: "Прізвище має містити мінімум 2 символи" })
      .max(50, { message: "Прізвище не може бути довшим за 50 символів" }),

    name: z
      .string({ message: "Ім'я - обов'язкове поле" })
      .min(1, { message: "Будь ласка, введіть ваше ім'я" })
      .min(2, { message: "Ім'я має містити мінімум 2 символи" })
      .max(50, { message: "Ім'я не може бути довшим за 50 символів" }),

    last_name: z
      .string({ message: "По-батькові - обов'язкове поле" })
      .min(1, { message: "Будь ласка, введіть ваше по-батькові" })
      .min(2, { message: "По-батькові має містити мінімум 2 символи" })
      .max(50, { message: "По-батькові не може бути довшим за 50 символів" }),

    email: z
      .string({ message: "E-mail - обов'язкове поле" })
      .min(1, { message: "Пошта не може бути порожньою" })
      .email({ message: "Некоректний формат (приклад: name@domain.com)" })
      .max(100, { message: "E-mail занадто довгий" }),

    password: z
      .string({ message: "Пароль - обов'язкове поле" })
      .min(1, { message: "Ви не ввели пароль" })
      .min(6, { message: "Пароль має бути не менше 6 символів" })
      .max(32, { message: "Пароль не може перевищувати 32 символи" })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: "Пароль має містити хоча б один спецсимвол (!@#$%^&* тощо)",
      }),

    passwordRepeat: z
      .string({ message: "Підтвердження пароля - обов'язкове поле" })
      .min(1, { message: "Будь ласка, повторіть ваш пароль" }),

    phone: z
      .string({ message: "Номер телефону - обов'язкове поле" })
      .min(1, { message: "Телефон є обов'язковим для реєстрації" })
      .refine((val) => isValidPhoneNumber(val || ""), {
        message:
          "Невірний формат номера (має бути +380... або відповідний код країни)",
      }),

    // --- Компанія ---
    company_name: z
      .string({ message: "Назва компанії - обов'язкове поле" })
      .min(1, { message: "Введіть назву вашої організації" })
      .min(2, { message: "Назва компанії занадто коротка (мін. 2 символи)" })
      .max(100, {
        message: "Назва компанії не може бути довшою за 100 символів",
      }),

    company_address: z
      .string({ message: "Адреса є обов'язковим полем" })
      .min(1, { message: "Юридична адреса не може бути порожньою" })
      .min(5, {
        message: "Вкажіть повну адресу (вулиця, номер будинку, місто)",
      })
      .max(200, { message: "Адреса занадто довга" }),

    company_form: z
      .string({ message: "Форма власності - обов'язкове поле" })
      .min(1, { message: "Вкажіть форму власності (напр. ФОП, ТОВ, ПП)" })
      .max(30, { message: "Занадто довга назва форми власності" }),

    ids_country: z
      .string({ message: "Виберіть країну реєстрації компанії" })
      .min(1, { message: "Необхідно обрати країну зі списку" }),

    company_edrpou: z
      .string({ message: "Код ЄДРПОУ - обов'язкове поле" })
      .min(1, { message: "Введіть ідентифікаційний код компанії" })
      .regex(/^\d+$/, { message: "Код має складатися тільки з цифр" })
      .min(8, { message: "Код має містити мінімум 8 цифр (для юр. осіб)" })
      .max(10, { message: "Код не може бути довшим за 10 цифр (для ІПН)" }),

    // --- Перемикачі (Booleans) ---
    company_vat_payer: z.boolean().optional(),
    company_expedition: z.boolean().optional(),
    company_carrier: z.boolean().optional(),
    company_freighter: z.boolean().optional(),
  })
  .superRefine(({ passwordRepeat, password }, ctx) => {
    if (passwordRepeat !== password) {
      ctx.addIssue({
        code: "custom", // або z.ZodIssueCode.custom
        message: "Введені паролі не збігаються",
        path: ["passwordRepeat"], // прив'язуємо помилку до конкретного поля
        fatal: true, // зупиняє подальші непотрібні перевірки для цього поля
      });
    }
  })
  .refine(
    (data) => {
      // Перевірка: чи є хоча б одне true
      return (
        data.company_carrier ||
        data.company_expedition ||
        data.company_freighter
      );
    },
    {
      message: "Оберіть хоча б одну роль (Перевізник, Експедитор або Замовник)",
      path: ["roles_error"], // Створюємо віртуальний шлях для помилки
    },
  );

export type TypeRegisterSchema = z.infer<typeof RegisterSchema>;
