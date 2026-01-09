"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { IUserProfile } from "../types/user.types";

interface AuthContextType {
  profile?: IUserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<IUserProfile | undefined>>;
}

const AuthContext = createContext<AuthContextType>({
  setProfile: () => {},
});

export const AuthCheckProvider = ({
  profile: initialProfile,
  children,
}: {
  profile?: IUserProfile;
  children: ReactNode;
}) => {
  const [profile, setProfile] = useState<IUserProfile | undefined>(
    initialProfile
  );

  return (
    <AuthContext.Provider value={{ profile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
