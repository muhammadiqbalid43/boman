import { createContext } from "react";
import type { AuthContextType } from "../features/auth/types/auth";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
