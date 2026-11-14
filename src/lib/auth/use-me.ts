"use client";
import { useQuery } from "@tanstack/react-query";
import { request } from "@/lib/api";

export type Me = {
  id: string;
  email: string;
  full_name: string;
  app: string;
  roles: string[];
  permissions: string[];
};

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: () => request<Me>("/api/auth/me"), staleTime: 60_000 });
}

/** True when the user holds the permission (supports `resource:*` and `*` wildcards). */
export function hasPermission(perms: string[] | undefined, needed: string): boolean {
  if (!perms) return false;
  if (perms.includes("*") || perms.includes(needed)) return true;
  const [resource] = needed.split(":");
  return perms.includes(`${resource}:*`);
}

export function usePermissions() {
  const me = useMe();
  const perms = me.data?.permissions;
  return {
    ...me,
    can: (needed: string) => hasPermission(perms, needed),
    canAny: (needed: string[]) => needed.some((n) => hasPermission(perms, n)),
  };
}
