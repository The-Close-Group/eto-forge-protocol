// import { SidebarProvider } from "@/components/ui/sidebar";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { RouteTransition } from "@/components/RouteTransition";
interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <DesktopSidebar />
      
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <RouteTransition>
          {children}
        </RouteTransition>
      </main>
      
      <MobileBottomNav />
    </div>
  );
}
