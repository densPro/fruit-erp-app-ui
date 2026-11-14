"use client";
import { useState } from "react";
import Link from "next/link";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { DataTable } from "@/components/data/data-table";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { formatDate } from "@/lib/utils";
import { usePurchaseOrders } from "../hooks/use-receiving";
import { NewPurchaseOrderDialog } from "./po-form-dialog";
import type { PurchaseOrder } from "../types";

export function PurchaseOrdersView() {
  const { can } = usePermissions();
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const q = usePurchaseOrders({ status: status || undefined, offset });

  return (
    <RequirePermission allowed={can("purchase:view")}>
      <PageHeader title="Purchase orders" description="Expected deliveries from suppliers." actions={can("purchase:create") ? <NewPurchaseOrderDialog /> : undefined} />
      <Card>
        <div className="border-b p-3">
          <Select className="w-52" value={status} onChange={(e) => { setStatus(e.target.value); setOffset(0); }} aria-label="Status">
            <option value="">All statuses</option><option value="open">Open</option><option value="partially_received">Partially received</option><option value="received">Received</option>
          </Select>
        </div>
        <DataTable<PurchaseOrder>
          data={q.data} isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()} offset={offset} onOffsetChange={setOffset}
          emptyTitle="No purchase orders"
          columns={[
            { header: "PO number", accessorKey: "po_number", cell: (c) => <span className="font-mono text-xs">{c.getValue() as string}</span> },
            { header: "Supplier", accessorKey: "supplier" },
            { header: "Status", accessorKey: "status", cell: (c) => <StatusBadge status={c.getValue() as string} /> },
            { header: "Lines", id: "lines", cell: (c) => c.row.original.lines.length },
            { header: "Received / ordered", id: "progress", cell: (c) => {
                const l = c.row.original.lines;
                return <span className="tabular-nums">{l.reduce((s, x) => s + x.received_qty, 0)} / {l.reduce((s, x) => s + x.ordered_qty, 0)}</span>;
              } },
            { header: "Created", accessorKey: "created_at", cell: (c) => formatDate(c.getValue() as string) },
            ...(can("stock:transfer") ? [{ header: "", id: "recv", cell: (c: { row: { original: PurchaseOrder } }) =>
                c.row.original.status !== "received" ? (
                  <Button asChild size="sm" variant="outline"><Link href={`/warehouse/receipts/new?po=${c.row.original.id}`}><Truck /> Receive</Link></Button>
                ) : null }] : []),
          ]}
        />
      </Card>
    </RequirePermission>
  );
}
