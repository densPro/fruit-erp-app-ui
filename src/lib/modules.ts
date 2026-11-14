import {
  Boxes, ClipboardCheck, ClipboardList, History, LayoutDashboard, MapPin, Package, PackageCheck,
  ScrollText, Truck, ArrowRightLeft, type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; permission: string };
export type ModuleDef = { id: string; label: string; items: NavItem[] };

/** Registry of ERP modules. Add a service here to show it in the shell. */
export const MODULES: ModuleDef[] = [
  {
    id: "warehouse",
    label: "Warehouse",
    items: [
      { href: "/warehouse", label: "Dashboard", icon: LayoutDashboard, permission: "stock:view" },
      { href: "/warehouse/items", label: "Items", icon: Package, permission: "stock:view" },
      { href: "/warehouse/locations", label: "Locations", icon: MapPin, permission: "stock:view" },
      { href: "/warehouse/stock-levels", label: "Stock levels", icon: Boxes, permission: "stock:view" },
      { href: "/warehouse/movements", label: "Movement ledger", icon: History, permission: "stock:view" },
      { href: "/warehouse/purchase-orders", label: "Purchase orders", icon: ScrollText, permission: "purchase:view" },
      { href: "/warehouse/receipts", label: "Goods receipts", icon: Truck, permission: "stock:view" },
      { href: "/warehouse/putaway", label: "Put-away", icon: ArrowRightLeft, permission: "stock:transfer" },
      { href: "/warehouse/pick-lists", label: "Pick lists", icon: ClipboardList, permission: "stock:view" },
      { href: "/warehouse/stock-counts", label: "Stock counts", icon: ClipboardCheck, permission: "stock:view" },
    ],
  },
];

export const ICON_FALLBACK = PackageCheck;
