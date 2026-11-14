import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", {
  variants: {
    tone: {
      neutral: "bg-muted text-foreground",
      success: "bg-success text-success-foreground ring-1 ring-inset ring-brand-500/40",
      info: "bg-primary text-primary-foreground",
      warning: "bg-warning text-warning-foreground",
      danger: "bg-danger text-danger-foreground",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Badge({ tone, className, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

const STATUS_TONE: Record<string, VariantProps<typeof badgeVariants>["tone"]> = {
  open: "info", counting: "info", submitted: "warning", approved: "success", cancelled: "neutral",
  completed: "success", picked: "success", pending: "warning", in_progress: "info", partial: "warning",
  received: "success", partially_received: "warning", short: "warning", over: "warning", unexpected: "danger",
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return null;
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{status.replaceAll("_", " ")}</Badge>;
}
