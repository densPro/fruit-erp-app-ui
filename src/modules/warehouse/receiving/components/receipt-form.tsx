"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { applyFieldErrors, toastError } from "@/lib/errors";
import { useItemLookup } from "../../shared/lookups";
import { useCreateReceipt, usePurchaseOrder, usePurchaseOrders } from "../hooks/use-receiving";
import { receiptSchema, type ReceiptPayload, type ReceiptValues } from "../schemas";

export function ReceiptForm() {
  const { can } = usePermissions();
  const router = useRouter();
  const poParam = useSearchParams().get("po") ?? "";
  const { items } = useItemLookup();
  const pos = usePurchaseOrders({ offset: 0 });
  const create = useCreateReceipt();
  const { register, control, handleSubmit, setError, reset, formState } = useForm<ReceiptValues, unknown, ReceiptPayload>({
    resolver: zodResolver(receiptSchema),
    defaultValues: { purchase_order_id: poParam, notes: "", lines: [{ item_id: "", received_qty: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const poId = useWatch({ control, name: "purchase_order_id" });
  const po = usePurchaseOrder(poId || undefined);

  // Pre-fill lines with what is still expected on the selected order.
  useEffect(() => {
    if (po.data) {
      const open = po.data.lines.filter((l) => l.ordered_qty > l.received_qty).map((l) => ({ item_id: l.item_id, received_qty: l.ordered_qty - l.received_qty }));
      reset({ purchase_order_id: po.data.id, notes: "", lines: open.length ? open : [{ item_id: "", received_qty: 1 }] });
    }
  }, [po.data, reset]);

  async function onSubmit(v: ReceiptPayload) {
    try {
      const r = await create.mutateAsync({ purchase_order_id: v.purchase_order_id || null, notes: v.notes, lines: v.lines });
      router.replace(`/warehouse/receipts/${r.id}`);
    } catch (e) {
      if (!applyFieldErrors(e, setError)) toastError(e);
    }
  }

  return (
    <RequirePermission allowed={can("stock:transfer")}>
      <PageHeader title="Receive goods" description="Book what you actually counted. It lands in the receiving dock and mismatches are flagged, never blocked." />
      <Card className="max-w-3xl">
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
            <Field label="Purchase order" hint="Leave empty if the delivery has no order on record.">
              <Select {...register("purchase_order_id")}>
                <option value="">No purchase order</option>
                {pos.data?.items.filter((p) => p.status !== "received" || p.id === poParam).map((p) => <option key={p.id} value={p.id}>{p.po_number} {p.supplier && `· ${p.supplier}`}</option>)}
              </Select>
            </Field>
            <div className="grid gap-2">
              <span className="text-sm font-medium">Counted lines</span>
              {fields.map((f, i) => (
                <div key={f.id} className="grid grid-cols-[1fr_7rem_auto] items-start gap-2">
                  <Field label="Item" error={formState.errors.lines?.[i]?.item_id?.message}>
                    <Select {...register(`lines.${i}.item_id`)}>
                      <option value="">Choose item…</option>
                      {items.map((it) => <option key={it.id} value={it.id}>{it.name} ({it.sku})</option>)}
                    </Select>
                  </Field>
                  <Field label="Counted" error={formState.errors.lines?.[i]?.received_qty?.message}>
                    <Input type="number" min={1} inputMode="numeric" {...register(`lines.${i}.received_qty`)} />
                  </Field>
                  <Button type="button" variant="ghost" size="icon" className="mt-6" onClick={() => remove(i)} disabled={fields.length === 1} aria-label="Remove line"><Trash2 /></Button>
                </div>
              ))}
              {formState.errors.lines?.message && <p className="text-xs text-danger">{formState.errors.lines.message}</p>}
              <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => append({ item_id: "", received_qty: 1 })}><Plus /> Add line</Button>
            </div>
            <Field label="Notes"><Textarea rows={2} {...register("notes")} /></Field>
            <Button type="submit" size="lg" disabled={create.isPending}>{create.isPending ? "Booking…" : "Book receipt"}</Button>
          </form>
        </CardContent>
      </Card>
    </RequirePermission>
  );
}
