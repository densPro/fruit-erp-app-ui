"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { putawayApi } from "../api";

export function useCreatePutaway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: putawayApi.create,
    onSuccess: () => {
      toast.success("Stock moved");
      return Promise.all(["levels", "movements"].map((k) => qc.invalidateQueries({ queryKey: ["wh", k] })));
    },
  });
}
