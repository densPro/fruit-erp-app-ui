"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Apple } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { ApiError, request } from "@/lib/api";
import { useErrors } from "@/lib/errors";

const schema = z.object({ email: z.string().min(1, "validation.emailRequired"), password: z.string().min(1, "validation.passwordRequired") });
type Values = z.infer<typeof schema>;

function Form() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tm = useTranslations("meta");
  const { errorMessage } = useErrors();
  const next = useSearchParams().get("next");
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setError(null);
    try {
      await request("/api/auth/login", { method: "POST", body: JSON.stringify(values) });
      router.replace(next && next.startsWith("/") ? next : "/");
      router.refresh();
    } catch (e) {
      // A 401 here means wrong credentials, not an expired session.
      setError(e instanceof ApiError && e.status === 401 ? t("invalidCredentials") : errorMessage(e));
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="grid gap-4 p-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Apple className="size-5 text-primary" /> {tm("appName")}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <Field label={t("email")} error={formState.errors.email?.message}>
            <Input type="email" autoComplete="username" autoFocus {...register("email")} aria-invalid={!!formState.errors.email} />
          </Field>
          <Field label={t("password")} error={formState.errors.password?.message}>
            <Input type="password" autoComplete="current-password" {...register("password")} aria-invalid={!!formState.errors.password} />
          </Field>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <Button type="submit" variant="cta" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? t("signingIn") : t("signIn")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function LoginForm() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  );
}
