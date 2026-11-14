import type { Messages } from "next-intl";
import {
  Boxes, ClipboardCheck, ClipboardList, History, LayoutDashboard, MapPin, Package, PackageCheck,
  ScrollText, Truck, ArrowRightLeft, type LucideIcon,
} from "lucide-react";

/** Labels are message keys under `shell.nav` / `shell.modules` (messages/*.json). */
export type NavItem = { href: string; labelKey: keyof Messages["shell"]["nav"]; icon: LucideIcon; permission: string };
export type ModuleDef = { id: keyof Messages["shell"]["modules"]; items: NavItem[] };

/** Registry of ERP modules. Add a service here to show it in the shell. */
export const MODULES: ModuleDef[] = [
  {
    id: "warehouse",
    items: [
      { href: "/warehouse", labelKey: "dashboard", icon: LayoutDashboard, permission: "stock:view" },
      { href: "/warehouse/items", labelKey: "items", icon: Package, permission: "stock:view" },
      { href: "/warehouse/locations", labelKey: "locations", icon: MapPin, permission: "stock:view" },
      { href: "/warehouse/stock-levels", labelKey: "stockLevels", icon: Boxes, permission: "stock:view" },
      { href: "/warehouse/movements", labelKey: "movements", icon: History, permission: "stock:view" },
      { href: "/warehouse/purchase-orders", labelKey: "purchaseOrders", icon: ScrollText, permission: "purchase:view" },
      { href: "/warehouse/receipts", labelKey: "receipts", icon: Truck, permission: "stock:view" },
      { href: "/warehouse/putaway", labelKey: "putaway", icon: ArrowRightLeft, permission: "stock:transfer" },
      { href: "/warehouse/pick-lists", labelKey: "pickLists", icon: ClipboardList, permission: "stock:view" },
      { href: "/warehouse/stock-counts", labelKey: "stockCounts", icon: ClipboardCheck, permission: "stock:view" },
    ],
  },
];

export const ICON_FALLBACK = PackageCheck;
