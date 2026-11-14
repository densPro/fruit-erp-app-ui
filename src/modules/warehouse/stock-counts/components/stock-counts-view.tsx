"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Select } from "@/components/ui/input";
import { DataTable } from "@/components/data/data-table";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { toastError } from "@/lib/errors";
import { formatDate, shortId } from "@/lib/utils";
import { LocationLabel, useLocationLookup } from "../../shared/lookups";
import { useOpenCount, useStockCounts } from "../hooks/use-stock-counts";
import type { StockCount } from "../types";

function OpenCountDialog() {
  const [open, setOpen] = useState(false);
  const [loc, setLoc] = useState("");
  const router = useRouter();
  const { locations } = useLocationLookup();
  const openCount = useOpenCount();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!loc) return;
    try {
      const c = await openCount.mutateAsync(loc);
      setOpen(false);
      router.push(`/warehouse/stock-counts/${c.id}`);
    } catch (err) {
      toastError(err);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus /> Open count</Button></DialogTrigger>
      <DialogContent title="Open a stock count" description="Counts one bin. System quantities are snapshotted as the baseline.">
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Bin to count">
            <Select value={loc} onChange={(e) => setLoc(e.target.value)} required>
              <option value="">Choose bin…</option>
              {locations.filter((l) => l.is_active).map((l) => <option key={l.id} value={l.id}>{l.code}</option>)}
            </Select>
          </Field>
          <Button type="submit" disabled={!loc || openCount.isPending}>{openCount.isPending ? "Opening…" : "Open count"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function StockCountsView() {
  const { can } = usePermissions();
  const router = useRouter();
  const { locations } = useLocationLookup();
  const [status, setStatus] = useState("");
  const [locationId, setLocationId] = useState("");
  const [offset, setOffset] = useState(0);
  const q = useStockCounts({ status: status || undefined, location_id: locationId || undefined, offset });

  return (
    <RequirePermission allowed={can("stock:view")}>
      <PageHeader title="Stock counts" description="Reconcile what is on the shelf with what the system says. Nothing changes until a count is approved." actions={can("stock:transfer") ? <OpenCountDialog /> : undefined} />
      <Card>
        <div className="flex flex-wrap gap-2 border-b p-3">
          <Select className="w-44" value={status} onChange={(e) => { setStatus(e.target.value); setOffset(0); }} aria-label="Status">
            <option value="">All statuses</option><option value="open">Open</option><option value="submitted">Submitted</option><option value="approved">Approved</option><option value="cancelled">Cancelled</option>
          </Select>
          <Select className="w-44" value={locationId} onChange={(e) => { setLocationId(e.target.value); setOffset(0); }} aria-label="Bin">
            <option value="">All bins</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.code}</option>)}
          </Select>
        </div>
        <DataTable<StockCount>
          data={q.data} isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()} offset={offset} onOffsetChange={setOffset}
          emptyTitle="No stock counts" onRowClick={(r) => router.push(`/warehouse/stock-counts/${r.id}`)}
          columns={[
            { header: "Count", accessorKey: "id", cell: (c) => <span className="font-mono text-xs">{shortId(c.getValue() as string)}</span> },
            { header: "Bin", accessorKey: "location_id", cell: (c) => <LocationLabel id={c.getValue() as string} /> },
            { header: "Status", accessorKey: "status", cell: (c) => <StatusBadge status={c.getValue() as string} /> },
            { header: "Variances", id: "var", cell: (c) => { const n = c.row.original.lines.filter((l) => l.variance).length; return n ? <span className="font-semibold text-warning">{n}</span> : "0"; } },
            { header: "Opened", accessorKey: "created_at", cell: (c) => formatDate(c.getValue() as string) },
          ]}
        />
      </Card>
    </RequirePermission>
  );
}
