"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { IUserProfile } from "../types/user.types";

interface AuthContextType {
  profile: IUserProfile | null; // null — якщо не залогінений
  setProfile: (profile: IUserProfile | null) => void;
}

// Створюємо контекст з початковим значенням undefined для перевірки помилок
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthCheckProvider = ({
  profile: serverProfile,
  children,
}: {
  profile: IUserProfile | null;
  children: ReactNode;
}) => {
  // Ініціалізуємо стан значенням, яке прийшло з сервера (RootLayout)
  const [profile, setProfile] = useState<IUserProfile | null>(serverProfile);

  // СИНХРОНІЗАЦІЯ: Коли ви логінитесь і викликаєте router.refresh(), 
  // RootLayout знову робить запит і присилає новий serverProfile. 
  // Цей ефект оновить клієнтський стан без перезавантаження сторінки.
  useEffect(() => {
    setProfile(serverProfile);
  }, [serverProfile]);

  return (
    <AuthContext.Provider value={{ profile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthCheckProvider");
  }
  return context;
};