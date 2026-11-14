"use client";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { EmptyState, ErrorState } from "@/components/common/states";
import type { Page } from "@/lib/api";

export const PAGE_SIZE = 20;

type Props<T> = {
  columns: ColumnDef<T, unknown>[];
  data?: Page<T>;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  offset: number;
  onOffsetChange: (offset: number) => void;
  emptyTitle?: string;
  emptyHint?: string;
  onRowClick?: (row: T) => void;
};

/** Server-side paginated table with loading, empty and error states. */
export function DataTable<T>({
  columns, data, isLoading, error, onRetry, offset, onOffsetChange, emptyTitle = "Nothing here yet", emptyHint, onRowClick,
}: Props<T>) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data: data?.items ?? [], columns, getCoreRowModel: getCoreRowModel(), manualPagination: true });

  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (isLoading)
    return (
      <div className="grid gap-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9" />
        ))}
      </div>
    );
  if (!data?.items.length) return <EmptyState title={emptyTitle} hint={emptyHint} />;

  const total = data.total;
  const from = offset + 1;
  const to = Math.min(offset + data.items.length, total);

  return (
    <div>
      <Table>
        <THead>
          {table.getHeaderGroups().map((hg) => (
            <TR key={hg.id} className="hover:bg-transparent">
              {hg.headers.map((h) => (
                <TH key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TH>
              ))}
            </TR>
          ))}
        </THead>
        <TBody>
          {table.getRowModel().rows.map((row) => (
            <TR key={row.id} className={onRowClick ? "cursor-pointer" : undefined} onClick={onRowClick ? () => onRowClick(row.original) : undefined}>
              {row.getVisibleCells().map((cell) => (
                <TD key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TD>
              ))}
            </TR>
          ))}
        </TBody>
      </Table>
      <div className="flex items-center justify-between border-t px-3 py-2 text-sm text-muted-foreground">
        <span>
          {from}-{to} of {total}
        </span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => onOffsetChange(Math.max(0, offset - PAGE_SIZE))} aria-label="Previous page">
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="sm" disabled={to >= total} onClick={() => onOffsetChange(offset + PAGE_SIZE)} aria-label="Next page">
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
