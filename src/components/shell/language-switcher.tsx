"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOCALES } from "@/lib/i18n/config";
import { setLocale } from "@/lib/i18n/actions";

/** Toggles between the supported UI languages; the choice is stored in a cookie. */
export function LanguageSwitcher() {
  const t = useTranslations("shell");
  const locale = useLocale();
  const router = useRouter();
  const [pending, start] = useTransition();
  const next = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length];

  return (
    <Button
      variant="ghost"
      disabled={pending}
      aria-label={t("switchTo", { language: t(`languages.${next}`) })}
      title={t("switchTo", { language: t(`languages.${next}`) })}
      onClick={() =>
        start(async () => {
          await setLocale(next);
          router.refresh();
        })
      }
    >
      <Languages /> <span className="uppercase">{locale}</span>
    </Button>
  );
}
