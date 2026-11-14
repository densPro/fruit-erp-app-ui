"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Select } from "@/components/ui/input";
import { DataTable } from "@/components/data/data-table";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { useErrors } from "@/lib/errors";
import { shortId } from "@/lib/utils";
import { useFormatDate } from "@/lib/i18n/format";
import { LocationLabel, useLocationLookup } from "../../shared/lookups";
import { useOpenCount, useStockCounts } from "../hooks/use-stock-counts";
import type { StockCount } from "../types";

function OpenCountDialog() {
  const [open, setOpen] = useState(false);
  const [loc, setLoc] = useState("");
  const router = useRouter();
  const { locations } = useLocationLookup();
  const openCount = useOpenCount();
  const t = useTranslations("warehouse.stockCounts");
  const tc = useTranslations("common");
  const { toastError } = useErrors();
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
      <DialogTrigger asChild><Button><Plus /> {t("openCount")}</Button></DialogTrigger>
      <DialogContent title={t("openDialogTitle")} description={t("openDialogDescription")}>
        <form onSubmit={submit} className="grid gap-4">
          <Field label={t("binToCount")}>
            <Select value={loc} onChange={(e) => setLoc(e.target.value)} required>
              <option value="">{tc("chooseBin")}</option>
              {locations.filter((l) => l.is_active).map((l) => <option key={l.id} value={l.id}>{l.code}</option>)}
            </Select>
          </Field>
          <Button type="submit" disabled={!loc || openCount.isPending}>{openCount.isPending ? t("opening") : t("openCount")}</Button>
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
  const t = useTranslations("warehouse.stockCounts");
  const tc = useTranslations("common");
  const formatDate = useFormatDate();
  const [offset, setOffset] = useState(0);
  const q = useStockCounts({ status: status || undefined, location_id: locationId || undefined, offset });

  return (
    <RequirePermission allowed={can("stock:view")}>
      <PageHeader title={t("title")} description={t("description")} actions={can("stock:transfer") ? <OpenCountDialog /> : undefined} />
      <Card>
        <div className="flex flex-wrap gap-2 border-b p-3">
          <Select className="w-44" value={status} onChange={(e) => { setStatus(e.target.value); setOffset(0); }} aria-label={tc("status")}>
            <option value="">{tc("allStatuses")}</option><option value="open">{t("statusOpen")}</option><option value="submitted">{t("statusSubmitted")}</option><option value="approved">{t("statusApproved")}</option><option value="cancelled">{t("statusCancelled")}</option>
          </Select>
          <Select className="w-44" value={locationId} onChange={(e) => { setLocationId(e.target.value); setOffset(0); }} aria-label={tc("bin")}>
            <option value="">{tc("allBins")}</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.code}</option>)}
          </Select>
        </div>
        <DataTable<StockCount>
          data={q.data} isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()} offset={offset} onOffsetChange={setOffset}
          emptyTitle={t("empty")} onRowClick={(r) => router.push(`/warehouse/stock-counts/${r.id}`)}
          columns={[
            { header: t("count"), accessorKey: "id", cell: (c) => <span className="font-mono text-xs">{shortId(c.getValue() as string)}</span> },
            { header: tc("bin"), accessorKey: "location_id", cell: (c) => <LocationLabel id={c.getValue() as string} /> },
            { header: tc("status"), accessorKey: "status", cell: (c) => <StatusBadge status={c.getValue() as string} /> },
            { header: t("variances"), id: "var", cell: (c) => { const n = c.row.original.lines.filter((l) => l.variance).length; return n ? <span className="font-semibold text-warning">{n}</span> : "0"; } },
            { header: t("opened"), accessorKey: "created_at", cell: (c) => formatDate(c.getValue() as string) },
          ]}
        />
      </Card>
    </RequirePermission>
  );
}
