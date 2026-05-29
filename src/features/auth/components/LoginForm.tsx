"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { LoginSchema, TypeLoginSchema } from "../schemes";
import { useLoginMutation } from "../hooks";
import { InputText } from "@/shared/components/Inputs/InputText";
import { Button, Form } from "@/shared/components/ui";
import AuthWrapper from "./AuthWrapper";

const LoginForm = () => {
  const [isShowTwoFactor, setIsShhowTwoFactor] = useState(false);

  const form = useForm<TypeLoginSchema>({
    resolver: zodResolver(LoginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "", code: "" },
  });

  const { login, isLoadingLogin } = useLoginMutation(setIsShhowTwoFactor);

  const onSubmit = (values: TypeLoginSchema) => {
    login({ values });
  };

  const codeValue = form.watch("code");
  const isCodeValid = codeValue?.length === 6 && /^\d+$/.test(codeValue);

  return (
    <AuthWrapper
      heading="Увійти"
      description="Введіть ваші дані для доступу до кабінету"
      backButtonLabel="Немає аккаунту? Зареєструватись"
      backButtonHref="/auth/register"
      isShowSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {isShowTwoFactor ? (
            <InputText
              name="code"
              control={form.control}
              label="Код підтвердження"
          
              disabled={isLoadingLogin}
            />
          ) : (
            <>
              <InputText
                name="email"
                control={form.control}
                label="E-mail"
                type="email"
         autoComplete="email"
                disabled={isLoadingLogin}
              />

              <InputText
                name="password"
                control={form.control}
                label="Пароль"
                type="password"
       
                disabled={isLoadingLogin}
                rightLabel={
                  <Link
                    href="/auth/reset-password"
                    className="text-[10px] uppercase font-bold text-zinc-400 hover:text-teal-600 transition-colors tracking-widest"
                  >
                    Забули пароль?
                  </Link>
                }
              />
            </>
          )}

          <Button
            type="submit"
            disabled={(isShowTwoFactor && !isCodeValid) || isLoadingLogin}
            className="w-full h-[52px] bg-[#4256D5] hover:bg-[#3143b5] text-white font-sans font-bold text-[15px] rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoadingLogin ? "Завантаження..." : isShowTwoFactor ? "Підтвердити" : "Увійти"}
          </Button>
        </form>
      </Form>
    </AuthWrapper>
  );
};

export default LoginForm;