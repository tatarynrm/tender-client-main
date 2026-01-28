"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useMemo,
} from "react";
import { IUserProfile } from "../types/user.types";

interface AuthContextType {
  profile: IUserProfile | null;
  setProfile: (profile: IUserProfile | null) => void;
  isAuthenticated: boolean; // Корисно для швидких перевірок
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthCheckProvider = ({
  profile: serverProfile,
  children,
}: {
  profile: IUserProfile | null;
  children: ReactNode;
}) => {
  const [profile, setProfile] = useState<IUserProfile | null>(serverProfile);

  // Синхронізація з сервером (наприклад, після router.refresh())
  useEffect(() => {
    setProfile(serverProfile);
  }, [serverProfile]);

  // Оптимізація об'єкта контексту
  const value = useMemo(() => ({
    profile,
    setProfile,
    isAuthenticated: !!profile
  }), [profile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthCheckProvider");
  }
  return context;
};