"use client";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { applyFieldErrors, errorMessage, toastError } from "@/lib/errors";
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
      <PageHeader title="Put-away" description="Move stock between bins so the system always shows where it really is." />
      <Card className="max-w-xl">
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
            <Field label="Item" error={formState.errors.item_id?.message}>
              <Select {...register("item_id")}>
                <option value="">Choose item…</option>
                {items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
              </Select>
            </Field>
            <Field label="From bin" error={formState.errors.from_location_id?.message} hint={have !== null ? `${have} available in this bin` : undefined}>
              <Select {...register("from_location_id")}>
                <option value="">Choose source…</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.code}</option>)}
              </Select>
            </Field>
            <Field label="To bin" error={formState.errors.to_location_id?.message}>
              <Select {...register("to_location_id")}>
                <option value="">Choose destination…</option>
                {locations.filter((l) => l.is_active).map((l) => <option key={l.id} value={l.id}>{l.code}</option>)}
              </Select>
            </Field>
            <Field label="Quantity" error={formState.errors.quantity?.message}>
              <Input type="number" min={1} inputMode="numeric" {...register("quantity")} />
            </Field>
            <Field label="Reason (optional)"><Input {...register("reason")} /></Field>
            <Button type="submit" size="lg" disabled={create.isPending}><ArrowRightLeft /> {create.isPending ? "Moving…" : "Move stock"}</Button>
          </form>
        </CardContent>
      </Card>
    </RequirePermission>
  );
}
