"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";

import { ResetPasswordSchema, TypeResetPasswordSchema } from "../schemes";
import { useResetPasswordMutation } from "../hooks";
import { InputText } from "@/shared/components/Inputs/InputText";
import { Button, Form } from "@/shared/components/ui";
import AuthWrapper from "./AuthWrapper";

const ResetPasswordForm = () => {
  const form = useForm<TypeResetPasswordSchema>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      email: "",
    },
  });

  const { resetPassword, isLoadingReset } = useResetPasswordMutation();

  const onSubmit = (values: TypeResetPasswordSchema) => {
    resetPassword({ values });
  };

  return (
    <AuthWrapper
      heading="Скидання паролю"
      description="Введіть e-mail для отримання інструкцій щодо відновлення доступу"
      backButtonLabel="Повернутися до входу"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <InputText
            name="email"
            control={form.control}
            label="Електронна адреса"
            type="email"
            icon={Mail }
            disabled={isLoadingReset}
            className="mt-2"
          />

          <Button
            type="submit"
            loading={isLoadingReset}
            disabled={isLoadingReset}
            className="w-full h-11 uppercase tracking-[0.2em] font-bold text-xs shadow-lg shadow-teal-500/10 transition-all active:scale-[0.98]"
          >
            Надіслати інструкції
          </Button>
        </form>
      </Form>
    </AuthWrapper>
  );
};

export default ResetPasswordForm;