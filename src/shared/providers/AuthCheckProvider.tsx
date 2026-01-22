"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { IUserProfile } from "../types/user.types";

// AuthContext.tsx
interface AuthContextType {
  profile: IUserProfile | null; // Прибираємо опціональність для стабільності
  setProfile: (profile: IUserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthCheckProvider = ({
  profile: serverProfile,
  children,
}: {
  profile: IUserProfile | null;
  children: ReactNode;
}) => {
  // Ініціалізуємо стан даними з сервера
  const [profile, setProfile] = useState<IUserProfile | null>(serverProfile);

  // Синхронізація (якщо проп міняється при навігації)
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
  if (!context) throw new Error("useAuth must be used within AuthCheckProvider");
  return context;
};