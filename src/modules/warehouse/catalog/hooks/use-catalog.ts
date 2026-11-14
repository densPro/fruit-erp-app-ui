"use client";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useErrors } from "@/lib/errors";
import { catalogApi } from "../api";

const LIMIT = 20;

export function useItems(params: { q?: string; active?: boolean; offset: number }) {
  return useQuery({
    queryKey: ["wh", "items", params],
    queryFn: () => catalogApi.listItems({ ...params, limit: LIMIT }),
    placeholderData: keepPreviousData,
  });
}

export function useLocations(params: { zone?: string; active?: boolean; offset: number }) {
  return useQuery({
    queryKey: ["wh", "locations", params],
    queryFn: () => catalogApi.listLocations({ ...params, limit: LIMIT }),
    placeholderData: keepPreviousData,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => Promise.all([qc.invalidateQueries({ queryKey: ["wh", "items"] }), qc.invalidateQueries({ queryKey: ["wh", "locations"] }), qc.invalidateQueries({ queryKey: ["wh", "lookup"] })]);
}

export function useCreateItem() {
  const inv = useInvalidate();
  const t = useTranslations("warehouse.catalog.items");
  return useMutation({ mutationFn: catalogApi.createItem, onSuccess: () => { toast.success(t("createdToast")); return inv(); } });
}
export function useUpdateItem() {
  const inv = useInvalidate();
  const t = useTranslations("warehouse.catalog.items");
  const { toastError } = useErrors();
  return useMutation({
    mutationFn: ({ id, ...b }: { id: string; name?: string; unit?: string; is_active?: boolean }) => catalogApi.updateItem(id, b),
    onSuccess: () => { toast.success(t("updatedToast")); return inv(); },
    onError: toastError,
  });
}
export function useCreateLocation() {
  const inv = useInvalidate();
  const t = useTranslations("warehouse.catalog.locations");
  return useMutation({ mutationFn: catalogApi.createLocation, onSuccess: () => { toast.success(t("createdToast")); return inv(); } });
}
export function useUpdateLocation() {
  const inv = useInvalidate();
  const t = useTranslations("warehouse.catalog.locations");
  const { toastError } = useErrors();
  return useMutation({
    mutationFn: ({ id, ...b }: { id: string; zone?: string; is_active?: boolean }) => catalogApi.updateLocation(id, b),
    onSuccess: () => { toast.success(t("updatedToast")); return inv(); },
    onError: toastError,
  });
}
