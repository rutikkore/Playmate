import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AppLayout() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile Header */}
      <header className="md:hidden flex h-16 w-full items-center justify-between px-4 bg-sidebar border-b border-sidebar-border sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img src="/favicon.png" alt="Playmate Logo" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold tracking-tight neon-text">PlayMate</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground hover:bg-secondary">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-r border-sidebar-border text-foreground">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <AppSidebar isMobile onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}

