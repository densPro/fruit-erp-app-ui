"use client";
import { AlertTriangle, Inbox, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useErrors } from "@/lib/errors";

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <Inbox className="size-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>}
      {action}
    </div>
  );
}

export function ForbiddenState() {
  const t = useTranslations("states");
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
      <Lock className="size-8 text-muted-foreground" />
      <p className="font-medium">{t("forbiddenTitle")}</p>
      <p className="text-sm text-muted-foreground">{t("forbiddenHint")}</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const t = useTranslations("states");
  const tc = useTranslations("common");
  const { errorMessage } = useErrors();
  if (error instanceof ApiError && error.status === 403) return <ForbiddenState />;
  const id = error instanceof ApiError ? error.requestId : null;
  return (
    <div role="alert" className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <AlertTriangle className="size-8 text-danger" />
      <p className="font-medium">{errorMessage(error)}</p>
      {id && <p className="text-xs text-muted-foreground">{t("errorId", { id })}</p>}
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {tc("retry")}
        </Button>
      )}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function RequirePermission({ allowed, children }: { allowed: boolean; children: React.ReactNode }) {
  return allowed ? <>{children}</> : <ForbiddenState />;
}
