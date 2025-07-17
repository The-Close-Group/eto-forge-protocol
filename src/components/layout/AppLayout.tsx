import { SidebarProvider } from "@/components/ui/sidebar";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNav } from "./MobileBottomNav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DesktopSidebar />
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}