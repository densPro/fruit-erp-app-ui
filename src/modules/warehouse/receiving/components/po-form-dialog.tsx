"use client";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/input";
import { applyFieldErrors, toastError } from "@/lib/errors";
import { useItemLookup } from "../../shared/lookups";
import { useCreatePO } from "../hooks/use-receiving";
import { purchaseOrderSchema, type PurchaseOrderPayload, type PurchaseOrderValues } from "../schemas";

export function NewPurchaseOrderDialog() {
  const [open, setOpen] = useState(false);
  const { items } = useItemLookup();
  const create = useCreatePO();
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
      <DialogTrigger asChild><Button><Plus /> New purchase order</Button></DialogTrigger>
      <DialogContent title="New purchase order" description="What you expect from a supplier. Receipts are checked against it.">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <Field label="PO number" error={formState.errors.po_number?.message}><Input {...register("po_number")} autoFocus /></Field>
          <Field label="Supplier" error={formState.errors.supplier?.message}><Input {...register("supplier")} /></Field>
          <div className="grid gap-2">
            <span className="text-sm font-medium">Lines</span>
            {fields.map((f, i) => (
              <div key={f.id} className="grid grid-cols-[1fr_6rem_auto] items-start gap-2">
                <Field label="Item" error={formState.errors.lines?.[i]?.item_id?.message}>
                  <Select {...register(`lines.${i}.item_id`)}>
                    <option value="">Choose item…</option>
                    {items.map((it) => <option key={it.id} value={it.id}>{it.name} ({it.sku})</option>)}
                  </Select>
                </Field>
                <Field label="Qty" error={formState.errors.lines?.[i]?.ordered_qty?.message}>
                  <Input type="number" min={1} inputMode="numeric" {...register(`lines.${i}.ordered_qty`)} />
                </Field>
                <Button type="button" variant="ghost" size="icon" className="mt-6" onClick={() => remove(i)} disabled={fields.length === 1} aria-label="Remove line"><Trash2 /></Button>
              </div>
            ))}
            {formState.errors.lines?.message && <p className="text-xs text-danger">{formState.errors.lines.message}</p>}
            <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => append({ item_id: "", ordered_qty: 1 })}><Plus /> Add line</Button>
          </div>
          <Button type="submit" disabled={create.isPending}>{create.isPending ? "Saving…" : "Create purchase order"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
