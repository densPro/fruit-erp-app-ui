"use client";
import Link from "next/link";
import { AlertTriangle, ClipboardCheck, ClipboardList, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { usePickLists } from "../picking";
import { useReceipts } from "../receiving";
import { useStockCounts } from "../stock-counts";

function Tile({ title, icon: Icon, href, value, loading, hint }: { title: string; icon: LucideIcon; href: string; value?: number; loading: boolean; hint: string }) {
  return (
    <Link href={href} className="block rounded-lg focus-visible:outline-2">
      <Card className="transition-colors hover:bg-muted">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Icon className="size-4 text-primary" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-9 w-16" /> : <p className="text-3xl font-semibold tabular-nums">{value ?? 0}</p>}
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function WarehouseDashboard() {
  const { can } = usePermissions();
  const openCounts = useStockCounts({ status: "open", offset: 0 });
  const submitted = useStockCounts({ status: "submitted", offset: 0 });
  const bad = useReceipts({ has_discrepancy: true, offset: 0 });
  const openPicks = usePickLists({ status: "open", offset: 0 });
  const inProgress = usePickLists({ status: "in_progress", offset: 0 });

  return (
    <RequirePermission allowed={can("stock:view")}>
      <PageHeader title="Warehouse" description="What needs attention right now." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile title="Receipts with discrepancies" icon={AlertTriangle} href="/warehouse/receipts" value={bad.data?.total} loading={bad.isLoading} hint="Short, over or unexpected deliveries" />
        <Tile title="Active pick lists" icon={ClipboardList} href="/warehouse/pick-lists" value={(openPicks.data?.total ?? 0) + (inProgress.data?.total ?? 0)} loading={openPicks.isLoading || inProgress.isLoading} hint="Open or in progress" />
        <Tile title="Counts in progress" icon={ClipboardCheck} href="/warehouse/stock-counts" value={openCounts.data?.total} loading={openCounts.isLoading} hint="Being counted on the floor" />
        <Tile title="Counts awaiting approval" icon={ClipboardCheck} href="/warehouse/stock-counts" value={submitted.data?.total} loading={submitted.isLoading} hint="Submitted, stock not yet adjusted" />
      </div>
    </RequirePermission>
  );
}
