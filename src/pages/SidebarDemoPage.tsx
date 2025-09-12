import SidebarDemo from "@/components/sidebar-demo";
import SEO from "@/components/SEO";

export default function SidebarDemoPage() {
  return (
    <>
      <SEO 
        title="Sidebar Demo - Aceternity Integration"
        description="Interactive sidebar demonstration with hover animations and responsive design"
      />
      <div className="h-screen w-full">
        <SidebarDemo />
      </div>
    </>
  );
}