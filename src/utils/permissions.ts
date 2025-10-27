// utils/permissions.ts
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export function can(user: any, permission: string): boolean {
  const permissions: string[] = user?.permissions || [];
  return permissions.includes(permission);
}

export function useCan(permission: string): boolean {
  const { user } = useContext(AuthContext);
  return can(user, permission);
}
