import z from "zod";

export const ProfileSchema = z.object({
  email: z.string().email({
    message: "Некоректна пошта",
  }),

  name: z.string().min(1, {
    message: "Введіть ім'я",
  }),

  isTwoFactorEnabled: z.boolean(),
});

export type TypeProfileSchema = z.infer<typeof ProfileSchema>;

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, {
    message: "Введіть старий пароль",
  }),
  newPassword: z.string().min(6, {
    message: "Новий пароль має бути не менше 6 символів",
  }),
  confirmPassword: z.string().min(1, {
    message: "Підтвердіть новий пароль",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Паролі не співпадають",
  path: ["confirmPassword"],
});

export type TypeChangePasswordSchema = z.infer<typeof ChangePasswordSchema>;
