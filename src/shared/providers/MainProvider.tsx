"use client";
import { type PropsWithChildren } from "react";
import { TanstackQueryProvider } from "./TanstackQueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ToastProvider";

import { AuthCheckProvider } from "./AuthCheckProvider";
import ClientOnlyProvider from "./ClientOnlyProvider";
import { SocketProvider } from "./SocketProvider";
import { IUserProfile } from "../types/user.types";
import { FontSizeProvider } from "./FontSizeProvider";
import { GlobalModalContainer } from "../components/Modals/GlobalModals/GlobalModalContainer";

interface MainProviderProps extends PropsWithChildren {
  profile?: IUserProfile | null; // мінімально потрібне поле
}

export function MainProvider({ children, profile }: MainProviderProps) {
  return (
    <TanstackQueryProvider>
      <ThemeProvider
        attribute={"class"}
        defaultTheme="light"
        disableTransitionOnChange
        enableSystem
        storageKey="ictender-theme"
      >
        <AuthCheckProvider profile={profile ?? null}>
          <SocketProvider>
            <FontSizeProvider>
              <ClientOnlyProvider>{children}</ClientOnlyProvider>
            </FontSizeProvider>
          </SocketProvider>
        </AuthCheckProvider>
        <ToastProvider />
      </ThemeProvider>
    </TanstackQueryProvider>
  );
}
