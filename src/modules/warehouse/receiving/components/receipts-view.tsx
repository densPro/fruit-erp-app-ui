"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { DataTable } from "@/components/data/data-table";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { formatDate, shortId } from "@/lib/utils";
import { useReceipts } from "../hooks/use-receiving";
import type { GoodsReceipt } from "../types";

export function ReceiptsView() {
  const { can } = usePermissions();
  const router = useRouter();
  const [disc, setDisc] = useState("");
  const [offset, setOffset] = useState(0);
  const q = useReceipts({ has_discrepancy: disc === "" ? undefined : disc === "true", offset });

  return (
    <RequirePermission allowed={can("stock:view")}>
      <PageHeader
        title="Goods receipts" description="Deliveries booked into the receiving dock."
        actions={can("stock:transfer") ? <Button asChild><Link href="/warehouse/receipts/new"><Plus /> Receive goods</Link></Button> : undefined}
      />
      <Card>
        <div className="border-b p-3">
          <Select className="w-56" value={disc} onChange={(e) => { setDisc(e.target.value); setOffset(0); }} aria-label="Discrepancy filter">
            <option value="">All receipts</option><option value="true">With discrepancies</option><option value="false">Matched</option>
          </Select>
        </div>
        <DataTable<GoodsReceipt>
          data={q.data} isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()} offset={offset} onOffsetChange={setOffset}
          emptyTitle="No receipts yet" onRowClick={(r) => router.push(`/warehouse/receipts/${r.id}`)}
          columns={[
            { header: "Receipt", accessorKey: "id", cell: (c) => <span className="font-mono text-xs">{shortId(c.getValue() as string)}</span> },
            { header: "Purchase order", accessorKey: "purchase_order_id", cell: (c) => (c.getValue() ? <span className="font-mono text-xs">{shortId(c.getValue() as string)}</span> : <Badge tone="warning">no PO</Badge>) },
            { header: "Lines", id: "lines", cell: (c) => c.row.original.lines.length },
            { header: "Result", accessorKey: "has_discrepancy", cell: (c) => c.getValue() ? <Badge tone="warning"><AlertTriangle className="mr-1 size-3" />discrepancy</Badge> : <Badge tone="success">matched</Badge> },
            { header: "Received", accessorKey: "created_at", cell: (c) => formatDate(c.getValue() as string) },
          ]}
        />
      </Card>
    </RequirePermission>
  );
}
