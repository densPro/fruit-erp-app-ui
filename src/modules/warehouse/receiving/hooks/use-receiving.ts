"use client";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { receivingApi } from "../api";

export function usePurchaseOrders(p: { status?: string; offset: number }) {
  return useQuery({ queryKey: ["wh", "pos", p], queryFn: () => receivingApi.listPOs({ ...p, limit: 20 }), placeholderData: keepPreviousData });
}
export function usePurchaseOrder(id: string | undefined) {
  return useQuery({ queryKey: ["wh", "po", id], queryFn: () => receivingApi.getPO(id!), enabled: !!id });
}
export function useReceipts(p: { purchase_order_id?: string; has_discrepancy?: boolean; offset: number }) {
  return useQuery({ queryKey: ["wh", "receipts", p], queryFn: () => receivingApi.listReceipts({ ...p, limit: 20 }), placeholderData: keepPreviousData });
}
export function useReceipt(id: string) {
  return useQuery({ queryKey: ["wh", "receipt", id], queryFn: () => receivingApi.getReceipt(id) });
}
export function useCreatePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: receivingApi.createPO,
    onSuccess: () => { toast.success("Purchase order created"); return qc.invalidateQueries({ queryKey: ["wh", "pos"] }); },
  });
}
export function useCreateReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: receivingApi.createReceipt,
    onSuccess: (r) => {
      if (r.has_discrepancy) toast.warning("Receipt booked with discrepancies. Review the flagged lines.");
      else toast.success("Receipt booked into the receiving dock");
      return Promise.all(["receipts", "pos", "po", "levels", "movements"].map((k) => qc.invalidateQueries({ queryKey: ["wh", k] })));
    },
  });
}
