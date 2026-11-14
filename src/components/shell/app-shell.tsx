"use client";
import { Suspense, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 lg:block">
        <Suspense>
          <Sidebar />
        </Suspense>
      </aside>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title="Menu" className="left-0 top-0 h-full max-h-none w-72 max-w-[85%] translate-x-0 translate-y-0 rounded-none p-0">
          <Suspense>
            <Sidebar onNavigate={() => setOpen(false)} />
          </Suspense>
        </DialogContent>
      </Dialog>
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <Suspense>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
