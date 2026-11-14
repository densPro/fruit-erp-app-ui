"use client";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pickingApi } from "../api";

const stockKeys = ["levels", "movements", "picks", "pick"];

export function usePickLists(p: { status?: string; reference?: string; offset: number }) {
  return useQuery({ queryKey: ["wh", "picks", p], queryFn: () => pickingApi.list({ ...p, limit: 20 }), placeholderData: keepPreviousData });
}
export function usePickList(id: string) {
  return useQuery({ queryKey: ["wh", "pick", id], queryFn: () => pickingApi.get(id) });
}
export function useCreatePickList() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: pickingApi.create, onSuccess: () => { toast.success("Pick list created"); return qc.invalidateQueries({ queryKey: ["wh", "picks"] }); } });
}
export function useConfirmPick(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lineId, quantity }: { lineId: string; quantity?: number }) => pickingApi.confirm(id, lineId, quantity),
    onSuccess: () => { toast.success("Pick confirmed"); return Promise.all(stockKeys.map((k) => qc.invalidateQueries({ queryKey: ["wh", k] }))); },
  });
}
export function useCancelPickList(id: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => pickingApi.cancel(id), onSuccess: () => { toast.success("Pick list cancelled"); return Promise.all(stockKeys.map((k) => qc.invalidateQueries({ queryKey: ["wh", k] }))); } });
}
