import React from 'react';
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { FloatingChat } from "@/components/floating-chat";
import { SidebarProvider } from "@/components/sidebar-context";

const MainLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#f8f9fa] dark:bg-[#0c0f12] overflow-x-hidden">
        {/* Sidebar - Desktop only (md and up) */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
        <FloatingChat />
      </div>
    </SidebarProvider>
  );
}

export default MainLayout;

