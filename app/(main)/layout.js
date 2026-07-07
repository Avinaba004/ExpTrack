import React from 'react';
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { FloatingChat } from "@/components/floating-chat";

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#f8f9fa] dark:bg-[#0c0f12]">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
      <FloatingChat />
    </div>
  );
}

export default MainLayout;
