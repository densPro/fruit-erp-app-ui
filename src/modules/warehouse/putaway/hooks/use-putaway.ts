"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { putawayApi } from "../api";

export function useCreatePutaway() {
  const qc = useQueryClient();
  const t = useTranslations("warehouse.putaway");
  return useMutation({
    mutationFn: putawayApi.create,
    onSuccess: () => {
      toast.success(t("movedToast"));
      return Promise.all(["levels", "movements"].map((k) => qc.invalidateQueries({ queryKey: ["wh", k] })));
    },
  });
}
