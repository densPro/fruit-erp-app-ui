"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Apple } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { MODULES } from "@/lib/modules";
import { usePermissions } from "@/lib/auth/use-me";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { can, isLoading } = usePermissions();
  const t = useTranslations("shell");
  const tc = useTranslations("common");
  const tm = useTranslations("meta");

  return (
    <nav aria-label={t("mainNav")} className="flex h-full flex-col gap-4 bg-sidebar p-3 text-sidebar-foreground">
      <Link href="/" onClick={onNavigate} className="flex items-center gap-2 px-2 py-2 text-lg font-semibold">
        <Apple className="size-5 text-sidebar-active" /> {tm("appName")}
      </Link>
      {isLoading && <p className="px-2 text-sm opacity-70">{tc("loading")}</p>}
      {MODULES.map((m) => {
        const items = m.items.filter((i) => can(i.permission));
        if (!items.length) return null;
        return (
          <div key={m.id} className="grid gap-1">
            <p className="px-2 text-xs font-semibold uppercase tracking-wide opacity-70">{t(`modules.${m.id}`)}</p>
            {items.map((i) => {
              const active = i.href === "/warehouse" ? pathname === i.href : pathname.startsWith(i.href);
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-10 items-center gap-2 rounded-md px-2 text-sm hover:bg-white/10",
                    active && "bg-sidebar-active font-medium text-sidebar-active-foreground hover:bg-sidebar-active",
                  )}
                >
                  <i.icon className="size-4" /> {t(`nav.${i.labelKey}`)}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
