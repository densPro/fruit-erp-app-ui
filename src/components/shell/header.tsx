"use client";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LogOut, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMe } from "@/lib/auth/use-me";
import { request } from "@/lib/api";
import { useTheme } from "./use-theme";
import { LanguageSwitcher } from "./language-switcher";

export function Header({ onMenu }: { onMenu: () => void }) {
  const { data: me } = useMe();
  const router = useRouter();
  const qc = useQueryClient();
  const { dark, toggle } = useTheme();
  const t = useTranslations("shell");

  async function logout() {
    await request("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    qc.clear();
    router.replace("/login");
  }

  return (
    <header className="flex h-14 items-center gap-2 border-b bg-card px-3">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label={t("openMenu")}>
        <Menu />
      </Button>
      <div className="flex-1" />
      {me && (
        <div className="hidden items-center gap-2 text-sm sm:flex">
          <span className="font-medium">{me.full_name || me.email}</span>
          {me.roles.map((r) => (
            <Badge key={r} tone="success">{r}</Badge>
          ))}
        </div>
      )}
      <LanguageSwitcher />
      <Button variant="ghost" size="icon" onClick={toggle} aria-label={t("toggleTheme")}>
        {dark ? <Sun /> : <Moon />}
      </Button>
      <Button variant="outline" onClick={logout}>
        <LogOut /> <span className="hidden sm:inline">{t("signOut")}</span>
      </Button>
    </header>
  );
}
