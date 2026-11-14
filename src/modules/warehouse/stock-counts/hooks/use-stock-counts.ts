"use client";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { stockCountsApi } from "../api";

export function useStockCounts(p: { status?: string; location_id?: string; offset: number }) {
  return useQuery({ queryKey: ["wh", "counts", p], queryFn: () => stockCountsApi.list({ ...p, limit: 20 }), placeholderData: keepPreviousData });
}
export function useStockCount(id: string) {
  return useQuery({ queryKey: ["wh", "count", id], queryFn: () => stockCountsApi.get(id) });
}

function useRefresh() {
  const qc = useQueryClient();
  return (extra: string[] = []) =>
    Promise.all(["counts", "count", ...extra].map((k) => qc.invalidateQueries({ queryKey: ["wh", k] })));
}

export function useOpenCount() {
  const refresh = useRefresh();
  const t = useTranslations("warehouse.stockCounts");
  return useMutation({ mutationFn: stockCountsApi.open, onSuccess: () => { toast.success(t("openedToast")); return refresh(); } });
}
export function useRecordLines(id: string) {
  const refresh = useRefresh();
  const t = useTranslations("warehouse.stockCounts");
  return useMutation({ mutationFn: (lines: { item_id: string; counted_qty: number }[]) => stockCountsApi.record(id, lines), onSuccess: () => { toast.success(t("savedToast")); return refresh(); } });
}
export function useSubmitCount(id: string) {
  const refresh = useRefresh();
  const t = useTranslations("warehouse.stockCounts");
  return useMutation({ mutationFn: () => stockCountsApi.submit(id), onSuccess: () => { toast.success(t("submittedToast")); return refresh(); } });
}
export function useApproveCount(id: string) {
  const refresh = useRefresh();
  const t = useTranslations("warehouse.stockCounts");
  return useMutation({
    mutationFn: (reason: string) => stockCountsApi.approve(id, reason),
    onSuccess: () => { toast.success(t("approvedToast")); return refresh(["levels", "movements"]); },
  });
}
export function useCancelCount(id: string) {
  const refresh = useRefresh();
  const t = useTranslations("warehouse.stockCounts");
  return useMutation({ mutationFn: () => stockCountsApi.cancel(id), onSuccess: () => { toast.success(t("cancelledToast")); return refresh(); } });
}
