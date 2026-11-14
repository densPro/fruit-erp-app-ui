"use client";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { applyFieldErrors, useErrors } from "@/lib/errors";
import { ApiError } from "@/lib/api";
import { useItemLookup, useLocationLookup } from "../../shared/lookups";
import { useStockLevels } from "../../inventory";
import { useCreatePutaway } from "../hooks/use-putaway";
import { putawaySchema, type PutawayPayload, type PutawayValues } from "../schemas";

export function PutawayView() {
  const { can } = usePermissions();
  const { items } = useItemLookup();
  const { locations } = useLocationLookup();
  const create = useCreatePutaway();
  const t = useTranslations("warehouse.putaway");
  const tc = useTranslations("common");
  const { errorMessage, toastError } = useErrors();
  const { register, control, handleSubmit, setError, reset, formState } = useForm<PutawayValues, unknown, PutawayPayload>({
    resolver: zodResolver(putawaySchema),
    defaultValues: { item_id: "", from_location_id: "", to_location_id: "", quantity: 1, reason: "" },
  });
  const itemId = useWatch({ control, name: "item_id" });
  const fromId = useWatch({ control, name: "from_location_id" });
  const available = useStockLevels({ item_id: itemId || undefined, location_id: fromId || undefined, offset: 0 });
  const have = itemId && fromId ? (available.data?.items[0]?.quantity ?? 0) : null;

  async function onSubmit(v: PutawayPayload) {
    try {
      await create.mutateAsync(v);
      reset({ item_id: v.item_id, from_location_id: "", to_location_id: v.to_location_id, quantity: 1, reason: "" });
    } catch (e) {
      if (e instanceof ApiError && e.code === "insufficient_stock") setError("quantity", { message: errorMessage(e) });
      else if (!applyFieldErrors(e, setError)) toastError(e);
    }
  }

  return (
    <RequirePermission allowed={can("stock:transfer")}>
      <PageHeader title={t("title")} description={t("description")} />
      <Card className="max-w-xl">
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
            <Field label={tc("item")} error={formState.errors.item_id?.message}>
              <Select {...register("item_id")}>
                <option value="">{tc("chooseItem")}</option>
                {items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
              </Select>
            </Field>
            <Field label={t("fromBin")} error={formState.errors.from_location_id?.message} hint={have !== null ? t("available", { count: have }) : undefined}>
              <Select {...register("from_location_id")}>
                <option value="">{t("chooseSource")}</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.code}</option>)}
              </Select>
            </Field>
            <Field label={t("toBin")} error={formState.errors.to_location_id?.message}>
              <Select {...register("to_location_id")}>
                <option value="">{t("chooseDestination")}</option>
                {locations.filter((l) => l.is_active).map((l) => <option key={l.id} value={l.id}>{l.code}</option>)}
              </Select>
            </Field>
            <Field label={tc("quantity")} error={formState.errors.quantity?.message}>
              <Input type="number" min={1} inputMode="numeric" {...register("quantity")} />
            </Field>
            <Field label={t("reasonOptional")}><Input {...register("reason")} /></Field>
            <Button type="submit" size="lg" disabled={create.isPending}><ArrowRightLeft /> {create.isPending ? t("submitting") : t("submit")}</Button>
          </form>
        </CardContent>
      </Card>
    </RequirePermission>
  );
}
