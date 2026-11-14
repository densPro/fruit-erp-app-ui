"use client";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/input";
import { applyFieldErrors, useErrors } from "@/lib/errors";
import { useMessageText } from "@/lib/i18n/format";
import { useItemLookup } from "../../shared/lookups";
import { useCreatePO } from "../hooks/use-receiving";
import { purchaseOrderSchema, type PurchaseOrderPayload, type PurchaseOrderValues } from "../schemas";

export function NewPurchaseOrderDialog() {
  const [open, setOpen] = useState(false);
  const { items } = useItemLookup();
  const create = useCreatePO();
  const t = useTranslations("warehouse.receiving.purchaseOrders");
  const tc = useTranslations("common");
  const { toastError } = useErrors();
  const tv = useMessageText();
  const { register, control, handleSubmit, setError, reset, formState } = useForm<PurchaseOrderValues, unknown, PurchaseOrderPayload>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: { po_number: "", supplier: "", lines: [{ item_id: "", ordered_qty: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  async function onSubmit(v: PurchaseOrderPayload) {
    try {
      await create.mutateAsync(v);
      reset();
      setOpen(false);
    } catch (e) {
      if (!applyFieldErrors(e, setError)) toastError(e);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus /> {t("new")}</Button></DialogTrigger>
      <DialogContent title={t("new")} description={t("dialogDescription")}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <Field label={t("poNumber")} error={formState.errors.po_number?.message}><Input {...register("po_number")} autoFocus /></Field>
          <Field label={t("supplier")} error={formState.errors.supplier?.message}><Input {...register("supplier")} /></Field>
          <div className="grid gap-2">
            <span className="text-sm font-medium">{tc("lines")}</span>
            {fields.map((f, i) => (
              <div key={f.id} className="grid grid-cols-[1fr_6rem_auto] items-start gap-2">
                <Field label={tc("item")} error={formState.errors.lines?.[i]?.item_id?.message}>
                  <Select {...register(`lines.${i}.item_id`)}>
                    <option value="">{tc("chooseItem")}</option>
                    {items.map((it) => <option key={it.id} value={it.id}>{it.name} ({it.sku})</option>)}
                  </Select>
                </Field>
                <Field label={tc("qty")} error={formState.errors.lines?.[i]?.ordered_qty?.message}>
                  <Input type="number" min={1} inputMode="numeric" {...register(`lines.${i}.ordered_qty`)} />
                </Field>
                <Button type="button" variant="ghost" size="icon" className="mt-6" onClick={() => remove(i)} disabled={fields.length === 1} aria-label={tc("removeLine")}><Trash2 /></Button>
              </div>
            ))}
            {formState.errors.lines?.message && <p className="text-xs text-danger">{tv(formState.errors.lines.message)}</p>}
            <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => append({ item_id: "", ordered_qty: 1 })}><Plus /> {tc("addLine")}</Button>
          </div>
          <Button type="submit" disabled={create.isPending}>{create.isPending ? tc("saving") : t("create")}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
