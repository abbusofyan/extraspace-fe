// src/hooks/usePermission.ts
import { useAuth } from "@/hooks/use-auth";

export function usePermission() {
  const { user } = useAuth();

  function getAccessLevel(moduleName: string): "full" | "read" | "none" {
    const permissions = user?.permissions || [];
    const perm = permissions.find(p => p.module === moduleName);
    return perm ? (perm.access_level as "full" | "read") : "none";
  }

  return { getAccessLevel };
}
