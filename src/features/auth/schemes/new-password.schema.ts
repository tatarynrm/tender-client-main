import z from "zod";

export const NewPasswordSchema = z
  .object({
    password: z
      .string({ message: "Пароль - обов'язкове поле" })
      .min(1, { message: "Ви не ввели пароль" })
      .min(6, { message: "Пароль має бути не менше 6 символів" })
      .max(32, { message: "Пароль не може перевищувати 32 символи" })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: "Пароль має містити хоча б один спецсимвол (!@#$%^&* тощо)",
      }),
  });

export type TypeNewPasswordSchema = z.infer<typeof NewPasswordSchema>;
